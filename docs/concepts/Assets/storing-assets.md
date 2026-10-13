---
sidebar_position: 2
id: concepts-storing-assets
title: Storing Assets
sidebar_label: "Storing"
---

When storing an asset, the content must be supplied as well as any optional metadata. The content can be supplied as:

- a multipart upload if you possess the binary asset content
- an HTTP or HTTPS URL that Konifer downloads
- an Amazon S3 object ARN that Konifer reads with its AWS identity

When asset content is stored, it is referred to as the `originalVariant`. When fetching asset information,
`isOriginalVariant` is
`true` for the variant that represents the original supplied content.

## Multipart upload

Binary asset data can be supplied using [HTTP Multipart Form Data](https://www.ietf.org/rfc/rfc2388.txt). See the
[MDN documentation for HTTP POST requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/POST)
for more information. Your request should look like this:

```http
POST /assets/users/123 HTTP/1.1
Host: your.api.com
Content-Type: multipart/form-data; boundary=---------------------------974767299852498929531610575

-----------------------------974767299852498929531610575
Content-Disposition: form-data; name="metadata"
Content-Type: application/json

{
  "alt": "Profile Picture",
  "tags": ["headshot", "team"],
  "labels": {
    "department": "engineering"
  }
}
-----------------------------974767299852498929531610575
Content-Disposition: form-data; name="asset"; filename="my-image.jpg"
Content-Type: image/jpeg

[Binary data of the image file...]
-----------------------------974767299852498929531610575--
```

Only one image and one metadata multipart can be supplied. Do not include an external source in the metadata when
supplying multipart content.

## URL upload

If you wish to supply a URL referencing your asset, you must allow the subdomain in your configuration. By default,
Konifer does not permit any HTTP subdomains. To allow Konifer to connect to an HTTP subdomain, supply them in your
HOCON.

```hocon
source {
  url {
    allowed-domains = [
      "your-domain.com"
    ]
  }
}
```

If the domain is not allowed when uploading an asset, a `400 Bad Request` is returned.

A request to store an asset using a URL looks like this (omitting all optional information):

```json
{
  "source": {
    "http": {
      "url": "https://your-domain.com/your-image.jpeg"
    }
  }
}
```

The top-level `url` field is deprecated but remains available as a fallback when `source.http.url` is absent.

Konifer protects against the following when fetching asset content from URL:

1. Too many redirects (> 5)
2. Redirects to domains not in the `source.url.allowed-domains` configuration
3. Invalid redirects
4. Content size too large (configurable through `source.url.max-bytes`)

## Amazon S3 ARN upload

You can supply a conventional Amazon S3 object ARN instead of uploading the content or exposing it through an HTTP
server. The ARN must identify both a bucket and an object key:

```json
{
  "source": {
    "s3": {
      "arn": "arn:aws:s3:::asset-imports/customers/123/profile.jpeg"
    }
  }
}
```

Konifer creates a separate Amazon S3 client only when an ARN source is used. The client obtains its credentials and
region from the AWS default provider chains. There is no setting that enables ARN sources. The runtime AWS identity
must have `s3:GetObject` permission for the referenced object.

The source client is independent of the configured object store. An ARN can therefore be used when Konifer stores its
assets in a filesystem, Amazon S3, or an S3-compatible service. ARN sources always refer to Amazon S3; endpoint and
credentials under `object-store.s3` do not configure the source client.

Anyone who can submit a store request can ask Konifer to read any S3 object available to its runtime AWS identity. Use
least-privilege IAM permissions scoped to the source buckets and prefixes the application needs, and protect the store
endpoint with the authentication and authorization appropriate for your deployment.

The source size limits accept an exact byte count or a readable value such as `20MB` or `20MiB`. Configure multipart
content under `source.multipart.max-bytes`. Both URL and S3 ARN downloads use `source.url.max-bytes`. See the
[Source configuration reference](../../reference/configuration-reference.md#source) for the supported units.

## Supplied content limits

Path-level `limits` protect Konifer from decoding and processing unexpectedly large supplied images. They apply to the
content received from multipart, URL, and S3 ARN sources and are checked before preprocessing.

```hocon
paths {
  "/public/avatars/**" {
    limits {
      max-width = 4096
      max-height = 4096
      max-pixels = 12MP
      max-pages = 1
      max-pixels-per-page = 1MP
    }
  }
}
```

- `max-width` and `max-height` limit the supplied image dimensions.
- `max-pixels` limits width multiplied by height for single-page content.
- `max-pages` limits the frame or page count of multi-page content.
- `max-pixels-per-page` limits width multiplied by height for each frame or page of multi-page content.

For single-page content, Konifer uses `max-pixels` and ignores `max-pixels-per-page`. For multi-page content, it uses
`max-pixels-per-page` and `max-pages` instead of `max-pixels`. The width and height limits always apply. An image that
exceeds a configured limit is rejected and is not stored.

Pixel counts accept exact integers or readable decimal strings such as `500KP`, `12MP`, or `1.5GP`. These input limits
are separate from `transform.limits`, which constrain the output of preprocessing and variant generation. See the
[configuration reference](../../reference/configuration-reference.md#supplied-asset-content-limits) for all defaults
and accepted pixel-count formats.

## Information

Asset information is supplied as JSON. All information fields are optional, but fields such as `alt` and LQIP(s) are
useful for display purposes and are returned as headers when fetching asset content.

```json
{
  "alt": "The alt text for an image",
  "labels": {
    "label-key": "label-value",
    "phone": "Android"
  },
  "tags": [
    "cold",
    "verified"
  ]
}
```

## Asset Preprocessing

Preprocessing transforms content during upload. Konifer stores the result as the original variant and generates later
variants from that result. The asset does not retain a separate copy of the supplied content before preprocessing.

This configuration fits large uploads within 640×640 pixels and converts them to WebP. The clamps preserve the aspect
ratio and prevent smaller uploads from being enlarged:

```hocon
paths {
  "/documentation/preprocessing/**" {
    transform {
      preprocessing {
        enabled = true
        clamp-width = 640
        clamp-height = 640
        fit = fit
        format = webp
      }
    }
  }
}
```

All [image transformation parameters](../../reference/image-transformation-reference.md#parameter-reference) can be used
directly within the `preprocessing` block.

### Supplied Image, Stored Original, and Later Variant

Konifer stored this 1365×1024 JPG as a 640×480 WebP original, then generated a 128×128 thumbnail from the stored image.
The figures use reduced display sizes; the captions give their actual pixel dimensions.

<div className="doc-images doc-images--three doc-images--bottom">
  <figure className="doc-image">
    <img src="/image-transformations/sources/cow-original.jpg" alt="Supplied cow photo with its full mountain pasture scene"
      width="1365" height="1024" loading="lazy" decoding="async" />
    <figcaption>Supplied content · JPG · 1365×1024 pixels</figcaption>
  </figure>
  <figure className="doc-image">
    <img src="/image-examples/preprocessing/cow-preprocessed-clamp-640.webp"
      alt="Stored cow photo resized to fit the preprocessing clamp, with the whole scene preserved"
      width="640" height="480" loading="lazy" decoding="async" />
    <figcaption>Stored original · WebP · 640×480 pixels</figcaption>
  </figure>
  <figure className="doc-image">
    <img src="/image-examples/preprocessing/cow-thumbnail-from-preprocessed-128.webp"
      alt="Square thumbnail generated from the preprocessed cow photo"
      width="128" height="128" loading="lazy" decoding="async" />
    <figcaption>Later variant · WebP · 128×128 pixels</figcaption>
  </figure>
</div>

To reproduce the example, [download the cow photo](/image-transformations/sources/cow-original.jpg), save it as
`cow-original.jpg`, and upload it to a path covered by the configuration:

```bash
curl --fail-with-body \
  --request POST \
  'http://localhost:8080/assets/documentation/preprocessing/cow' \
  --form 'metadata={}' \
  --form 'asset=@cow-original.jpg'
```

The upload response describes the preprocessed image as the original variant. This excerpt omits the other fields:

```json
{
  "variants": [
    {
      "isOriginalVariant": true,
      "attributes": { "height": 480, "width": 640, "format": "webp" }
    }
  ]
}
```

Request the thumbnail with:

```http
GET /assets/documentation/preprocessing/cow/-/content?format=webp&w=128&h=128&fit=fill
```

Larger variants still **start** from the 640×480 stored original.

### Clamp Width/Height

`clamp-width` and `clamp-height` set upper bounds when resizing with `fit=fit`. An image below both bounds keeps its
dimensions. With the same configuration above, this smaller upload stays at 240×180 pixels while its format changes
from JPG to WebP:

<div className="doc-images">
  <figure className="doc-image">
    <img src="/image-examples/preprocessing/cow-resized-input-240.jpg" alt="Small cow JPG supplied for preprocessing"
      width="240" height="180" loading="lazy" decoding="async" />
    <figcaption>Supplied content · JPG · 240×180 pixels</figcaption>
  </figure>
  <figure className="doc-image">
    <img src="/image-examples/preprocessing/cow-preprocessed-small-240.webp"
      alt="Preprocessed cow WebP retaining the small upload's dimensions"
      width="240" height="180" loading="lazy" decoding="async" />
    <figcaption>Stored original · WebP · 240×180 pixels</figcaption>
  </figure>
</div>

:::note
`w` and `h` take precedence over `clamp-width` and `clamp-height`, respectively. Avoid mixing explicit dimensions and
clamps in the same preprocessing rule.
:::
