---
sidebar_position: 2
id: concepts-storing-assets
title: Storing Assets
sidebar_label: "Storing"
---
When storing an asset, the content must be supplied as well as any optional metadata. The content can be supplied as:
- a multi-part upload if you possess the binary asset content
- a URL supplied alongside any metadata

When asset content is stored, it is referred to as the `originalVariant`. When fetching asset metadata, `isOriginalVariant` is
`true` for the variant that represents the original supplied content.

## Multipart upload
Binary asset data can be supplied using [HTTP Multipart Form Data](https://www.ietf.org/rfc/rfc2388.txt). More information
about HTTP Multipart Forms [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/POST). Your request
should look like this:
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
Content-Disposition: form-data; name="file"; filename="my-image.jpg"
Content-Type: image/jpeg

[Binary data of the image file...]
-----------------------------974767299852498929531610575--
```
Only one image and one form multipart can be supplied.

## URL upload
If you wish to supply a URL referencing your asset, you must allow the subdomain in your configuration. By default,
Konifer does not permit any HTTP subdomains. To allow Konifer to connect to an HTTP subdomain, supply them in your HOCON.
```hocon
source {
  url {
    allowed-domains = [
      "your-domain.com"
    ]
  }
}
```
If the domain is not allowed when uploading an asset, a 400 is returned.

A request to store an asset using a URL looks like this (omitting all optional metadata):
```json
{
  "url": "your-domain.com/your-image.jpeg"
}
```

## Metadata
Asset metadata is supplied as JSON. All metadata is optional, but fields such as `alt` and LQIP(s) are useful for display purposes
and are returned as headers when fetching asset content.

```json
{
  "alt": "The alt text for an image",
  "labels": {
    "label-key": "label-value",
    "phone": "Android"
  },
  "tags": [ "cold", "verified" ]
}
```

## Asset Preprocessing
When you store an asset, you can transform the source content. Doing so means the original variant becomes the 
result of your defined transformation. Any variant generated for this asset is generated from the original variant. 
Keep this in mind when defining any preprocessing. For example preprocessing an image down to 50x50 limits
your ability to create sharp, resized variants larger than 50x50.

The following configuration converts the supplied asset content to an AVIF image format and set the width to 1024.
```hocon
paths = [
  {
    path = "/users/**"
    preprocessing {
      enabled = true
      image {
        format = "image/avif"
        w = 1024
      }
    }
  }
]
```

All [image transformation parameters](../../Reference/image-transformation-reference.md#parameter-reference) can be used within the `image` block.

### Max Width/Height
In addition to all image transformation parameters, you can also specify `max-height` and `max-width`. If the source content's
height or width exceeds their respective maximums, they are downscaled.

The following configuration will downscale any image larger than 1024x1024 down to 1024x1024 using a fit mode of `fit`.
```hocon
paths = [
  {
    path = "/users/**"
    preprocessing {
      enabled = true
      image {
        max-height = 1024
        max-width = 1024
        fit = fit # Optional - defaults to: fit
      }
    }
  }
]
```

:::note
`h` and `w` take precedence over `max-height` and `max-width` respectively. This configuration will result in images being
scaled to 2048x1024. Avoid mixing height/width and `max-height`/`max-width`.

```hocon
paths = [
  {
    path = "/users/**"
    preprocessing {
      enabled = true
      image {
        max-height = 1024
        max-width = 1024
        w = 2048
      }
    }
  }
]
```
:::
