---
sidebar_position: 3
id: image-processing-reference
title: Image Processing Architecture
sidebar_label: "Image Processing"
---

# Image Processing Architecture
Konifer leverages **[libvips](https://www.libvips.org/)** as its underlying transformation engine. Libvips is a 
demand-driven, streaming image processing library. Unlike traditional image processors (like ImageMagick), libvips does 
not load the entire image into memory. Instead, it streams the image in small chunks, processing them via a pipeline.

This architecture allows Konifer to handle large assets (e.g., 100MB+ images) with a very small memory footprint and 
extremely low latency.

:::caution
Libvips will buffer the entire image if it is progressively-rendered JPEGs (image content is interlaced to provide a progressively-improving
display quality as the image is downloaded). Avoid ingestion of these images. 
:::

## Memory Management
Because Konifer is a Kotlin application running on the JVM (Netty) while utilizing libvips (C library) for processing, memory is managed in three distinct regions.
1. **JVM Heap**: Manages application logic, routing, and request metadata. Controlled by -Xmx.
2. **Direct Memory (Off-Heap)**: Manages Netty IO buffers for network uploads. Controlled by -XX:MaxDirectMemorySize.
3. **Native Memory (Off-Heap)**: Manages the actual image pixels processed by libvips. Not controlled by JVM flags.

### Managing Out of Memory Errors
If Konifer crashes, the error type determines the fix:

1. **`OutOfMemoryError: Java heap space`**
   - **Cause**: Application logic or metadata overhead has exhausted the Heap. 
   - **Fix**: Increase JVM Heap using -Xmx or -XX:MaxRAMPercentage.
2. **`OutOfMemoryError: Direct buffer memory`**
   - **Cause**: Netty has exhausted IO buffers, likely due to high concurrent uploads. 
   - **Fix**: Increase -XX:MaxDirectMemorySize. (Note: If unspecified, this often defaults to the Heap size).
3. **Container `OOMKilled` (Exit Code 137)**
   - **Cause**: libvips exhausted the remaining system RAM. The OS killed the container to save the host.
   - **Fix**: Increase the Container Memory Limit without increasing the JVM Heap (e.g., lower -XX:MaxRAMPercentage).

## Temporary Files
Konifer makes extensive use of temporary files for image processing. By default, these are created inside the container's 
writable layer, which can be slow. For improved performance, mount a fast volume (or RAM disk) to the `/app/tmp` directory. 
Konifer is pre-configured to check this location.

### Using a RAM disk (tmpfs)
```shell
docker run -d \
--name konifer \
# Mounts a RAM disk directly to the temp location
--tmpfs /app/tmp \
your-registry/konifer:latest
```

### Using Outside Volume
Use this if you process massive files that exceed your available RAM.
```shell
docker run -d \
  --name konifer \
  # Mounts a host directory to the temp location
  -v /mnt/fast-ssd/konifer-tmp:/app/tmp \
  your-registry/konifer:latest
```

## Variant Workers
Konifer utilizes a bounded thread pool to manage concurrent image transformations. This prevents the server from being 
overwhelmed by a sudden spike in complex transformation requests.

### Concurrency Limit
By default, Konifer calculates the worker pool size using the formula: `Available CPU Cores * 2`.

**Example:** On a 4-core system, Konifer initializes 8 Variant Workers.

### Configuration
You can manually override the worker count in `konifer.conf`:

```hocon
variant-generation {
  # Overrides the auto-detection mechanism
  workers = 10
}
```

## Scheduling & Priority
Not all transformations are equal. A user waiting for a webpage to load (On-Demand) is more critical than a background 
thumbnail generation task (Eager).

### Priority
1. **Synchronous (High Priority)**: These are tasks where a client is actively waiting for a response. The request is 
waiting until processing completes.
    - On-Demand Variants
    - Pre-processing original variants during upload

2. **Asynchronous (Low Priority)**: These are best-effort transformations that occur within an asynchronous context. 
    - Eager variants

:::note
Fallback Mechanism: If a client requests an Eager Variant that hasn't been processed yet (e.g., due to a long queue)
or failed to be processed (e.g., the server shutdown with a full queue), Konifer immediately schedules an On-Demand
variant task and the respective Eager Variant task is discarded.
:::

### Configuring Priority
The scheduler uses a probabilistic weighting system. By default, it attempts to dedicate 80% of throughput to 
Synchronous tasks and 20% to Asynchronous tasks.

This ensures that background work continues to progress (preventing starvation) without degrading API responsiveness.

:::note
This wighting is only considered when queues are full. If only Asynchronous tasks are queued, that queue is
pulled from until Synchronous tasks are queued. In other words, the scheduler's algorithm leverages work-stealing.
:::

To change this weighting:
```hocon
variant-generation {
  # Sets the target allocation for Synchronous tasks (0-100).
  # Asynchronous allocation is automatically calculated as (100 - synchronous-priority).
  synchronous-priority = 60
}
```
