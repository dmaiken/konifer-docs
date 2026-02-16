---
sidebar_position: 2
id: asset-storing
title: Storing Assets
sidebar_label: "Store"
---
When you store an asset, the asset and it's metadata are stored in your object store and database, respectively.
There are two ways to store an asset:
1. **Multipart Upload:** Use this when the asset content is available locally.
2. **URL Source:** Use this when the asset content must be downloaded by Konifer from an external URL.

The URL structure for both is:
```http
POST /assets/{your/defined/path}
```
The difference is how the content is supplied. Only one method is allowed per request.

## Multipart Upload
A multipart upload lets you specify the asset content and metadata in the same request.

| Part Name  | Content-Type                         | Purpose                                                          | Required?                  |
|------------|--------------------------------------|------------------------------------------------------------------|----------------------------|
| `metadata` | `application/json`                   | A JSON body containing custom, user-defined data about the asset | Yes (but may be empty`{}`) |
| `asset`    | Image MIME type (e.g., `image/jpeg`) | The raw binary content of the file being stored.                 | Yes                        |

### Metadata JSON structure
The structure for the `metadata` part is (no fields are required):
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
| Field Name   | Type         | Description                                                          | Required  |
|--------------|--------------|----------------------------------------------------------------------|-----------|
| `alt`        | String       | The supplied alt text of your asset                                  | No        |
| `labels`     | Object       | Supplied key-value pairs associated with the asset                   | No        |
| `tags`       | Array        | Supplied attributes associated with the asset                        | No        |

## URL Source
Instead of supplying the file contents directly, you can specify a URL that Konifer downloads the asset content from. 
The request is identical to the multipart `metadata`, but you must add a `url` to the request:
```json
{
  "url": "https://yoururl.com/image.jpeg",
  "alt": "The alt text for an image",
  "labels": {
    "label-key": "label-value",
    "phone": "Android"
  },
  "tags": [ "cold", "verified" ]
}
```
| Field Name | Type     | Description                                                                          | Required |
|------------|----------|--------------------------------------------------------------------------------------|----------|
| `alt`      | String   | The supplied alt text of your asset                                                  | No       |
| `labels`   | Object   | Supplied key-value pairs associated with the asset                                   | No       |
| `tags`     | Array    | Supplied attributes associated with the asset                                        | No       |
| `url`      | String   | URL source of content. Domain must be allowed within `allowed-domains` configuration | Yes      |

Since there is only JSON in the request, the `Content-Type` is `application/json`.

## Store Asset Response
Regardless of the upload method used, a successful storage request returns a `201 Created` status and the following JSON response
representing the asset metadata.
```http 
HTTP/1.1 201 CREATED
Content-Type: application/json

{
  "class": "image",
  "alt": "The alt text for an image",
  "entryId": 42,
  "labels": {
    "label-key": "label-value",
    "phone": "Android"
  },
  "tags": [ "cold", "verified" ],
  "source": "url", // or "upload" if using multipart upload
  "sourceUrl": "https://yoururl.com/image.jpeg",
  "variants": [
    {
      "isOriginalVariant": true,
      "storeBucket": "assets",
      "storeKey": "d905170f-defd-47e4-b606-d01993ba7b42",
      "attributes": {
        "height": 100,
        "width": 200,
        "format": "jpg"
      },
      "lqip": {
        "blurhash": "BASE64",
        "thumbhash": "BASE64"
      }
    }
  ],
  "createdAt": "2025-11-12T01:20:55"
}
```
Additionally, a `Location` header is returned containing an absolute URL to the asset's link return format.
> Note: the entryId query selector is supplied so the URL is absolute and can be used for subsequent GET and PUT operations.

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

### AssetVariant
| Field Name          | Type           | Description                                                                          |
|---------------------|----------------|--------------------------------------------------------------------------------------|
| `isOriginalVariant` | Boolean        | Whether the variant is the original variant. For store-asset response, this is true. |
| `storeBucket`       | String         | The S3 bucket the asset is stored in - defined in path configuration                 |
| `storeKey`          | String         | The key of the asset in the object store                                             |
| `attributes`        | Attributes     | Extracted attributes of the asset                                                    |
| `transformation`    | Transformation | Normalized original variant transformation - not returned for original variants      |
| `lqip`              | LQIP           | Low-Quality Image Placeholder (LQIP) values if enabled in path configuration         |

#### Attributes
| Field Name  | Type    | Description                                                                                                 |
|-------------|---------|-------------------------------------------------------------------------------------------------------------|
| `height`    | Integer | Height of variant                                                                                           |
| `width`     | Integer | Width of variant                                                                                            |
| `format`    | Format  | Format of variant                                                                                           |
| `pageCount` | Integer | Number of pages in image (1 unless image is animated)                                                       |
| `loop`      | Integer | For mulit-paged images, specifies the amount of animated repitions. Defaults to 0; -1 is continuous looping |

#### Format
| Format | Name    | File Extension | Content Type |
|:-------|:--------|:---------------|:-------------|
| `png`  | PNG     | .png           | image/png    |
| `jpg`  | JPEG    | .jpeg          | image/jpeg   |
| `webp` | WEBP    | .webp          | image/webp   |
| `avif` | AVIF    | .avif          | image/avif   |
| `jxl`  | JPEG XL | .jxl           | image/jxl    |
| `heic` | HEIC    | .heic          | image/heic   |
| `gif`  | GIF     | .gif           | image/gif    |
