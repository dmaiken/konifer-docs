---
sidebar_position: 2
id: image-transformation-reference
title: Image Transformation Reference
sidebar_label: "Image Transformations"
---
# Image Transformations
Direkt offers many transformation options to create a variant from an image asset. The parameters below can be used to:
- Query a variant on-demand using the Fetch Asset API
- Define a Variant Profile
- Define original variant pre-processing
- Define eager variants (via profiles)

| Transformation | Parameter  | Description                                                                       | Allowed Input                                             | Default                                                                   |
|----------------|------------|-----------------------------------------------------------------------------------|-----------------------------------------------------------|---------------------------------------------------------------------------|
| Height         | `h`        | Set the height of an image                                                        | > 0                                                       |                                                                           |
| Width          | `w`        | Set the width of an image                                                         | > 0                                                       |                                                                           | 
| Fit            | `fit`      | How the image fits into the box defined with height and/or width                  | `fit`, `fill`, `stretch`, `crop`                          | `fit`                                                                     |
| Gravity        | `g`        | When `fit` is `crop`, helps determine where to overlay the cropping box           | `center`, `entropy`, `attention`                          | `center`                                                                  |
| MIME type      | `mimeType` | The format of the image                                                           | `image/jpeg`, `image/png`, `image/webp`, `image/avif`     |                                                                           |
| Rotate         | `r`        | Rotate the image clockwise                                                        | 0, 90, 180, 270, `auto`                                   | 0                                                                         |
| Flip           | `f`        | Flip the image along it's horizontal or vertical axis                             | `v`, `h`, `none`                                          | `none`                                                                    |
| Filter         | `filter`   | Apply a filter to the image                                                       | `none`, `black_white`, `greyscale`, `sepia`               | `none`                                                                    |
| Blur           | `blur`     | Apply a Gaussian blur                                                             | 0 - 150                                                   | 0                                                                         |
| Quality        | `q`        | For lossy compression formats, specifies the desired compression level            | 1 - 100                                                   | Depends on requested format                                               |
| Pad            | `pad`      | Pad the image boundaries                                                          | > 0                                                       | 0                                                                         |
| Background     | `bg`       | Together with `pad`, defines a background to the image - in other words, a border | CSS-style hex of a color - alpha can be specified as well | #00000000 (transparent) for formats supporting alpha, #FFFFFFFF otherwise | 

# Image Resizing
Image resizing can be done using a combination of `h`, `w`, `fit`, and `g`. How these are applied to the image depends entirely on 
the `fit`.

## Fit of `fit`
**Requirements:** Both `h` or `w` (or both).

The image is resized to fit **within** the specified dimensions while maintaining its original aspect ratio.
* If only `w` is set: Resizes to that width, calculating height automatically.
* * If only `h` is set: Resizes to that height, calculating width automatically.
* If both are set: The image is scaled so that its longest side matches the bounding box. No cropping occurs.

## Fit of `fill`
**Requirements:** Both `h` and `w` are required.

The image is resized to **completely fill** the specified dimensions. The image is scaled maintaining aspect ratio, 
and any parts of the image that overflow the bounding box are cropped out.
* **Default Gravity:** Uses `center` gravity (crops equally from sides/top-bottom).

## Fit of `stretch`
**Requirements:** Both `h` and `w` are required.

The image is forced to exactly match the provided height and width.

> **Warning:** This **ignores** the original aspect ratio and will most likely result in a squashed or stretched image.

## Fit of `crop`
**Requirements:** Both `h` and `w` are required.

Similar to `fill`, this ensures the image covers the dimensions, but it allows you to specify a Gravity (`g`) 
strategy to determine what gets cropped.

### Gravity
Currently, only 3 gravity options are supported:
* **`center`** (Default): Keeps the geometric center of the image.
* **`entropy`**: Detects "busy" areas (high contrast/edges). Best for landscapes, products, or textured objects.
* **`attention`**: Uses a saliency model to detect faces and human features. Best for profile pictures and social content.

# Image Formats
Supported image formats are:
* **JPEG**
* **PNG**
* **WEBP**
* **AVIF**

## Quality (`q`)
The `q` parameter controls the compression level for lossy formats. Lower values result in smaller file sizes but reduced visual fidelity.

| Format   | Default Quality  | Notes                                                          |
|:---------|:-----------------|:---------------------------------------------------------------|
| **JPEG** | 80               | Good balance for photos.                                       |
| **WEBP** | 80               | generally 30% smaller than JPEG at equivalent quality.         |
| **AVIF** | 50               | Superior compression, but computationally expensive to encode. |
| **PNG**  | N/A              | PNG is **lossless**. The `q` parameter is ignored.             |

The default quality options are based on Javascript's [Sharp](https://sharp.pixelplumbing.com/) image 
processing library [defaults](https://sharp.pixelplumbing.com/api-output/)

> **Note**: The tradeoff for higher quality images is increased encoding cost. For some formats such as AVIF, this
> can be significant. 
