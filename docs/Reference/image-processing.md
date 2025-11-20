---
sidebar_position: 3
id: image-processing-reference
title: Image Processing Architecture
sidebar_label: "Image Processing"
---

# ⚙️ Image Processing Architecture

Direkt leverages **[libvips](https://www.libvips.org/)** as its underlying transformation engine. Libvips is a 
demand-driven, streaming image processing library. Unlike traditional image processors (like ImageMagick), libvips does 
not load the entire image into memory. Instead, it streams the image in small chunks, processing them via a pipeline.

This architecture allows Direkt to handle large assets (e.g., 100MB+ images) with a very small memory footprint and 
extremely low latency.

## 🧠 Memory Management

Because Direkt is a Kotlin application running on the JVM, but libvips is a native C library, memory is managed in two 
distinct zones:

1.  **JVM Heap:** Manages the application logic, HTTP layer, and request metadata.
2.  **Native (Off-Heap) Memory:** Manages the actual image buffers and pixel data used by libvips.

> ⚠️ **Operational Warning: Memory Tuning**
> Increasing the JVM Heap size (via `-Xmx`) **will not** help if you are seeing memory pressure during image processing.
>
> Libvips allocates memory **off-heap**. If you observe the container running out of memory (OOM), you must increase 
> the total container memory limit, not the JVM heap.

## 🧵 Variant Workers

Direkt utilizes a bounded thread pool to manage concurrent image transformations. This prevents the server from being 
overwhelmed by a sudden spike in complex transformation requests.

### Concurrency Limit
By default, Direkt calculates the worker pool size using the formula: `Available CPU Cores * 2`.

**Example:** On a 4-core system, Direkt initializes **8 Variant Workers**. This 2x over-provisioning is efficient 
because image processing is often I/O bound (reading/writing to the object store), allowing the CPU to switch contexts 
while waiting for data.

### Configuration
You can manually override the worker count in `direkt.conf`:

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
    - Pre-processing

2. **Asynchronous (Low Priority)**: These are best-effort transformations that occur within an asynchronous context. 
    - Eager variants

> 💡 Fallback Mechanism: If a client requests an Eager Variant that hasn't been processed yet (e.g., due to a long queue)
> or failed to be processed (e.g., the server shutdown with a full queue), Direkt immediately schedules an On-Demand 
> variant task and the respective Eager Variant task is discarded.

### Configuring Weights

The scheduler uses a probabilistic weighting system. By default, it attempts to dedicate 80% of throughput to 
Synchronous tasks and 20% to Asynchronous tasks.

This ensures that background work continues to progress (preventing starvation) without degrading API responsiveness.

> **Note**: this wighting is only considered when queues are full. If only Asynchronous tasks are queued, that queue is 
> pulled from until Synchronous tasks are queued. In other words, the scheduler's algorithm leverages work-stealing. 

To change this weighting:
```hocon
variant-generation {
  # Sets the target allocation for Synchronous tasks (0-100).
  # Asynchronous allocation is automatically calculated as (100 - synchronous-priority).
  synchronous-priority = 60
}
```
