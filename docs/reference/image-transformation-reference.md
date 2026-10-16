---
sidebar_position: 2
id: image-transformation-reference
title: Image Transformation
sidebar_label: "Image Transformation"
---

Use transformations to resize, crop, convert, or adjust an image. Supply the parameters below when you:

- Request an on-demand variant through the Fetch Asset API
- Define a variant profile
- Preprocess an upload
- Configure eager variant generation

## Parameter Reference

| Parameter        | Name           | Description                                                              | Allowed Input                               | Default                                |
|:-----------------|:---------------|:-------------------------------------------------------------------------|:--------------------------------------------|:---------------------------------------|
| `h`              | Height         | The target height of the image                                           | Integer `> 0`                               | `null` (Preserves aspect ratio)        |
| `w`              | Width          | The target width of the image                                            | Integer `> 0`                               | `null` (Preserves aspect ratio)        |
| `fit`            | Fit Mode       | Controls how the image fits into the bounding box defined by `h` and `w` | `fit`, `fill`, `stretch`, `crop`            | `fit`                                  |
| `g`              | Gravity        | When cropping occurs, determines which part of the image is retained     | `center`, `entropy`, `attention`            | `center`                               |
| `format`         | Format         | The output format of the image                                           | Format                                      | Original format                        |
| `r`              | Rotate         | Rotates the image clockwise. `auto` uses EXIF data                       | `0`, `90`, `180`, `270`, `auto`             | `0`                                    |
| `f`              | Flip           | Flips the image along an axis                                            | `v` (vertical), `h` (horizontal), `none`    | `none`                                 |
| `filter`         | Filter         | Applies a visual effect                                                  | `none`, `black_white`, `grayscale`, `sepia` | `none`                                 |
| `blur`           | Blur           | Applies a Gaussian blur (value is sigma)                                 | `0` - `150`                                 | `0`                                    |
| `q`              | Quality        | Compression level for lossy formats                                      | `1` - `100`                                 | Format dependent (e.g., 80)            |
| `pad`            | Padding        | Adds padding pixels to the image boundaries                              | Integer `> 0`                               | `0`                                    |
| `pad-c`          | Pad Background | The padding background color                                             | Hex Code (e.g., `#FF0000` or `#FF0000FF`)   | Transparent / White (Format dependent) |
| `strip`          | Strip Metadata | Comma-separated list of metadata fields to remove                        | `exif`, `iptc`, `xmp` (e.g., `exif,xmp`)    | None                                   |
| `cs`             | Color Space    | Transforms the image color space                                         | `origin`, `grayscale`, `srgb`, `p3`         | `origin`                               |

### Format

| Format   | Name       | File Extension | Content Type             |
|:---------|:-----------|:---------------|:-------------------------|
| `png`    | PNG        | .png           | image/png                |
| `jpg`    | JPEG       | .jpeg          | image/jpeg               |
| `webp`   | WEBP       | .webp          | image/webp               |
| `avif`   | AVIF       | .avif          | image/avif               |
| `jxl`    | JPEG XL    | .jxl           | image/jxl                |
| `heic`   | HEIC       | .heic          | image/heic               |
| `gif`    | GIF        | .gif           | image/gif                |

## Image Resizing

The `h`, `w`, and `fit` parameters determine the output dimensions and whether Konifer scales, crops, or distorts the
source image.

### `fit` (Default)

**Requirements:** `h` or `w` (or both).

Konifer scales the image to fit within the requested dimensions while preserving its aspect ratio.

- With only `w`, Konifer calculates the height from the source aspect ratio.
- With only `h`, Konifer calculates the width from the source aspect ratio.
- With both, the output fits inside the requested bounding box. Neither dimension exceeds its requested value, and no
  cropping occurs.

### `fill`

**Requirements:** Both `h` and `w` are required.

Konifer scales the image until it covers the requested dimensions, preserving its aspect ratio, then crops any overflow.
The output matches the requested width and height.

Use `g` to choose which part of the scaled image remains. The default, `center`, removes an equal amount from opposite
sides when possible.

### `stretch`

**Requirements:** Both `h` and `w` are required.

Konifer scales the image to the requested width and height without preserving its aspect ratio.

:::warning
The output may appear squashed or stretched when the requested aspect ratio differs from the source.
:::

### `crop`

**Requirements:** Both `h` and `w` are required.

Konifer removes pixels from the source to produce the requested width and height. Unlike `fill`, `crop` does not scale
the image before cropping. Use `g` to choose which part of the source remains.

#### Gravity Options (`g`)

Both `fill` and `crop` support these gravity values:

- **`center`** (default): Keeps the geometric center of the image.
- **`entropy`**: Keeps the area with the most detail, measured through contrast and edges. It often works well for
  landscapes, products, and textured objects.
- **`attention`**: Keeps the area that the saliency model identifies as visually important, including faces and human
  features. It often works well for profile pictures and social content.

## Image Formats & Quality

Konifer can return variants in these formats:

- **JPEG**
- **PNG**
- **WEBP** (single and multi-page)
- **AVIF**
- **JPEG XL**
- **HEIC**
- **GIF** (single and multi-page)

### Quality (`q`)

The `q` parameter controls compression for lossy formats. Lower values reduce file size and discard more image detail.
Higher values preserve more detail and require more storage and network bandwidth.

| Format         | Default Quality | Notes                                                          |
|:---------------|:----------------|:---------------------------------------------------------------|
| **JPEG**       | 80              | Good balance for photos.                                       |
| **WEBP**       | 80              | Generally 30% smaller than JPEG at equivalent quality.         |
| **AVIF**       | 50              | Superior compression, but computationally expensive to encode. |
| **PNG**        | N/A             | PNG is lossless. The `q` parameter is ignored.                 |
| **JPEG XL**    | 90              | High-efficiency modern standard.                               |
| **HEIC**       | 50              | Standard for iOS captures.                                     |
| **GIF**        | 100             | Images are generally small due to a limited color palette.     |

Defaults are based on the [Sharp](https://sharp.pixelplumbing.com/api-output/) library recommendations.

:::tip
Higher quality settings can increase encoding time. AVIF encoding is especially sensitive to this setting.
:::

## Color Space

The `cs` parameter controls the output color space and its available color gamut.

- **`origin`** (default): Retains the embedded ICC profile, when present, without converting the color space.
- **`grayscale`**: Converts the image to a single-channel (or 2-channel if alpha exists) grayscale image. This is more
  space-efficient than the `grayscale` filter; however, color-adding transformations (such as `pad-c`) will also be
  flattened to grayscale.
- **`srgb`**: Converts the image to sRGB using its embedded ICC profile. Konifer removes the profile from the output
  because most displays assume sRGB by default.
- **`p3`**: Converts the image to the Display P3 profile, the standard for modern iOS-based cameras and wide-gamut
  displays.

:::note
Converting an sRGB or grayscale source to P3 does not create colors absent from the source. The conversion may increase
file size without changing its appearance.
:::

## Geometry & Effects

### Rotate (`r`)

Use `r` to rotate the image clockwise in 90-degree increments.

If `auto` is supplied, Konifer reads the EXIF `Orientation` metadata from the original variant and rotates the image
accordingly. The resulting transformed variant has the EXIF `Orientation` tag stripped to prevent double-rotation by
displays.

### Flip (`f`)

Use `f` to mirror the image along an axis:

- **`v`**: Vertical flip (top-to-bottom).
- **`h`**: Horizontal flip (left-to-right).

### Filter (`filter`)

Use `filter` to apply one of these effects:

- **`none`** (default): No filter applied.
- **`black_white`**: Applies a binary threshold so each pixel becomes pure black or pure white.
- **`grayscale`**: Removes color while preserving shades of gray.
- **`sepia`**: Applies a warm, brownish tone matrix (identical to the CSS `sepia(100%)` filter).

:::note
The `grayscale` filter is different from the `grayscale` color space (`cs`). Images with this filter applied will still
be 3-channel (or 4-channel if the image contains alpha). Other transformations, such as padding, will still retain
color.

For example: `?filter=grayscale&pad=10&pad-c=#FF2900` will result in a grayscale image with a red border.
:::

### Blur (`blur`)

Use `blur` to apply a Gaussian blur. The value sets the blur's sigma.

**Range:** `0` (no blur) to `150` (heavy blur).

## Borders & Padding

Use `pad` to extend each edge of the image canvas by a number of pixels.

### Amount (`pad`)

Set the number of pixels added to each edge.

### Padding Color (`pad-c`)

Set the padded area's color with a CSS-style hex value in `pad-c`.

- **If `pad-c` is omitted:** Padding is transparent for PNG, WebP, AVIF, JPEG XL, and HEIC. It is white for JPEG and GIF
- **Hex Format:** Supports both RGB (Opaque) and RGBA (Transparent) formats.

#### Examples

- **Solid Red:** `pad-c=%23FF0000` (URL encoded `#FF0000`)
- **Translucent Red (50% Opacity):** `pad-c=%23FF000080` (URL encoded `#FF000080`)

## Metadata

### Strip Metadata

Use `strip` to remove EXIF, XMP, or IPTC metadata from the output.

:::tip
Add `strip` to a variant profile, eager variant, or preprocessing rule when every matching asset needs the same metadata
policy. Stripping metadata during preprocessing removes it from the original variant and every variant derived from it.
:::
