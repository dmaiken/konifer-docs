---
sidebar_position: 4
id: image-processing-reference
slug: /reference/image-processing-reference
title: Resource Tuning
sidebar_label: "Resource Tuning"
---

Konifer uses [libvips](https://www.libvips.org/) to transform images. Libvips processes image regions on demand to reduce
memory use, though some inputs, including progressive JPEGs, require buffering the entire image.

## Memory Management

Konifer uses three memory regions:

| Region        | Contents                                                 | JVM setting                               |
| :------------ | :------------------------------------------------------- | :---------------------------------------- |
| JVM heap      | Application state, routing data, and request information | `-Xmx` or `-XX:MaxRAMPercentage`          |
| Direct memory | Netty I/O buffers for network requests and uploads       | `-XX:MaxDirectMemorySize`                 |
| Native memory | Decoded pixels and libvips processing data               | JVM memory flags do not limit this region |

The container memory limit must accommodate all three regions.

### Out of Memory Errors

| Error                                    | Memory region                                         | Adjustment                                                                                            |
| :--------------------------------------- | :---------------------------------------------------- | :---------------------------------------------------------------------------------------------------- |
| `OutOfMemoryError: Java heap space`      | JVM heap                                              | Increase `-Xmx` or `-XX:MaxRAMPercentage`.                                                            |
| `OutOfMemoryError: Direct buffer memory` | Netty I/O buffers, often during concurrent uploads    | Increase `-XX:MaxDirectMemorySize`. Without an explicit value, the limit often follows the heap size. |
| Container `OOMKilled`                    | Total process memory, including native allocations    | Increase the container limit or reduce the JVM's share with a lower `-XX:MaxRAMPercentage`.           |

## Temporary Files

Konifer writes temporary processing files to `/app/tmp`. Without a mount, these files use the container's writable
layer. Mount disk storage or `tmpfs` at this path to change the backing storage:

```shell title="RAM-backed storage"
docker run -d \
  --name konifer \
  --tmpfs /app/tmp \
  ghcr.io/dmaiken/konifer:{{koniferVersion}}
```

```shell title="Disk-backed storage"
docker run -d \
  --name konifer \
  --mount type=bind,source=/mnt/fast-ssd/konifer-tmp,target=/app/tmp \
  ghcr.io/dmaiken/konifer:{{koniferVersion}}
```

Use disk storage when temporary files may exceed the memory available for `tmpfs`.

## Variant Workers

Konifer limits concurrent image transformations with a bounded worker pool. Requests wait in queues when all workers
are busy. The default worker count is the number of processors available to the JVM. Override it in `konifer.conf`:

```hocon
variant-generation {
    workers = 10
}
```

## Scheduling & Priority

Konifer prioritizes synchronous tasks, including on-demand variants and upload preprocessing, over background eager
variant generation. If a client requests a missing or queued eager variant, Konifer schedules a high-priority on-demand
task. The eager task remains queued, so both tasks can perform transformation work. Konifer cancels a duplicate upload
when it detects an existing variant record.

When both queues contain work, each worker has an 80% chance of selecting a synchronous task and a 20% chance of
selecting a background task by default. These probabilities govern task selection, not CPU time or reserved worker
capacity. If only one queue contains work, workers process that queue.

Set the synchronous selection percentage with `synchronous-priority`. The background percentage is the remainder:

```hocon
variant-generation {
    synchronous-priority = 60
}
```
