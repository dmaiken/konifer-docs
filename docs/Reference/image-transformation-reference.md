---
sidebar_position: 2
id: image-transformation-reference
title: Image Transformation
sidebar_label: "Image Transformations"
---

# Image Transformations

Konifer offers a robust suite of transformation options to create variants from your image assets. The parameters below can be used to:
- Query a variant on-demand using the Fetch Asset API
- Define a Variant Profile
- Configure Pre-processing rules
- Configure Eager Variant generation

## Parameter Reference

| Parameter | Name           | Description                                                              | Allowed Input                               | Default                                |
|:----------|:---------------|:-------------------------------------------------------------------------|:--------------------------------------------|:---------------------------------------|
| `h`       | Height         | The target height of the image                                           | Integer `> 0`                               | `null` (Preserves aspect ratio)        |
| `w`       | Width          | The target width of the image                                            | Integer `> 0`                               | `null` (Preserves aspect ratio)        |
| `fit`     | Fit Mode       | Controls how the image fits into the bounding box defined by `h` and `w` | `fit`, `fill`, `stretch`, `crop`            | `fit`                                  |
| `g`       | Gravity        | When cropping occurs, determines which part of the image is retained     | `center`, `entropy`, `attention`            | `center`                               |
| `format`  | Format         | The output format of the image                                           | Format                                      | Original format                        |
| `r`       | Rotate         | Rotates the image clockwise. `auto` uses EXIF data                       | `0`, `90`, `180`, `270`, `auto`             | `0`                                    |
| `f`       | Flip           | Flips the image along an axis                                            | `v` (vertical), `h` (horizontal), `none`    | `none`                                 |
| `filter`  | Filter         | Applies a visual effect                                                  | `none`, `black_white`, `greyscale`, `sepia` | `none`                                 |
| `blur`    | Blur           | Applies a Gaussian blur (value is sigma)                                 | `0` - `150`                                 | `0`                                    |
| `q`       | Quality        | Compression level for lossy formats                                      | `1` - `100`                                 | Format dependent (e.g., 80)            |
| `pad`     | Padding        | Adds padding pixels to the image boundaries.                             | Integer `> 0`                               | `0`                                    |
| `pad-c`   | Pad Background | The padding background color                                             | Hex Code (e.g., `#FF0000` or `#FF0000FF`)   | Transparent / White (Format dependent) |

### Format
| Format | Name    | File Extension | Content Type |
|:-------|:--------|:---------------|:-------------|
| `png`  | PNG     | .png           | image/png    |
| `jpg`  | JPEG    | .jpeg          | image/jpeg   |
| `webp` | WEBP    | .webp          | image/webp   |
| `avif` | AVIF    | .avif          | image/avif   |
| `jxl`  | JPEG XL | .jxl           | image/jxl    |
| `heic` | HEIC    | .heic          | image/heic   |
| `gif`  | GIF     | .gif           | image/gif    |

## Image Resizing
Image resizing behavior is controlled by the interaction between Height (`h`), Width (`w`), and Fit (`fit`).

### `fit` (Default)
**Requirements:** `h` or `w` (or both).

The image is resized to fit within the specified dimensions while maintaining its original aspect ratio.
* If only `w` is set: Resizes to that width, calculating height automatically.
* If only `h` is set: Resizes to that height, calculating width automatically.
* If both are set: The image is scaled so that its longest side matches the bounding box. No cropping occurs.

### `fill`
**Requirements:** Both `h` and `w` are required.

The image is resized to **completely fill** the specified dimensions. The image is scaled maintaining aspect ratio, 
and any parts of the image that overflow the bounding box are cropped out.

**Default Gravity:** Uses `center` gravity (crops equally from sides/top-bottom).

### `stretch`
**Requirements:** Both `h` and `w` are required.

The image is forced to exactly match the provided height and width.

:::warning
This **ignores** the original aspect ratio and may result in a squashed or stretched image.
:::

### `crop`
**Requirements:** Both `h` and `w` are required.

Similar to `fill`, this ensures the image covers the dimensions, but it allows you to specify a Gravity (`g`) strategy to determine what gets cropped.

#### Gravity Options (`g`)
Currently, 3 gravity options are supported:

* **`center`** (Default): Keeps the geometric center of the image.
* **`entropy`**: Detects "busy" areas (high contrast/edges). Best for landscapes, products, or textured objects.
* **`attention`**: Uses a saliency model to detect faces and human features. Best for profile pictures and social content.

---

## Image Formats & Quality

Konifer supports the following modern image formats:
* **JPEG**
* **PNG**
* **WEBP** (single and multi-page)
* **AVIF**
* **JPEG XL**
* **HEIC**
* **GIF** (single and multi-page)

### Quality (`q`)

The `q` parameter controls the compression level for lossy formats. Lower values result in smaller file sizes but reduced visual fidelity.

| Format      | Default Quality | Notes                                                          |
|:------------|:----------------|:---------------------------------------------------------------|
| **JPEG**    | 80              | Good balance for photos.                                       |
| **WEBP**    | 80              | generally 30% smaller than JPEG at equivalent quality.         |
| **AVIF**    | 50              | Superior compression, but computationally expensive to encode. |
| **PNG**     | N/A             | PNG is lossless. The `q` parameter is ignored.                 |
| **JPEG XL** | 90              |                                                                |
| **HEIC**    | 50              |                                                                |
| **GIF**     | 100             | Images are generally small due to limited color pallete        |

Defaults are based on the [Sharp](https://sharp.pixelplumbing.com/api-output/) library recommendations.

> 💡 **Performance Note:** The tradeoff for higher quality images is increased encoding cost. For formats like AVIF, encoding costs can be significant.

---

## Geometry & Effects

### Rotate (`r`)
The `r` parameter rotates the image clockwise in 90-degree increments.

If `auto` is supplied, Konifer reads the EXIF `Orientation` metadata from the Original Variant and rotates the image 
accordingly. The resulting transformed variant has the EXIF `Orientation` tag stripped to prevent double-rotation
by displays.

### Flip (`f`)
Flipping mirrors the image along a specified axis:
* **`v`**: Vertical flip (top-to-bottom).
* **`h`**: Horizontal flip (left-to-right).

### Filter (`filter`)
Apply stylistic effects to the image:
* **`none`** (default): No filter applied.
* **`black_white`**: Applies a binary threshold, forcing pixels to be either pure black or pure white (High contrast).
* **`greyscale`**: Removes color info, preserving 256 shades of gray (Photo style).
* **`sepia`**: Applies a warm, brownish tone matrix (identical to the CSS `sepia(100%)` filter).

### Blur (`blur`)
Applies a Gaussian blur. The value represents the sigma of the blur.

**Range:** `0` (no blur) to `150` (heavy blur).

---

## Borders & Padding

You can add a border or padding to an image using the `pad` parameter, which specifies the size (in pixels) to extend the image canvas.

### Amount (`pad`)
Specify the amount of padding in pixels. 

### Padding Color (`pad-c`)
The `pad-c` parameter defines the fill color for the padded area. It requires a hex string in CSS-style format.

* **If `pad-c` is omitted:** Padding is transparent (for PNG/WebP/AVIF/Jpeg XL/HEIC) or white (for JPEG/GIF).
* **Hex Format:** Supports both RGB (Opaque) and RGBA (Transparent) formats.

#### Examples
* **Solid Red:** `pad-c=%23FF0000` (URL encoded `#FF0000`)
* **Translucent Red (50% Opacity):** `pad-c=%23FF000080` (URL encoded `#FF000080`)
