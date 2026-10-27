---
sidebar_position: 1
id: concepts-variants
title: Variants
sidebar_label: "Overview"
---

A variant is a transformed version of an asset's image content, such as a resized thumbnail, cropped avatar, or WebP
conversion.

A variant is composed of:

1. **Attributes**: Properties of the output, such as its `height`, `width`, and `format`.
2. **Transformation**: The operations applied to the original variant, such as `rotate: 90` or `blur: 2`.

## Original Variant

The original variant is the image Konifer stores during the Store Assets request. Konifer creates every other variant
from this image.

Preprocessing can resize or convert the supplied content before Konifer stores it as the original variant. Without
preprocessing, the original variant contains the supplied image unchanged.

For example, one stored cow photo can supply a small avatar without replacing its original. Both images belong to the
same asset; the thumbnail is a generated variant.

<div className="doc-images doc-images--bottom">
  <figure className="doc-image">
    <img src="/image-transformations/sources/cow-original.jpg"
      alt="Original cow photo showing the surrounding mountain pasture"
      width="1365" height="1024" loading="lazy" decoding="async" />
    <figcaption>Original variant · JPG · 1365×1024 pixels</figcaption>
  </figure>
  <figure className="doc-image">
    <img src="/image-transformations/resizing/cow-thumbnail-128.webp" alt="Square WebP thumbnail cropped from the cow photo"
      width="128" height="128" loading="lazy" decoding="async" />
    <figcaption>Generated variant · WebP · 128×128 pixels · width=128&amp;h=128&amp;fit=fill</figcaption>
  </figure>
</div>

See [Image Transformation](../../reference/image-transformation-reference.md#image-resizing) for the resizing behavior
behind this thumbnail.

## Variant Types

Konifer generates variants in two ways:

- Eager variant generation
- On-demand variant generation

### Eager Variant Generation

Use eager generation when you know which variants an application will need before an upload arrives. Konifer queues
these variants during upload and returns the Store Asset response without waiting for them to finish.

:::info
Eager variants can only be defined using [variant profiles](variant-profiles.md).
:::

#### Best-effort

Eager generation is asynchronous and best-effort. Konifer does not reschedule a failed or interrupted eager task. If a
client later requests the missing variant, Konifer generates it on demand.

#### Configuration

Eager variants are defined in your path configuration. The following configuration generates two different variants.

```hocon
variant-profiles {
  small {
    height = 50
    width = 50
    fit = fill
    format = png
  }
  medium {
    height = 100
    width = 100
    fit = fill
    format = png
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

A Fetch Asset request with transformation parameters such as `width`, `height`, or `gravity` generates a variant
from the original
variant. Konifer caches the result in the configured object store. See [Variant Caching](caching.md) for details.

## On-demand Variant Generation Modes

By default, clients can request any supported on-demand transformation. Set
`transform.on-demand-variant.mode` in path configuration to restrict this behavior.

- **`enabled`** (default): Clients can supply a profile or individual transformation parameters.
- **`profile_only`**: Clients must name a [variant profile](variant-profiles.md) for transformed content. Explicit
  parameters must resolve to that profile's transformation. Profiles that omit `format` allow format negotiation.
- **`disabled`**: Clients cannot request arbitrary on-demand variants. A request for a configured eager variant can
  still generate that variant when its eager task has not completed.

## Transformation Limits

Transformation limits protect Konifer from generating unexpectedly large images. They apply per path to preprocessing,
eager variants, and on-demand variants.

```hocon
paths {
  "/**" {
    transform {
      limits {
        max-width = 8192
        max-height = 8192
        max-pixels = 20MP
      }
    }
  }
}
```

- `max-width` limits the final output width.
- `max-height` limits the final output height.
- `max-pixels` limits the final output width multiplied by its height.

Pixel counts can be written as exact integers or with the decimal units `P`, `KP`, `MP`, and `GP`. For example, `20MP`
means 20,000,000 pixels and `8.2944MP` means 8,294,400 pixels.

The final dimensions include padding and reflect rotation. An original variant stored without preprocessing is not
subject to transformation limits because no transformation is being generated.

Konifer rejects configured preprocessing and eager variants during configuration loading when the known dimensions
already exceed a limit. Transformations with a missing dimension or automatic rotation can depend on the source image,
so Konifer completes validation after normalization at runtime. An invalid on-demand or preprocessing transformation
returns `400 Bad Request`; eager generation remains best-effort and does not create the invalid variant.

:::note
The `clamp-width` and `clamp-height` properties inside `transform.preprocessing` are resize instructions. The
properties inside `transform.limits` are safeguards that reject transformed output exceeding the configured limits.
:::

Supplied images have a separate path-level `limits` block, which is checked before preprocessing. See
[Supplied content limits](../Assets/storing-assets.md#supplied-content-limits).

See the [configuration reference](../../reference/configuration-reference.md#transformation-limits) for the complete
property list and defaults.

## Deleting an Asset

Deleting an asset also deletes each of its variants.
