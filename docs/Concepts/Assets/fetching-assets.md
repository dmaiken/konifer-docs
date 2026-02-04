---
sidebar_position: 3
id: concepts-fetching-assets
title: Fetching Assets
sidebar_label: "Fetching"
---
After an asset is stored, it can be fetched. Konifer offers powerful options to fetch your asset in a variety of ways using
query modifiers.

## Query Selectors
Query selectors are positional values specified after the path-separator, `/-/`. They are used to control the format
and ordering of fetched assets.

### Defaults
The following are the default values and can be omitted as modifiers:
- return_format: `link`
- ordering: `created`

So this:
```http
GET /assets/users/123/profile-picture
```
Is the same as:
```http
GET /assets/users/123/profile-picture/-/link/created/
```
Any default can be omitted for brevity
```http
GET /assets/users/123/profile-picture/-/metadata/created
```
is the same as:
```http
GET /assets/users/123/profile-picture/-/metadata
```

## Return format
You can return your asset in one of five different return formats:

### `link` (default)
Returns a link to the asset in your object store. If you have any LQIPs enabled, these are returned as well.
```http
GET /assets/users/123/profile-picture/-/link
```
Returns:
```json
{
  "url": "https://assets.s3.us-east-2.amazonaws.com/d905170f-defd-47e4-b606-d01993ba7b42",
  "lqip": { // Empty if LQIPs are disabled
    "blurhash": "BASE64",
    "thumbhash": "BASE64"
  },
  "alt": "Your alt"
}
```
#### Asset Link Response
| Field Name | Type     | Description                                                                                        |
|------------|----------|----------------------------------------------------------------------------------------------------|
| `url`      | String   | The S3 URL of the requested variant - can be path or virtual-host style depending on configuration |
| `lqip`     | LQIP     | Low-Quality Image Placeholder (LQIP) values if enabled in path configuration                       |
| `alt`      | String   | The `alt` supplied when storing the asset                                                          |

### `content`
Typically used when you want Konifer to apply transformations (e.g., resizing) and stream the result without
exposing the underlying S3 URL.
```http
GET /assets/users/123/profile-picture/-/content
```
Returns:
```http
HTTP/1.1 200 OK
Content-Type: image/jpeg
Content-Length: 45123
K-Alt: "Your defined alt, if any"
```

### `download`
Similar to `content` but sets the `Content-Disposition` header so that the asset triggers a "Save As" dialog in a browser.
```http
GET /assets/users/123/profile-picture/-/download
```
Returns:
```http
HTTP/1.1 200 OK
Content-Type: image/jpeg
Content-Length: 45123
Content-Disposition: attachment; filename="profile-picture.jpeg"
```
> Note: the `filename` in the `Content-Dipsosition` headers will be the `alt` if supplied, or else the path.

### `redirect`
By default, redirection is disabled and using the redirect selector will return asset content just like the content selector does.
To enable, a redirect strategy must be defined within your path configuration.

If enabled,
```http
GET /assets/users/123/profile-picture/-/redirect
```
Returns a **`Temporary Redirect 307`**:
```http
Code: 307
Location: https://assets.mydomain.com/d905170f-defd-47e4-b606-d01993ba7b42
```

#### Redirect Strategies
Redirect strategies are defined within path configuration. The default strategy is `none`.
```hocon
paths = [
  {
    path = "/**"
    object-store {
      redirect {
        strategy = "none|presigned|template"
      }
    }
  }
]
```

##### Presigned Redirection
Setting strategy to `presigned` will cause a presigned URL from your configured object store to be generated and used
as the redirection URL in the `Location` response header. This strategy is only available for S3 and S3-compatible object stores,
however, you must ensure your S3-compatible object store supports the Presigned API (most do).

This strategy is not available for in-memory or filesystem object stores. If `presigned` is used for these object store implementations,
no error will be thrown, but redirection will remain disabled.

To set the TTL for the presigned URL, specify it within the `presigned` configuration block.
```hocon
paths = [
  {
    path = "/**"
    object-store {
      redirect {
        strategy = presigned
        presigned {
          ttl = 30m # default value
        }
      }
    }
  }
]
```

##### Template Redirection
Template redirection gives you a powerful way to redirect to a proxy or expose your bucket directly. Simply define a 
template string and Konifer will use that to resolve your redirection URL.
```hocon
paths = [
  {
    path = "/**"
    object-store {
      redirect {
        strategy = template
        template {
          string = "https://{bucket}.mydomain.com/{key}"
        }
      }
    }
  }
]
```
Konifer will use the `{bucket}` and `{key}` variables in your template to populate a URL string. Any protocol is permitted
except for executable protocols such as `javascript:`, `vbscript:`, and `data:`.

### `metadata`
A json response of the image and it's properties, cached variants, and image attributes.
```http
GET /assets/users/123/profile-picture/-/metadata
```
Returns:
```json
{
  "class": "IMAGE",
  "alt": "The alt text for an image",
  "entryId": 1049, // Unique identifier scoped to the path
  "labels": {
    "label-key": "label-value",
    "phone": "Android"
  },
  "tags": [ "cold", "verified" ],
  "source": "URL", // or UPLOAD if using multipart upload
  "sourceUrl": "https://yoururl.com/image.jpeg",
  "variants": [
    {
      "bucket": "assets", // Defined in configuration
      "storeKey": "d905170f-defd-47e4-b606-d01993ba7b42", // Generated by Konifer
      "imageAttributes": {
        "height": 100,
        "width": 200,
        "mimeType": "image/jpeg"
      },
      "lqip": { // Empty if LQIPs are disabled
        "blurhash": "BASE64",
        "thumbhash": "BASE64"
      }
    }
  ],
  "createdAt": "2025-11-12T01:20:55" // ISO 8601
}
```

#### Asset Metadata Response
| Field Name   | Type         | Description                                                          |
|--------------|--------------|----------------------------------------------------------------------|
| `class`      | String       | The type of the asset, currently always `IMAGE`                      |
| `alt`        | String       | The supplied alt text of your asset                                  |
| `entryId`    | Long         | System-generated unique identifier of asset within path              |
| `labels`     | Object       | Supplied key-value pairs associated with the asset                   |
| `tags`       | Array        | Supplied attributes associated with the asset                        |
| `source`     | String       | Either `URL` or `UPLOAD` depending on how you provided asset content |
| `sourceUrl`  | String       | If URL source was used, then this is the supplied URL                |
| `variants`   | AssetVariant | Will only contain the original variant - the one supplied            |
| `createdAt`  | ISO 8601     | Date asset was stored                                                |
| `modifiedAt` | ISO 8601     | Date asset was last modified                                         |

## Ordering
When fetching a single asset or multiple assets, you can specify an ordering. Currently only **`created`** is supported,
meaning the asset(s) are returned in the order of creation, **descending (newest first)**. Using `created` means each
path operates like a stack where the newest image is returned first.

To specify an ordering place it after the return format option:
```http
GET /assets/users/123/profile-picture/-/redirect/created
```
This also works if you are wanting the `link` of the newest asset in the path since `link` is the default return format:
```http
GET /assets/users/123/profile-picture/-/created
```
TODO: support `!created` and `modified`.

## Limit
For `metadata` return formats, you can return more than one.  To return the 3 most-recent assets, specify the `limit` query 
parameter, or `-1` for all assets within the path:
```http
GET /assets/users/123/profile-picture/-/link/created?limit=3
```

### Entry ID
When an asset is stored within your path, it is assigned a unique `entryId`. This ID is an absolute reference to the asset
within your path. It is guaranteed to be unique relative to the path. Assets can be fetched by their path + `entryId`
using the `entry` Query Modifier.

To fetch a specific asset (`entryId` of 42) using the default `link` return format:
```http
GET /assets/users/123/profile-picture/-/entry/42
```
Additionally, you can specify the return format along with the `entryId`:
```http
GET /assets/users/123/profile-picture/-/entry/42/redirect
```
Ordering query selectors **cannot** be used with the `entry` modifier.