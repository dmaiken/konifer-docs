---
sidebar_position: 3
id: concepts-fetching-assets
title: Fetching Assets
sidebar_label: "Fetching"
---

Fetch requests use query selectors to choose an asset entry and its response format.

## Query Selectors

Query selectors are positional values specified after the path-separator, `/-/`. They are used to control the format
and ordering of fetched assets.

Query selectors are specified in the following order:

1. **Ordering**: what asset(s) you want
2. **Return format**: how you want the asset(s) presented

### Defaults

The following are the default values and can be omitted as selectors:

- **Ordering**: `new`
- **Return Format**: `link`

For example, this request:

```http
GET /assets/users/123/profile-picture
```

is equivalent to:

```http
GET /assets/users/123/profile-picture/-/new/link/
```

You can omit either default. For example:

```http
GET /assets/users/123/profile-picture/-/new/info
```

is equivalent to:

```http
GET /assets/users/123/profile-picture/-/info
```

## Ordering

When fetching a single asset or multiple assets, you can specify the order.

- **`new`** (default): Select the newest entry, or list entries in creation order, newest first, with `entries`.
- **`modified`**: Select the last-modified entry, or list entries in modification order, newest first, with `entries`.

Use the `entries` return format to fetch multiple assets. Other return formats select one entry and permit only
`limit=1` when you supply a limit.

To specify an ordering, place it before the return format selector:

```http
GET /assets/users/123/profile-picture/-/new/redirect
```

Because `link` is the default response format, this request returns the link for the newest asset:

```http
GET /assets/users/123/profile-picture/-/new
```

## Return format

Choose one of these return formats:

### `link` (default)

Returns the asset's resolved delivery URL and the selected variant's attributes. If you have any LQIPs enabled, these
are returned as well. The attributes reflect the image delivered at the URL, including any requested transformations.

```http
GET /assets/users/123/profile-picture/-/link
```

Returns:

```json
{
  "url": "https://mydomain.com/assets/users/123/profile-picture/-/entry/0/content?format=jpeg&height=100&width=200",
  "lqip": { // Empty if LQIPs are disabled
    "blurhash": "BASE64",
    "thumbhash": "BASE64"
  },
  "alt": "Your alt",
  "attributes": {
    "height": 100,
    "width": 200,
    "format": "jpg",
    "rotate": "0",
    "horizontalFlip": false,
    "colorSpace": "srgb",
    "pageCount": 1
  }
}
```

#### Asset Link Response

| Field Name   | Type       | Description                                                                  |
|--------------|------------|------------------------------------------------------------------------------|
| `url`        | String     | The URL resolved by the path's `delivery.strategy`                           |
| `expiresAt`  | RFC 3339   | Populated for presigned URLs                                                 |
| `lqip`       | LQIP       | Low-Quality Image Placeholder (LQIP) values if enabled in path configuration |
| `alt`        | String     | The `alt` supplied when storing the asset                                    |
| `attributes` | Attributes | Image properties of the selected variant                                     |

Timestamp fields use UTC values ending in `Z`. See [Timestamps](../../reference/api/assets/fetch-assets.mdx#timestamps)
for precision and client types.

See the [Attributes fields](../../reference/api/assets/fetch-assets.mdx#attributes) in the Fetch Assets reference.

The default `service` delivery strategy produces an absolute URL to the selected entry's `/content` endpoint, as shown
above. These examples omit some default transformation parameters for readability. The `presigned` and `template`
strategies can instead produce an object-store or CDN URL.

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
K-Attr-Width: 200
K-Attr-Height: 100
K-Attr-Format: jpg
K-Attr-Rotate: 0
K-Attr-Horizontal-Flip: false
K-Attr-Color-Space: srgb
K-Attr-Page-Count: 1
```

Content and download responses include the selected variant's dimensions, format, color space, remaining display
orientation, and applicable animation or pixel attributes in `K-Attr-*` headers. These describe the bytes in that
response. See [Content attribute headers](../../reference/api/assets/fetch-assets.mdx#content-attribute-headers).

For a raw image buffer, request `format=pixels` with `pixel-channels` and `pixel-layout`. Fetch `link` with the same
transformation if you need a delivery URL; fetch `content` to get bytes and attributes together. See
[Raw Pixels](../pixels.md) for the buffer format and
[client examples](../../reference/api/assets/fetch-assets.mdx#example-raw-pixels).

### `download`

Similar to `content` but sets the `Content-Disposition` header so that the asset triggers a "Save As" dialog in a
browser.

```http
GET /assets/users/123/profile-picture/-/download
```

Returns:

```http
HTTP/1.1 200 OK
Content-Type: image/jpeg
Content-Length: 45123
Content-Disposition: attachment; filename*=UTF-8''profile-picture.jpeg
```

> Note: the `filename` in the `Content-Dipsosition` headers is the `alt` if supplied, or else the path.

### `redirect`

Returns a `307 Temporary Redirect` to the same resolved delivery URL that the `link` response places in its `url` field.

```http
GET /assets/users/123/profile-picture/-/redirect
```

Returns a **`Temporary Redirect 307`**:

```http
Code: 307
Location: https://mydomain.com/assets/users/123/profile-picture/-/entry/0/content?format=jpeg&height=100&width=200
```

With the default `service` strategy, the location is the selected entry's `/content` endpoint. This keeps the redirect
selector useful with no delivery configuration.

#### Delivery Strategies

Delivery strategies are defined within Path Configuration and apply equally to `link` and `redirect`. The default
strategy is `service`.

```hocon
paths {
  "/**" {
    delivery {
      strategy = "service|presigned|template"
    }
  }
}
```

##### Service Delivery

The `service` strategy returns an absolute URL to the selected entry's `content` representation. Konifer uses
`http.public-url` as the base when configured; otherwise it uses the incoming request's scheme, host, and port.

You can fetch the returned URL without repeating the original request's `Accept` header. Konifer includes the selected
entry ID and resolved transformation parameters, including the output format, in the URL. It omits label filters and
other selection parameters. Treat the returned query string as part of the URL.

With [URL signing](../../reference/url-signing.md) enabled, Konifer signs the returned service URL. You do not need to
sign it again. This also applies to the service fallback for unsupported presigned delivery.

Konifer can regenerate an evicted variant from this URL. Fetches still obey the current path policy and transformation
limits; deleting the asset or changing configuration can make an existing URL unavailable.

##### Presigned Delivery

Setting strategy to `presigned` causes a presigned URL from your configured object store to be generated and used
in either the `link` response or the redirect `Location` header. This strategy is available for S3 and S3-compatible
object stores that support presigned requests.

The in-memory and filesystem providers cannot generate presigned URLs. When either provider is used with `presigned`,
Konifer falls back to the service delivery URL.

To set the TTL for the presigned URL, specify it within the `presigned` configuration block.

```hocon
paths {
  "/**" {
    delivery {
      strategy = presigned
      presigned {
        ttl = 30m # default value
      }
    }
  }
}
```

##### Template Delivery

Template delivery lets you route clients through a CDN or expose a bucket directly. Define a template string, and
Konifer uses it to resolve the delivery URL.

```hocon
paths {
  "/**" {
    delivery {
      strategy = template
      template {
        string = "https://{bucket}.mydomain.com/{key}"
      }
    }
  }
}
```

Konifer substitutes the selected variant's stored `{bucket}` and `{key}` values. This remains correct when path
configuration changes after an asset is stored. Any protocol is permitted except executable protocols such as
`javascript:`, `vbscript:`, and `data:`.

### `info`

A JSON response of the image and its properties, cached variants, and image attributes.

```http
GET /assets/users/123/profile-picture/-/info
```

Returns:

```json
{
  "class": "IMAGE",
  "alt": "The alt text for an image",
  "entryId": 1049,
  // Unique identifier scoped to the path
  "labels": {
    "label-key": "label-value",
    "phone": "Android"
  },
  "tags": [
    "cold",
    "verified"
  ],
  "source": "URL",
  // or UPLOAD if using multipart upload
  "sourceUrl": "https://yoururl.com/image.jpeg",
  "variants": [
    {
      "isOriginalVariant": true,
      "storeBucket": "assets",
      // Defined in configuration
      "storeKey": "d905170f-defd-47e4-b606-d01993ba7b42",
      // Generated by Konifer
      "imageAttributes": {
        "height": 100,
        "width": 200,
        "mimeType": "image/jpeg"
      },
      "lqip": {
        // Empty if LQIPs are disabled
        "blurhash": "BASE64",
        "thumbhash": "BASE64"
      }
    }
  ],
  "createdAt": "2025-11-12T01:20:55Z"
  // ISO 8601
}
```

#### Asset Info Response

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
| `createdAt`  | RFC 3339 UTC | Date asset was stored                                                |
| `modifiedAt` | RFC 3339 UTC | Date asset was last modified (ignores variant generation)            |

### `entries`

Fetch metadata for multiple entries at a path. Konifer returns an object with an `entries` array, which is empty
when no entries match. The default limit is 20.

```http
GET /assets/users/123/profile-picture/-/new/entries?limit=10
```

## Limits

For `entries`, supply a positive integer from `1` through `2147483647`, or use `limit=-1` to fetch all matching entries
at the exact path:

```http
GET /assets/users/123/profile-picture/-/entries?limit=-1
```

Other return formats default to 1 and accept only `limit=1`. Supply `limit` once. Blank, malformed, overflowing, zero,
below-`-1`, or repeated values return `400 Bad Request`. Konifer uses the default only when you omit the parameter.

The Kotlin and Java clients accept positive limits for `fetchEntries(limit)`; they do not expose HTTP's unlimited
listing option. See the [Fetch API reference](../../reference/api/assets/fetch-assets.mdx#limit).

## Entry ID

When an asset is stored within your path, it is assigned a unique `entryId`. This ID is an absolute reference to the
asset
within your path. It is guaranteed to be unique relative to the path. Assets can be fetched by their path + `entryId`
using the `entry` query selector.

To fetch a specific asset (`entryId` of 42) using the default `link` return format:

```http
GET /assets/users/123/profile-picture/-/entry/42
```

Additionally, you can specify the return format along with the `entryId`:

```http
GET /assets/users/123/profile-picture/-/entry/42/redirect
```

A URL with the `entry` selector is the absolute reference to the asset; therefore, ordering query selectors cannot be used
with the `entry` selector.

## Handling errors

Use the response `code` to distinguish path, transformation, and delivery failures.
See [Error Responses](../../reference/api/errors.md) for the codes and HTTP statuses.
