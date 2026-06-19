---
sidebar_position: 1
id: concepts-variants
title: Variants
sidebar_label: "Overview"
---

A variant represents a specific, transformed version of the asset's content. It is generated using the
transformation options available within Konifer (e.g., resizing, cropping, format change).

A variant is composed of:

1. **Attributes**: Properties of the variant, such as its `height`, `width`, and `mimeType`.
2. **Transformation**: The specific operations applied to the **Original Variant** to create *this* variant
   (e.g., `rotate: 90`, `blur: 2`).

## Original Variant

The Original Variant is the physical representation of the asset content supplied during the Store Assets request.
**All other variants for this asset are transformed *from* the Original Variant.**

Only pre-processing defined in your configuration (e.g., applying a global `max-width` limit or file format conversion)
can transform the supplied content into the Original Variant. If no pre-processing is configured or applied, the
Original Variant is the exact representation of the supplied content.

## Variant Types

Variants can be generated in two different ways (in addition to Ingest Transformations):

- Eager variant generation
- On-demand variant generation

### Eager Variant Generation

You may know which variants you need at the time you store the asset. Eager variants are generated at the time of
upload; however, the generation is asynchronous and best-effort. The Store Asset API returns before eager variants are
generated; however, a background process to generate them is kicked off at the time of upload.

:::info
Eager variants can only be defined using [variant profiles](variant-profiles.md).
:::

#### Best-effort

Eager variants are generated on a best-effort basis. If your Konifer instance is killed or the variant fails to generate
for any reason, generation is not rescheduled. When you request the variant, it will simply be generated on-demand.

#### Configuration

Eager variants are defined in your path configuration. The following configuration generates two different variants.

```hocon
variant-profiles {
  small {
    h = 50
    w = 50
    fit = cover
    mimeType = "image/png"
  }
  medium {
    h = 100
    w = 100
    fit = cover
    mimeType = "image/png"
  }
}

paths {
  "/users/**" {
    transform {
      eager-variants = [
        small,
        medium
      ]
    }
  }
}
```

### On-demand Variant Generation

Whenever the Fetch Asset API is invoked and manipulation arguments are supplied (e.g. `w`, `h`, `g`, etc.), a variant
is generated from the Original Variant on-demand. The variant is also cached in your configured object store. See
[Variant Caching](caching.md) for how Konifer stores and reuses generated variants.

## On-demand Variant Generation Modes

By default, on-demand variants are allowed to be generated and are cached in your configured object store. You can disable 
or limit on-demand variants using the `transform.on-demand-variant.mode` Path Configuration. The default setting is `enabled`.

- **`profile_only`**: Only `profile` can be supplied. This enables you to limit variant transformations to only
those defined as [variant profiles](variant-profiles.md).
- **`disabled`**: On-demand variants are disabled. Only eager variants are allowed. In the event that an eager variant has 
not been generated at the time of request, it can still be generated on-demand.

## Deleting your Asset

Deleting your asset results in all variants belonging to the asset also being deleted.
