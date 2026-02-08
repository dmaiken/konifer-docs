---
sidebar_position: 3
id: asset-fetching
title: Fetching Assets
sidebar_label: "Fetch"
---
# API Overview
After an asset is stored, it can be fetched. Konifer offers powerful options to fetch your asset in a variety of ways using
query modifiers.

## Ordering
Ordering is specified using the `order` [query selector](../../Concepts/Assets/fetching-assets.md#ordering).

| Order      | Description                             | Default if not supplied |
|------------|-----------------------------------------|-------------------------|
| `new`      | Order by last-created (stack semantics) | Yes                     |
| `modified` | Order by last-modified                  |                         |

## Content Negotiation
Content format is specified in two ways, resolved in this order:
1. The `format` query parameter
2. The Accept header

Accept header is ignored completely if `format` is used. If no `format` is specified, Konifer selects the return format
using Accept header values. Prioritization is respected. Learn more about the Accept header 
[here](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Accept). If `Accept: image/*` is used,
the original variant's format is returned.

If no format is acceptable using either methods, a `400 Bad Request` is returned.

## Fetching Link (`/link`)
Fetches an absolute link to the asset as well as any [LQIP](../../Concepts/lqip.md) and `alt` fields. If no return format
selector is supplied, link is the default.

### Request
```http
GET /assets/users/123/profile-picture/-/link
```
or
```http
GET /assets/users/123/profile-picture
```

### Response
```http 
HTTP/1.1 200
Content-Type: application/json
K-Cache-Status: "hit" or "miss" depending on whether variant was generated or fetched

{
  "url": "https://mydomain.com/assets/users/123/profile-picture/-/entry/0/content",
  "lqip": {
    "blurhash": "BASE64",
    "thumbhash": "BASE64"
  },
  "alt": "Your alt"
}
```
| Field Name | Type     | Description                                                                  |
|------------|----------|------------------------------------------------------------------------------|
| `url`      | String   | The absolute URL (using `/entry`) to the `content` API                       |
| `lqip`     | LQIP     | Low-Quality Image Placeholder (LQIP) values if enabled in path configuration |
| `alt`      | String   | The `alt` supplied when storing the asset                                    |

## Fetching Redirect (`/redirect`)

### Request
```http
GET /assets/users/123/profile-picture/-/redirect
```

### Response
Returns a **`Temporary Redirect 307`**:
```http
HTTP/1.1 307
Location: https://assets.mycdn.com/d905170f-defd-47e4-b606-d01993ba7b42
```

If [redirection strategy](../../Concepts/Assets/fetching-assets.md#redirect-strategies) is `none` (default), then no redirect is returned:
```http
HTTP/1.1 200 OK
Content-Type: image/jpeg
Content-Length: 45123
Etag: 123456
K-Alt: "Your defined alt, if any"
K-Cache-Status: "hit" or "miss" depending on whether variant was generated or fetched
K-LQIP-Blurhash: "BASE64 Blurhash, if enabled"
K-LQIP-Thumbhash: "BASE64 Thumbhash, if enabled"

<image bytes>
```

## Fetching Metadata

### Request
```http
GET /assets/users/123/profile-picture/-/metadata
```

#### Limit
Metadata is the only return format where multiple assets can be returned. Specify limit using the `limit` query parameter.
- **Default**: 1
- **Fetch all at path**: -1

#### Variant Generation
Transformation parameters cannot be supplied (i.e. `h`, `r`, `blur`, etc.) when requesting asset metadata. A 400 is returned
if any transformation parameters are supplied. 

### Response
```http 
HTTP/1.1 200
Content-Type: application/json
K-Cache-Status: "hit" or "miss" depending on whether variant was generated or fetched

{
  "class": "image",
  "alt": "The alt text for an image",
  "entryId": 1049,
  "labels": {
    "label-key": "label-value",
    "phone": "Android"
  },
  "tags": [ "cold", "verified" ],
  "source": "url",
  "sourceUrl": "https://yoururl.com/image.jpeg",
  "variants": [
    {
      "isOriginalVariant": true,
      "storeBucket": "assets",
      "storeKey": "d905170f-defd-47e4-b606-d01993ba7b42",
      "imageAttributes": {
        "height": 100,
        "width": 200,
        "mimeType": "image/jpeg"
      },
      "lqip": {
        "blurhash": "BASE64",
        "thumbhash": "BASE64"
      }
    },
    {
      "isOriginalVariant": false,
      "storeBucket": "assets",
      "storeKey": "64fffa7e-85d2-42db-a081-354c91ec7ef9.webp",
      "attributes": {
        "height": 2560,
        "width": 1752,
        "format": "webp",
        "pageCount": 1,
        "loop": 0
      },
      "transformation": {
        "width": 2560,
        "height": 1752,
        "fit": "fit",
        "gravity": "center",
        "format": "webp",
        "rotate": "ninety",
        "flip": "none",
        "filter": "none",
        "blur": 0,
        "quality": 80,
        "padding": {
            "amount": 0,
            "color": []
        }
      },
      "lqip": {}
    }
  ],
  "createdAt": "2025-11-12T01:20:55"
}
```
| Field Name   | Type         | Description                                                          |
|--------------|--------------|----------------------------------------------------------------------|
| `class`      | String       | The type of the asset, currently always `image`                      |
| `alt`        | String       | The supplied alt text of your asset                                  |
| `entryId`    | Long         | System-generated unique identifier of asset within path              |
| `labels`     | Object       | Supplied key-value pairs associated with the asset                   |
| `tags`       | Array        | Supplied attributes associated with the asset                        |
| `source`     | String       | Either `url` or `upload` depending on how you provided asset content |
| `sourceUrl`  | String       | If URL source was used, then this is the supplied URL                |
| `variants`   | AssetVariant | Will only contain the original variant - the one supplied            |
| `createdAt`  | ISO 8601     | Date asset was stored                                                |
| `modifiedAt` | ISO 8601     | Date asset was last modified (ignores variant generation)            |

#### AssetVariant
| Field Name          | Type           | Description                                                                     |
|---------------------|----------------|---------------------------------------------------------------------------------|
| `isOriginalVariant` | Boolean        | Whether the variant is the original variant. Only one is `true`                 |
| `storeBucket`       | String         | The S3 bucket the asset is stored in - defined in path configuration            |
| `storeKey`          | String         | The key of the asset in the object store                                        |
| `attributes`        | Attributes     | Extracted attributes of the asset                                               |
| `transformation`    | Transformation | Normalized original variant transformation - not returned for original variants |
| `lqip`              | LQIP           | Low-Quality Image Placeholder (LQIP) values if enabled in path configuration    |

##### Attributes
| Field Name   | Type       | Description                                                                                                  |
|--------------|------------|--------------------------------------------------------------------------------------------------------------|
| `height`     | Integer    | Height of variant                                                                                            |
| `width`      | Integer    | Width of variant                                                                                             |
| `format`     | Format     | Format of variant                                                                                            |
| `pageCount`  | Integer    | Number of pages in image (0 unless image is animated)                                                        |
| `loop`       | Integer    | For mulit-paged images, specifies the amount of animated repitions. Defaults to 0, -1 is continuous looping  |

##### Transformation
Refer to the [Image Transformation Reference](../image-transformation-reference.md) for greater detail about available image transformations.

| Field Name | Type       | Description                                     | Allowed Values                                                       |
|------------|------------|-------------------------------------------------|----------------------------------------------------------------------|
| `height`   | Integer    | Height of variant in pixels                     | > 0                                                                  |
| `width`    | Integer    | Width of variant in pixels                      | > 0                                                                  |
| `fit`      | Attributes | Fit                                             | `fit`, `fill`, `stretch`                                             |
| `gravity`  | Gravity    | Gravity                                         | `center`, `entropy`, `attention`                                     |
| `format`   | Format     | Format of variant                               | See Format                                                           |
| `rotate`   | Rotate     | Rotation                                        | `zero`, `ninety`, `one_hundred_eight`, `two_hundred_seventy`, `auto` |
| `flip`     | Flip       | Whether variat is flipped and across which axis | `none`, `h`, `v`                                                     |
| `filter`   | Filter     | Filter                                          | `none`, `black_white`, `greyscale`, `sepia`                          |
| `blur`     | Integer    | Blur                                            | 0-150                                                                |
| `quality`  | Integer    | Compression quality (will be 100 for PNG)       | 1-100                                                                |
| `padding`  | Padding    | Padding                                         |                                                                      |

###### Padding
| Field Name | Type      | Description                               | Allowed Values |
|------------|-----------|-------------------------------------------|----------------|
| `amount`   | Integer   | Amount of padding in pixels               | >= 0           |
| `color`    | Integer[] | Color pf padding in [R, G, B, A] integers |                |

## Fetching Content

### Request
```http
GET /assets/users/123/profile-picture/-/content
```

### Response
```http
HTTP/1.1 200 OK
Content-Type: image/jpeg
Content-Length: 45123
Etag: 123456
K-Alt: "Your defined alt, if any"
K-Cache-Status: "hit" or "miss" depending on whether variant was generated or fetched
K-LQIP-Blurhash: "BASE64 Blurhash, if enabled"
K-LQIP-Thumbhash: "BASE64 Thumbhash, if enabled"

<image bytes>
```

:::note
Etag is only returned for this and the Download return format
:::

## Fetching Content Download
Same behavior as Content but with the addition of a `Content-Disposition: attachment` response header
### Request
```http
GET /assets/users/123/profile-picture/-/download
```

### Response
```http
HTTP/1.1 200 OK
Content-Type: image/jpeg
Content-Length: 45123
Etag: 123456
K-Alt: "Your defined alt, if any"
K-Cache-Status: "hit" or "miss" depending on whether variant was generated or fetched
K-LQIP-Blurhash: "BASE64 Blurhash, if enabled"
K-LQIP-Thumbhash: "BASE64 Thumbhash, if enabled"
Content-Disposition: attachment; filename="profile-picture.jpeg"
```
