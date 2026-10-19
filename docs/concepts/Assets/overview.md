---
sidebar_position: 1
id: concepts-assets
title: Assets
sidebar_label: "Overview"
---

An asset combines image content with information such as alt text, labels, and tags. Konifer stores information in the
configured data store and image content in the configured object store.

You can create and fetch assets or update their information. Image content remains immutable so caches can identify a
stored entry by its content.

## API

Create an asset with `POST /assets/{your/defined/path}`. Choose paths that match your application's domain. An
application with user-generated images might organize paths by user:

```http
POST /assets/users/123/profile-picture
```

```http
POST /assets/users/234/background
```

If they were blog-oriented:

```http
POST /assets/blog/123/post/5
```

Multiple assets can share a path. Send another `POST` to create a new entry at that path. A fetch request returns the
newest entry by default; query selectors can select a different entry or ordering.

## Content

The following content types are currently supported by Konifer:

| Name    | Content-Type | Format | Animated Format Supported |
|---------|--------------|--------|---------------------------|
| JPEG    | `image/jpeg` | `jpg`  | N/A                       |
| PNG     | `image/png`  | `png`  | No (`apng`)               |
| WEBP    | `image/webp` | `webp` | Yes                       |
| AVIF    | `image/avif` | `avif` | No                        |
| JPEG_XL | `image/jxl`  | `jxl`  | N/A                       |
| HEIC    | `image/heic` | `heic` | N/A                       |
| GIF     | `image/gif`  | `gif`  | Yes                       |

## Metadata

An asset can have the following information supplied when creating or updating an asset:

- alt
- labels
- tags

## Alt

An `alt` is intended to populate the `alt` attribute of an HTML tag such as `<img>`. It is returned within asset
information but is also returned in the `K-Alt` response header when requesting asset `content`. To comply
with general limits set by screen readers, the maximum length of an `alt` is 125 characters.

When requesting asset `link`, `alt` is returned in the response JSON.

## Labels

Labels are key-value pairs used to define custom attributes to the asset. They are optional. Up to 50 labels can be
associated with an asset.
To specify them when storing or updating an asset, use the `labels` field in the request.

```json
{
    "labels": {
        "label-key": "label-value",
        "phone": "Android"
    }
}
```

### Querying

Labels can be used to query for assets. They are supplied as query parameters.

```http
GET /assets/users/123?label-key=label-value&phone=Android
```

Labels can also be combined with other query selectors to further filter your results. For example, this returns the
information of the five most-recently
created assets containing the label of `phone=iphone`:

```http
GET /assets/users/123/-/new/info?phone=iphone&limit=5
```

### Deleting

Labels can be used to delete assets and are used in the same manner as fetching assets. For example, this deletes the five
most-recently
created assets containing the label of `phone=iphone`:

```http
DELETE /assets/users/123/-/new?phone=iphone&limit=5
```

#### Delete all with label(s)

To delete all assets at a particular path, set your `limit` to `-1` and supply the labels.

```http
DELETE /assets/users/123?phone=iphone&limit=-1
```

#### Recursively delete

Recursive deletes can be performed with labels as well. To delete assets at and underneath a path, supply the label(s)
and the `recursive` selector.

```http
DELETE /assets/users/123/-/recursive?phone=iphone
```

### Reserved words

Labels and transformation parameters (`height`, `width`, etc.) are both defined using query parameters. To specify
a label with
the key `width`, prefix the key with
`label:`.

```http
GET /assets/users/123/-/new/info?label:width=wide
```

Prefixing labels using reserved keys is not necessary when creating or updating labels through a POST or PUT.

### Rules

- Maximum number of labels: 50
- Maximum label key length: 128 characters
- Maximum label value length: 256 characters

## Tags

Tags are similar to labels in that they are custom attributes assignable to an asset but differ in the following ways:

- They are value-only and do not contain any key-value structure
- They cannot be used to query or delete assets

To specify tags when storing or updating an asset, use the `tags` field in the request.

```json
{
    "tags": [
        "happy",
        "smiling",
        "bread"
    ]
}
```

### Rules

- Maximum number of tags: 50
- Maximum tag value length: 256
