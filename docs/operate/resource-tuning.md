---
sidebar_position: 4
id: image-processing-reference
slug: /reference/image-processing-reference
title: Resource Tuning
sidebar_label: "Resource Tuning"
---

Konifer uses **[libvips](https://www.libvips.org/)** to transform images. Libvips processes images through a
demand-driven pipeline and can stream small regions instead of loading every decoded pixel into memory.

This design reduces memory use and latency when Konifer processes large images.

:::caution
Libvips must buffer an entire progressive JPEG before processing it. Progressive JPEGs display in increasing detail as
they download, but they can consume more processing memory than baseline JPEGs. Avoid large progressive JPEG uploads
when memory is constrained.
:::

## Memory Management

Konifer uses three memory regions:

1. **JVM heap** stores application state, routing data, and request information. Configure it with `-Xmx` or
   `-XX:MaxRAMPercentage`.
2. **Direct memory** stores Netty I/O buffers used for network requests and uploads. Configure it with
   `-XX:MaxDirectMemorySize`.
3. **Native memory** stores decoded pixels and libvips processing data. JVM memory flags do not limit this region.

### Managing Out of Memory Errors

Use the reported error to identify which memory region needs attention:

1. **`OutOfMemoryError: Java heap space`**

   - **Cause**: Application state or metadata exhausted the JVM heap.
   - **Action**: Increase `-Xmx` or `-XX:MaxRAMPercentage`.

1. **`OutOfMemoryError: Direct buffer memory`**

   - **Cause**: Netty exhausted its I/O buffers, often during concurrent uploads.
   - **Action**: Increase `-XX:MaxDirectMemorySize`. Without an explicit value, the limit often follows the heap size.

1. **Container `OOMKilled` (exit code 137)**

   - **Cause**: The process exceeded the container memory limit, often because libvips needed more native memory.
   - **Action**: Increase the container limit or reduce the JVM's share of that limit with a lower
     `-XX:MaxRAMPercentage`.

## Temporary Files

Konifer writes temporary processing files to `/app/tmp`. Without a mount, these files use the container's writable
layer. Mount a fast persistent volume or RAM-backed `tmpfs` at this path when the writable layer is too slow.

### Using a RAM disk ([tmpfs](https://www.kernel.org/doc/html/latest/filesystems/tmpfs.html))

```shell
docker run -d \
--name konifer \
# Mounts a RAM disk directly to the temp location
--tmpfs /app/tmp \
your-registry/konifer:latest
```

### Using Outside Volume

Use a persistent volume when temporary files may exceed the memory available for `tmpfs`.

```shell
docker run -d \
  --name konifer \
  # Mounts a host directory to the temp location
  -v /mnt/fast-ssd/konifer-tmp:/app/tmp \
  your-registry/konifer:latest
```

## Variant Workers

Konifer limits concurrent image transformations with a bounded worker pool. Requests wait in queues when every worker
is busy.

### Concurrency Limit

By default, the worker count is `available CPU cores * 2`.

**Example:** On a 4-core system, Konifer initializes eight Variant Workers.

### Configuration

Override the worker count in `konifer.conf`:

```hocon
variant-generation {
    # Overrides the auto-detection mechanism
    workers = 10
}
```

## Scheduling & Priority

Konifer prioritizes requests with a waiting client over background eager generation.

### Priority

1. **Synchronous (high priority)**: A client waits for these tasks to complete.

   - On-demand variants
   - Preprocessing during upload

1. **Asynchronous (low priority)**: Konifer runs these tasks in the background on a best-effort basis.

   - Eager variants

:::note
If a client requests an eager variant that is missing or still queued, Konifer schedules a high-priority on-demand task
and discards the corresponding eager task.
:::

### Configuring Priority

The scheduler assigns 80% of contested worker capacity to synchronous tasks and 20% to asynchronous tasks by default.
The asynchronous share keeps background work moving while synchronous requests are queued.

:::note
Weighting applies only when both queues contain work. If only asynchronous tasks are queued, workers continue processing
that queue until synchronous work arrives.
:::

To change the weighting:

```hocon
variant-generation {
    # Sets the target allocation for Synchronous tasks (0-100).
    # Asynchronous allocation is automatically calculated as (100 - synchronous-priority).
    synchronous-priority = 60
}
```
