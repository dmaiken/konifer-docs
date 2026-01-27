---
sidebar_position: 2
id: concepts-storing-assets
title: Storing Assets
sidebar_label: "Storing"
---
# Overview
When storing an asset, the content must be supplied as well as any optional metadata. The content can be supplied as:
- a multi-part upload if you possess the binary asset content
- a URL supplied alongside any metadata

When asset content is stored, it is referred to as the `originalVariant`. When fetching asset metadata, `isOriginalVariant` will
be `true` for the variant that represents the original supplied content.

## Multipart upload
Binary asset data can be supplied using [HTTP Multipart Form Data](https://www.ietf.org/rfc/rfc2388.txt). More information
about HTTP Multipart Forms [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/POST). Your request
should look like this:
```http request
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
If the domain is not allowed when uploading an asset, a 400 will be returned.

A request to store an asset using a URL looks like this (omitting all optional metadata):
```json
{
  "url": "your-domain.com/your-image.jpeg"
}
```

## Metadata
Asset metadata is supplied as JSON. All metadata is optional, but fields such as `alt` are useful for accessibility purposes
and will be returned as headers when fetching asset content.

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

## Ingest Transformations
When you store an asset, you can transform the source content. Doing so means the `originalVariant` will become the 
result of your defined transformation. Any variant generated for this asset will use the transformed content. 
Keep this in mind when defining any ingest transformations. For example shrinking an image down to 50x50 will limit
your ability to create sharp, resized variants larger than 50x50.

The following configuration will convert the supplied asset content to an AVIF image format and set the width to 1024.
```hocon
path-configuration = [
  {
    path = "/users/**"
    image {
      preprocessing {
        format = "image/avif"
        w = 1024
      }
    }
  }
]
```
