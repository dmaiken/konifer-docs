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

When you store an asset, you can transform the source content. Doing so means the original variant becomes the
result of your defined transformation. Any variant generated for this asset is generated from the original variant.
Keep this in mind when defining any preprocessing. For example, preprocessing an image down to 50x50 limits
your ability to create sharp, resized variants larger than 50x50.

The following configuration converts the supplied asset content to an AVIF image format and sets the width to 1024.

```hocon
paths {
  "/users/**" {
    transform {
      preprocessing {
        enabled = true
        format = "image/avif"
        w = 1024
      }
    }
  }
}
```

All [image transformation parameters](../../reference/image-transformation-reference.md#parameter-reference) can be used
directly within the `preprocessing` block.

### Clamp Width/Height

In addition to all image transformation parameters, you can specify `clamp-height` and `clamp-width`. If the source
content's height or width exceeds the corresponding clamp, it is down-scaled.

The following configuration will downscale any image larger than 1024x1024 down to 1024x1024 using a fit mode of `fit`.

```hocon
paths {
  "/users/**" {
    transform {
      preprocessing {
        enabled = true
        clamp-height = 1024
        clamp-width = 1024
        fit = fit # Optional - defaults to: fit
      }
    }
  }
}
```

:::note
`h` and `w` take precedence over `clamp-height` and `clamp-width` respectively. This configuration will result in images
being scaled to 2048x1024. Avoid mixing height/width and `clamp-height`/`clamp-width`.

```hocon
paths {
  "/users/**" {
    transform {
      preprocessing {
        enabled = true
        clamp-height = 1024
        clamp-width = 1024
        w = 2048
      }
    }
  }
}
```

:::
