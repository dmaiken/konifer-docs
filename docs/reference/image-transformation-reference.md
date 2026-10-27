---
sidebar_position: 2
id: image-transformation-reference
title: Image Transformations
sidebar_label: "Image Transformations"
---

Use transformations to resize, crop, convert, or adjust an image. Supply the parameters below when you:

- Request an on-demand variant through the Fetch Asset API
- Define a variant profile
- Preprocess an upload
- Configure eager variant generation

Use the same parameter names in request URLs, variant profiles, and upload preprocessing configuration.
For older configurations and URLs, see [Migrating from abbreviated parameters](#migrating-from-abbreviated-parameters).

## Parameter Reference

| Parameter        | Name           | Description                                                                       | Allowed Input                                                    | Default                                |
| :--------------- | :------------- | :-------------------------------------------------------------------------------- | :--------------------------------------------------------------- | :------------------------------------- |
| `height`         | Height         | The target height of the image                                                    | Integer `> 0`                                                    | `null` (Preserves aspect ratio)        |
| `width`          | Width          | The target width of the image                                                     | Integer `> 0`                                                    | `null` (Preserves aspect ratio)        |
| `fit`            | Fit Mode       | Controls how the image fits into the bounding box defined by `height` and `width` | `fit`, `fill`, `stretch`, `crop`                                 | `fit`                                  |
| `gravity`        | Gravity        | When cropping occurs, determines which part of the image is retained              | `center`, `entropy`, `attention`                                 | `center`                               |
| `format`         | Format         | The output format of the image                                                    | Format                                                           | Original format                        |
| `rotate`         | Rotate         | Rotates the image clockwise. `auto` uses EXIF data                                | `0`, `90`, `180`, `270`, `auto`                                  | `0`                                    |
| `flip`           | Flip           | Flips the image along an axis                                                     | `v` (vertical), `h` (horizontal), `none`                         | `none`                                 |
| `filter`         | Filter         | Applies a visual effect                                                           | `none`, `black_white`, `grayscale`, `sepia`                      | `none`                                 |
| `blur`           | Blur           | Applies a Gaussian blur (value is sigma)                                          | `0` - `150`                                                      | `0`                                    |
| `quality`        | Quality        | Compression level for lossy formats                                               | `1` - `100`                                                      | Format dependent (e.g., 80)            |
| `pad`            | Padding        | Adds padding pixels to the image boundaries                                       | Integer `> 0`                                                    | `0`                                    |
| `pad-color`      | Pad Background | The padding background color                                                      | Hex Code (e.g., `#FF0000` or `#FF0000FF`)                        | Transparent / White (Format dependent) |
| `strip`          | Strip Metadata | Comma-separated list of metadata fields to remove                                 | `exif`, `iptc`, `xmp` (e.g., `exif,xmp`)                         | None                                   |
| `color-space`    | Color Space    | Transforms the image color space                                                  | `origin`, `grayscale`, `srgb`, `p3`                              | `origin`                               |
| `pixel-channels` | Pixel Channels | Channel selection and order for raw pixel output                                  | Any permutation of `RGB` or `RGBA`, or `gray` (case-insensitive) | `RGB`                                  |
| `pixel-layout`   | Pixel Layout   | Sample arrangement for raw pixel output                                           | `interleaved`, `planar`                                          | `interleaved`                          |

### Format

| Format   | Name       | File Extension | Content Type             |
| :------- | :--------- | :------------- | :----------------------- |
| `png`    | PNG        | .png           | image/png                |
| `jpg`    | JPEG       | .jpeg          | image/jpeg               |
| `webp`   | WEBP       | .webp          | image/webp               |
| `avif`   | AVIF       | .avif          | image/avif               |
| `jxl`    | JPEG XL    | .jxl           | image/jxl                |
| `heic`   | HEIC       | .heic          | image/heic               |
| `gif`    | GIF        | .gif           | image/gif                |
| `pixels` | Raw Pixels | .bin           | application/octet-stream |

`pixels` supports output only. Upload an encoded image and request a pixel variant, or convert the upload to pixels
through preprocessing. See [Raw Pixels](../concepts/pixels.md).

## Image Resizing

The `height`, `width`, and `fit` parameters determine the output dimensions and whether Konifer scales, crops, or
distorts the
source image.

The resizing examples use this 1365×1024-pixel cow photo. Download it to try the same transformations with your own
Konifer instance. The examples on this page are saved outputs from the Konifer API.

<figure className="doc-image doc-image--source">
  <img src="/image-transformations/sources/cow-original.jpg" alt="Cow in a mountain pasture with autumn trees behind it"
    width="1365" height="1024" loading="lazy" decoding="async" />
  <figcaption>
    Source · 1365×1024 pixels.{' '}
    <a href="/image-transformations/sources/cow-original.jpg" download="cow-original.jpg">Download the cow photo</a>
  </figcaption>
</figure>

### `fit` (Default)

**Requirements:** `height` or `width` (or both).

Konifer scales the image to fit within the requested dimensions while preserving its aspect ratio.

- With only `width`, Konifer calculates the height from the source aspect ratio.
- With only `height`, Konifer calculates the width from the source aspect ratio.
- With both, the output fits inside the requested bounding box. Neither dimension exceeds its requested value, and no
  cropping occurs.

### `fill`

**Requirements:** Both `height` and `width` are required.

Konifer scales the image until it covers the requested dimensions, preserving its aspect ratio, then crops any overflow.
The output matches the requested width and height.

Use `gravity` to choose which part of the scaled image remains. The default, `center`, removes an equal amount from
opposite
sides when possible.

### `stretch`

**Requirements:** Both `height` and `width` are required.

Konifer scales the image to the requested width and height without preserving its aspect ratio.

:::warning
The output may appear squashed or stretched when the requested aspect ratio differs from the source.
:::

### `crop`

**Requirements:** Both `height` and `width` are required.

Konifer removes pixels from the source to produce the requested width and height. Unlike `fill`, `crop` does not scale
the image before cropping. Use `gravity` to choose which part of the source remains.

All four requests below use `width=320&height=320&format=webp`. Compare how much of the pasture remains and whether
the cow keeps
its proportions. The outlined frames mark the same 320×320 target box; the empty space around the `fit` result belongs
to this page, not the returned image. Select a caption to inspect the output at its native size.

<div className="doc-images">
  <figure className="doc-image">
    <div className="doc-image-frame">
      <img src="/image-transformations/resizing/cow-fit-320.webp" alt="Whole cow photo scaled to fit a square target"
        width="320" height="240" loading="lazy" decoding="async" />
    </div>
    <figcaption><a href="/image-transformations/resizing/cow-fit-320.webp">fit=fit</a> · 320×240 pixels · Whole scene</figcaption>
  </figure>
  <figure className="doc-image">
    <div className="doc-image-frame">
      <img src="/image-transformations/resizing/cow-fill-320.webp" alt="Cow photo scaled and cropped to fill a square"
        width="320" height="320" loading="lazy" decoding="async" />
    </div>
    <figcaption>
      <a href="/image-transformations/resizing/cow-fill-320.webp">fit=fill</a> · 320×320 pixels · Scaled, then cropped
    </figcaption>
  </figure>
  <figure className="doc-image">
    <div className="doc-image-frame">
      <img src="/image-transformations/resizing/cow-stretch-320.webp" alt="Whole cow photo stretched vertically into a square"
        width="320" height="320" loading="lazy" decoding="async" />
    </div>
    <figcaption>
      <a href="/image-transformations/resizing/cow-stretch-320.webp">fit=stretch</a> · 320×320 pixels · Changed proportions
    </figcaption>
  </figure>
  <figure className="doc-image">
    <div className="doc-image-frame">
      <img src="/image-transformations/resizing/cow-crop-320.webp" alt="Close crop of the cow's horns and autumn trees"
        width="320" height="320" loading="lazy" decoding="async" />
    </div>
    <figcaption>
      <a href="/image-transformations/resizing/cow-crop-320.webp">fit=crop</a> · 320×320 pixels · Cropped at source scale
    </figcaption>
  </figure>
</div>

For example, after uploading the photo at `/documentation/cow`, request the filled square with:

```http
GET /assets/documentation/cow/-/content?format=webp&width=320&height=320&fit=fill
```

<a id="gravity-options-g"></a>

#### Gravity Options (`gravity`)

Both `fill` and `crop` support these gravity values:

- **`center`** (default): Keeps the geometric center of the image.
- **`entropy`**: Keeps the area with the most detail, measured through contrast and edges. It often works well for
  landscapes, products, and textured objects.
- **`attention`**: Keeps the area that the saliency model identifies as visually important, including faces and human
  features. It often works well for profile pictures and social content.

These portrait crops use the same [bird photo](/image-transformations/sources/bird-original.jpg) and
`width=240&height=320&fit=fill&format=webp`. Only `gravity` changes:

<div className="doc-images doc-images--three">
  <figure className="doc-image">
    <img src="/image-transformations/gravity/bird-fill-center-240x320.webp"
      alt="Centered portrait crop showing the whole bird"
      width="240" height="320" loading="lazy" decoding="async" />
    <figcaption><a href="/image-transformations/gravity/bird-fill-center-240x320.webp">gravity=center</a> · Geometric center</figcaption>
  </figure>
  <figure className="doc-image">
    <img src="/image-transformations/gravity/bird-fill-entropy-240x320.webp"
      alt="Entropy crop with branches and part of the bird's head outside the right edge"
      width="240" height="320" loading="lazy" decoding="async" />
    <figcaption><a href="/image-transformations/gravity/bird-fill-entropy-240x320.webp">gravity=entropy</a> · Detailed region</figcaption>
  </figure>
  <figure className="doc-image">
    <img src="/image-transformations/gravity/bird-fill-attention-240x320.webp"
      alt="Attention crop retaining the bird and its head"
      width="240" height="320" loading="lazy" decoding="async" />
    <figcaption>
      <a href="/image-transformations/gravity/bird-fill-attention-240x320.webp">gravity=attention</a> · Salient region
    </figcaption>
  </figure>
</div>

The `entropy` crop clips the bird's head in this example. Automatic gravity uses visual heuristics; it does not guarantee
that a whole subject remains in frame. Compare results with representative uploads before choosing a default.

## Image Formats & Quality

Konifer can return variants in these formats:

- **JPEG**
- **PNG**
- **WEBP** (single and multi-page)
- **AVIF**
- **JPEG XL**
- **HEIC**
- **GIF** (single and multi-page)

For raw image buffers, Konifer also supports **Pixels** (`format=pixels`).

<a id="quality-q"></a>

### Quality (`quality`)

The `quality` parameter controls compression for lossy formats. Lower values reduce file size and discard more
image detail.
Higher values preserve more detail and require more storage and network bandwidth.

| Format      | Default Quality | Notes                                                          |
| :---------- | :-------------- | :------------------------------------------------------------- |
| **JPEG**    | 80              | Good balance for photos.                                       |
| **WEBP**    | 80              | Generally 30% smaller than JPEG at equivalent quality.         |
| **AVIF**    | 50              | Superior compression, but computationally expensive to encode. |
| **PNG**     | N/A             | PNG is lossless. The `quality` parameter is ignored.           |
| **JPEG XL** | 90              | High-efficiency modern standard.                               |
| **HEIC**    | 50              | Standard for iOS captures.                                     |
| **GIF**     | 100             | Images are generally small due to a limited color palette.     |
| **Pixels**  | N/A             | Raw samples have no compression; Konifer ignores `quality`.    |

Defaults are based on the [Sharp](https://sharp.pixelplumbing.com/api-output/) library recommendations.

:::tip
Higher quality settings can increase encoding time. AVIF encoding is especially sensitive to this setting.
:::

Both versions of this [cheetah photo](/image-transformations/sources/cheetah-original.jpg) use `width=640&format=webp`.
Compare the fur around the eyes: `quality=10` loses fine detail in exchange for a smaller file. Open each output at
its native
640×427 size to inspect the difference. These file sizes apply to this photo and these settings.

<div className="doc-images">
  <figure className="doc-image">
    <img src="/image-transformations/quality/cheetah-quality-10.webp"
      alt="Cheetah with smoothed fur detail from low quality compression"
      width="640" height="427" loading="lazy" decoding="async" />
    <figcaption><a href="/image-transformations/quality/cheetah-quality-10.webp">quality=10</a> · 11,888 bytes</figcaption>
  </figure>
  <figure className="doc-image">
    <img src="/image-transformations/quality/cheetah-quality-80.webp"
      alt="Cheetah with fine fur detail preserved at quality 80"
      width="640" height="427" loading="lazy" decoding="async" />
    <figcaption><a href="/image-transformations/quality/cheetah-quality-80.webp">quality=80</a> · 49,434 bytes</figcaption>
  </figure>
</div>

## Raw Pixel Output

`format=pixels` returns packed, row-major, unsigned 8-bit samples (`uint8`, 0–255), without an image header or metadata.
The response has content type `application/octet-stream` and the download extension `.bin`. Animated sources produce
the first frame. Apply resizing, rotation, filters, and padding before exporting the buffer.

### Pixel Channels (`pixel-channels`)

Specify any permutation of `RGB` or `RGBA`, or `gray`. Input is case-insensitive; Konifer reports channels in lowercase
in response attributes. Color channels must contain `R`, `G`, and `B` once each, with an optional single `A`.
Examples include `RGB` (default), `BGR`, `RGBA`, `BGRA`, and `ARGB`. Invalid values, such as `RRB` or `RG`, return
`400 Bad Request`.

Color channels require an output color space of `srgb` or `p3`. Use `color-space=srgb` or `color-space=p3` if the
original color space
is unsuitable. With `color-space=origin`, a grayscale, CMYK, or other unsupported source color space returns
`400 Bad Request`.

An `A` channel preserves source alpha or contains `255` if the source has no alpha. Color output without `A` drops
alpha. `gray` returns one grayscale channel and composites transparency against white. For `gray`, omit
`color-space` or use
`color-space=origin` or `color-space=grayscale`; an explicit `color-space=srgb` or `color-space=p3` returns
`400 Bad Request`.

### Pixel Layout (`pixel-layout`)

| Value         | Arrangement for RGB                                     | Default |
| :------------ | :------------------------------------------------------ | :------ |
| `interleaved` | All channels per pixel: `R1 G1 B1 R2 G2 B2 …`           | Yes     |
| `planar`      | A complete plane per channel: `R1 R2 … G1 G2 … B1 B2 …` | No      |

Both layouts follow row order within the image. Channel and plane order follow `pixel-channels`. For `gray`, Konifer
normalizes the layout to `interleaved`, including requests for `planar`.

Pixel options apply when the resolved output format is `pixels`. They do not select that format on their own and have
no effect on encoded output such as PNG. Select pixels through `format=pixels` or a profile that defines it;
`Accept: application/octet-stream` does not select pixel output.

Read the output dimensions and pixel attributes (`channels`, `layout`, `dataType`) from the content response's
[`K-Attr-*` headers](api/assets/fetch-assets.mdx#content-attribute-headers), or from `attributes` in the client's
`fetchContent()` result. `link` also returns these attributes in JSON. The byte count is
`width × height × channel count`. The current output data type is fixed at `uint8`; there is no data-type
transformation parameter.

Use these same parameter names in variant profiles and preprocessing configuration. See
[Raw Pixels](../concepts/pixels.md) for configuration and
[Fetching raw pixels](api/assets/fetch-assets.mdx#example-raw-pixels) for HTTP and client examples.

## Color Space

The `color-space` parameter controls the output color space and its available color gamut.

- **`origin`** (default): Retains the embedded ICC profile, when present, without converting the color space.
- **`grayscale`**: Converts the image to a single-channel (or 2-channel if alpha exists) grayscale image. This is more
  space-efficient than the `grayscale` filter; however, color-adding transformations (such as `pad-color`) will also be
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

<a id="rotate-r"></a>

### Rotate (`rotate`)

Use `rotate` to rotate the image clockwise in 90-degree increments.

These small outputs use the same [bird photo](/image-transformations/sources/bird-original.jpg) with
`width=160&height=160&format=webp`. Each image fits inside the same square frame. Follow the bird and its branch as
the photo
turns clockwise; 90° and 270° produce portrait images.

<div className="doc-images doc-images--four">
  <figure className="doc-image">
    <div className="doc-image-frame">
      <img src="/image-transformations/rotation/bird-rotate-0.webp"
        alt="Upright bird on a branch, with no rotation"
        width="160" height="107" loading="lazy" decoding="async" />
    </div>
    <figcaption><a href="/image-transformations/rotation/bird-rotate-0.webp">rotate=0</a> · Original</figcaption>
  </figure>
  <figure className="doc-image">
    <div className="doc-image-frame">
      <img src="/image-transformations/rotation/bird-rotate-90.webp"
        alt="Bird photo turned a quarter turn clockwise, with the bird's head pointing right"
        width="107" height="160" loading="lazy" decoding="async" />
    </div>
    <figcaption><a href="/image-transformations/rotation/bird-rotate-90.webp">rotate=90</a> · 90° clockwise</figcaption>
  </figure>
  <figure className="doc-image">
    <div className="doc-image-frame">
      <img src="/image-transformations/rotation/bird-rotate-180.webp"
        alt="Bird photo turned upside down by a half turn"
        width="160" height="107" loading="lazy" decoding="async" />
    </div>
    <figcaption><a href="/image-transformations/rotation/bird-rotate-180.webp">rotate=180</a> · Half turn</figcaption>
  </figure>
  <figure className="doc-image">
    <div className="doc-image-frame">
      <img src="/image-transformations/rotation/bird-rotate-270.webp"
        alt="Bird photo turned three quarters clockwise, with the bird's head pointing left"
        width="107" height="160" loading="lazy" decoding="async" />
    </div>
    <figcaption><a href="/image-transformations/rotation/bird-rotate-270.webp">rotate=270</a> · 270° clockwise</figcaption>
  </figure>
</div>

If `auto` is supplied, Konifer reads the EXIF `Orientation` metadata from the original variant and rotates the image
accordingly. The resulting transformed variant has the EXIF `Orientation` tag stripped to prevent double-rotation by
displays.

<a id="flip-f"></a>

### Flip (`flip`)

Use `flip` to mirror the image along an axis:

- **`v`**: Vertical flip (top-to-bottom).
- **`h`**: Horizontal flip (left-to-right).

These examples use the same bird photo with `width=240&format=webp`. With `flip=h`, the bird faces the opposite
direction.
With `flip=v`, the top and bottom exchange places while the bird stays on the same side of the image.

<div className="doc-images doc-images--three">
  <figure className="doc-image">
    <img src="/image-transformations/flip/bird-flip-none.webp" alt="Original upright bird facing right on a rising branch"
      width="240" height="160" loading="lazy" decoding="async" />
    <figcaption><a href="/image-transformations/flip/bird-flip-none.webp">flip=none</a> · Original</figcaption>
  </figure>
  <figure className="doc-image">
    <img src="/image-transformations/flip/bird-flip-h.webp" alt="Bird mirrored left to right, now facing left"
      width="240" height="160" loading="lazy" decoding="async" />
    <figcaption><a href="/image-transformations/flip/bird-flip-h.webp">flip=h</a> · Left to right</figcaption>
  </figure>
  <figure className="doc-image">
    <img src="/image-transformations/flip/bird-flip-v.webp" alt="Bird mirrored top to bottom, hanging upside down"
      width="240" height="160" loading="lazy" decoding="async" />
    <figcaption><a href="/image-transformations/flip/bird-flip-v.webp">flip=v</a> · Top to bottom</figcaption>
  </figure>
</div>

### Filter (`filter`)

Use `filter` to apply one of these effects:

- **`none`** (default): No filter applied.
- **`black_white`**: Applies a binary threshold so each pixel becomes pure black or pure white.
- **`grayscale`**: Removes color while preserving shades of gray.
- **`sepia`**: Applies a warm, brownish tone matrix (identical to the CSS `sepia(100%)` filter).

Each example below uses the same [flamingo photo](/image-transformations/sources/flamingos-original.jpg) with
`width=480&format=webp`. Compare the solid black and white regions from `black_white` with the tonal detail retained by
`grayscale`.

<div className="doc-images">
  <figure className="doc-image">
    <img src="/image-transformations/filters/flamingos-filter-none.webp"
      alt="Pink flamingos standing in dark water, with no filter"
      width="480" height="316" loading="lazy" decoding="async" />
    <figcaption><a href="/image-transformations/filters/flamingos-filter-none.webp">filter=none</a> · Original colors</figcaption>
  </figure>
  <figure className="doc-image">
    <img src="/image-transformations/filters/flamingos-filter-black-white.webp"
      alt="Flamingos and water reduced to solid black and white regions"
      width="480" height="316" loading="lazy" decoding="async" />
    <figcaption>
      <a href="/image-transformations/filters/flamingos-filter-black-white.webp">filter=black_white</a> · Binary threshold
    </figcaption>
  </figure>
  <figure className="doc-image">
    <img src="/image-transformations/filters/flamingos-filter-grayscale.webp"
      alt="Flamingos and water rendered in shades of gray"
      width="480" height="316" loading="lazy" decoding="async" />
    <figcaption>
      <a href="/image-transformations/filters/flamingos-filter-grayscale.webp">filter=grayscale</a> · Shades of gray
    </figcaption>
  </figure>
  <figure className="doc-image">
    <img src="/image-transformations/filters/flamingos-filter-sepia.webp"
      alt="Flamingos and water rendered in warm brown tones"
      width="480" height="316" loading="lazy" decoding="async" />
    <figcaption><a href="/image-transformations/filters/flamingos-filter-sepia.webp">filter=sepia</a> · Warm brown tones</figcaption>
  </figure>
</div>

:::note
The `grayscale` filter is different from the `grayscale` color space (`color-space`). Images with this filter
applied will still
be 3-channel (or 4-channel if the image contains alpha). Other transformations, such as padding, will still retain
color.

For example: `?filter=grayscale&pad=10&pad-color=%23FF2900` produces a grayscale image with a red border. Encode
`#` as `%23`
in a URL.
:::

### Blur (`blur`)

Use `blur` to apply a Gaussian blur. Higher values soften more detail. Konifer applies blur after resizing, so compare
values at the dimensions you plan to deliver.

**Range:** `0` (no blur) to `150` (heavy blur).

These outputs use the same [squirrel photo](/image-transformations/sources/squirrel-original.jpg) with
`width=480&format=webp`. Only `blur` changes:

<div className="doc-images doc-images--three">
  <figure className="doc-image">
    <img src="/image-transformations/blur/squirrel-blur-0.webp" alt="Sharp squirrel on a branch without blur"
      width="480" height="320" loading="lazy" decoding="async" />
    <figcaption><a href="/image-transformations/blur/squirrel-blur-0.webp">blur=0</a> · No blur</figcaption>
  </figure>
  <figure className="doc-image">
    <img src="/image-transformations/blur/squirrel-blur-10.webp" alt="Blurred squirrel with its body and branch still recognizable"
      width="480" height="320" loading="lazy" decoding="async" />
    <figcaption><a href="/image-transformations/blur/squirrel-blur-10.webp">blur=10</a> · Softened detail</figcaption>
  </figure>
  <figure className="doc-image">
    <img src="/image-transformations/blur/squirrel-blur-50.webp"
      alt="Squirrel photo blurred into broad areas of green and brown"
      width="480" height="320" loading="lazy" decoding="async" />
    <figcaption><a href="/image-transformations/blur/squirrel-blur-50.webp">blur=50</a> · Broad color shapes</figcaption>
  </figure>
</div>

## Borders & Padding

Use `pad` to extend each edge of the image canvas by a number of pixels.

### Amount (`pad`)

Set the number of pixels added to each edge.

<a id="padding-color-pad-c"></a>

### Padding Color (`pad-color`)

Set the padded area's color with a CSS-style hex value in `pad-color`.

- **If `pad-color` is omitted:** Padding is transparent for PNG, WebP, AVIF, JPEG XL, and HEIC. It is white for
  JPEG and GIF
- **Hex Format:** Supports both RGB (Opaque) and RGBA (Transparent) formats.

#### Examples

- **Solid Red:** `pad-color=%23FF0000` (URL encoded `#FF0000`)
- **Translucent Red (50% Opacity):** `pad-color=%23FF000080` (URL encoded `#FF000080`)

Both requests below resize the squirrel to 320×213 pixels, then add `pad=16` on every edge. The final canvas measures
352×245 pixels. With WebP, omitting `pad-color` leaves the added area transparent; the checkerboard is this page's
background.

<div className="doc-images">
  <figure className="doc-image doc-image--transparency">
    <img src="/image-transformations/padding/squirrel-padding-16-transparent.webp"
      alt="Squirrel photo with transparent padding visible against a checkerboard"
      width="352" height="245" loading="lazy" decoding="async" />
    <figcaption><a href="/image-transformations/padding/squirrel-padding-16-transparent.webp">pad=16</a> · Transparent padding</figcaption>
  </figure>
  <figure className="doc-image">
    <img src="/image-transformations/padding/squirrel-padding-16-orange.webp"
      alt="Squirrel photo surrounded by an orange red border"
      width="352" height="245" loading="lazy" decoding="async" />
    <figcaption>
      <a href="/image-transformations/padding/squirrel-padding-16-orange.webp">pad=16&amp;pad-color=%23FF2900</a>
      {' '}· Solid color
    </figcaption>
  </figure>
</div>

```http
GET /assets/documentation/squirrel/-/content?format=webp&width=320&pad=16&pad-color=%23FF2900
```

## Metadata

### Strip Metadata

Use `strip` to remove EXIF, XMP, or IPTC metadata from the output.

:::tip
Add `strip` to a variant profile, eager variant, or preprocessing rule when every matching asset needs the same metadata
policy. Stripping metadata during preprocessing removes it from the original variant and every variant derived from it.
:::

## Migrating from abbreviated parameters

The current API uses descriptive transformation names. If you upgrade from a version that uses abbreviations,
replace these keys in request URLs, `variant-profiles`, and `transform.preprocessing`:

| Previous name | Current name  |
| :------------ | :------------ |
| `w`           | `width`       |
| `h`           | `height`      |
| `q`           | `quality`     |
| `g`           | `gravity`     |
| `r`           | `rotate`      |
| `f`           | `flip`        |
| `cs`          | `color-space` |
| `pad-c`       | `pad-color`   |

This is a breaking change: use the current names to request transformations. Konifer does not support the previous
names as aliases. Keep the parameter values, including `flip=h` and `flip=v`.

For example, change this request:

```http
GET /assets/photos/123/-/content?w=256&h=256&fit=fill&r=auto&format=webp&q=80
```

To:

```http
GET /assets/photos/123/-/content?width=256&height=256&fit=fill&rotate=auto&format=webp&quality=80
```

Names such as `fit`, `format`, `filter`, `blur`, `pad`, `strip`, `profile`, `pixel-channels`, and `pixel-layout`
keep their existing spelling. The URL signature parameter remains `s`.

Regenerate [URL signatures](url-signing.md) after renaming parameters. Sign the updated path and query string,
with parameters sorted by their new keys.

Prefix each label query parameter with `label:`, including names that overlap transformation parameters. For example,
use `label:width=wide` to filter by an asset label named `width`. Keep the label's key as `width` in upload and update
JSON. See [label query parameters](../concepts/Assets/overview.md#reserved-words).
