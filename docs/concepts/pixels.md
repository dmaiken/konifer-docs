---
sidebar_position: 8
id: concepts-pixels
title: Raw Pixels
sidebar_label: "Raw Pixels"
description: Use raw pixel variants for image processing and machine learning inputs.
---

Request `format=pixels` to get the transformed image as raw pixel samples. You can use these samples in image
processing, computer vision, or machine learning code that needs a pixel buffer instead of a compressed image file.

Konifer returns `application/octet-stream` content with a `.bin` extension. The body contains packed, unsigned 8-bit
samples (`uint8`, values 0–255), with no image header, dimensions, or embedded metadata. Konifer returns the first
frame of an animated source. The `q` parameter has no effect on pixel output.

## Channel order and layout

Use `pixel-channels` to choose the channels and their order. The default is `RGB`. You can specify any permutation of
`RGB` or `RGBA`, such as `BGR`, `BGRA`, or `ARGB`, or use `GRAY` for one grayscale channel. Input is case-insensitive;
each color channel must appear once.

Use `pixel-layout` to choose how Konifer arranges the samples in the buffer:

| Layout                  | Example for three RGB pixels | Buffer shape                    |
| :---------------------- | :--------------------------- | :------------------------------ |
| `interleaved` (default) | `R1 G1 B1 R2 G2 B2 R3 G3 B3` | Height × width × channels (HWC) |
| `planar`                | `R1 R2 R3 G1 G2 G3 B1 B2 B3` | Channels × height × width (CHW) |

Pixels follow row order, from left to right and then top to bottom. In planar layout, each plane contains one complete
channel in that row order. The order of the planes follows `pixel-channels`.

For `gray`, Konifer returns one channel and reports `interleaved` layout even if you request `planar`. Both layouts
would contain the same bytes for a single channel.

## Color and transparency

Color pixel output requires sRGB or Display P3. Use `cs=srgb` or `cs=p3` to convert a source with another color space;
the default `cs=origin` retains the source color space and can fail for grayscale, CMYK, or other sources containing
uncommon ICC profiles.

For `pixel-channels=gray`, Konifer converts the output to grayscale. You can omit `cs`, use `cs=origin`, or use
`cs=grayscale`. Combining `gray` with `cs=srgb` or `cs=p3` returns `400 Bad Request`.

Include `A` to retain source transparency. Konifer adds an opaque alpha sample if the source has no alpha channel.
Color output without `A` drops the alpha channel. For `gray`, Konifer composites transparency against white before
returning grayscale samples.

## Fetch bytes with their attributes

Fetch `link` with the desired transformation to get the output dimensions and pixel attributes. Then fetch the returned
`url` to download those bytes. This keeps the metadata and content tied to the same entry, including if someone uploads
a newer entry at the path between your requests.

```bash
curl --fail-with-body \
  'http://localhost:8080/assets/users/123/profile-picture/-/link?format=pixels&w=224&h=224&fit=fill&cs=srgb&pixel-channels=BGR&pixel-layout=planar'
```

The response's `attributes` include:

```json
{
  "width": 224,
  "height": 224,
  "format": "pixels",
  "colorSpace": "srgb",
  "pixels": {
    "channels": "bgr",
    "layout": "planar",
    "dataType": "uint8"
  }
}
```

The body size in bytes is `width × height × channel count`: three for RGB permutations, four for RGBA permutations,
or one for `gray`. This example produces 150,528 bytes. Use the returned dimensions because resizing, rotation, and
padding can change them. See the [Fetch Assets reference](../reference/api/assets/fetch-assets.mdx#example-raw-pixels)
for curl, Kotlin, and Java examples.

## Pixel variants and preprocessing

You can combine pixel output with resizing, cropping, rotation, filters, and other
[image transformations](../reference/image-transformation-reference.md). Define the same parameters in a
[variant profile](Variants/variant-profiles.md) to reuse the transformation or generate an eager pixel variant.

If your path defines `allowed-content-types`, include `application/octet-stream` to permit pixel output alongside
the encoded input types you accept.

Konifer caches pixel variants in the object store. Channel order and layout distinguish cached variants; for example,
RGB interleaved and BGR planar are separate variants. For grayscale, Konifer normalizes both layout requests to the
same interleaved variant. See [Variant Caching](Variants/caching.md).

You can also convert an uploaded image to pixels during preprocessing:

```hocon
paths {
  "/vision/**" {
    transform {
      preprocessing {
        enabled = true
        format = pixels
        cs = srgb
        pixel-channels = RGB
        pixel-layout = planar
      }
    }
  }
}
```

Konifer stores this pixel buffer as the Original Variant, together with the attributes needed to decode it. You can
resize it, reorder its channels, change its layout, or request an encoded format such as PNG in later variants.
Preprocessing to pixels keeps one frame and 8-bit samples; preprocessing without `A` also discards source alpha.

Raw pixels are an output format. Upload an encoded image, such as PNG or JPEG, even when preprocessing will convert it
to pixels. Konifer does not accept a raw `.bin` buffer through multipart, HTTP URL, or S3 source ingestion.
