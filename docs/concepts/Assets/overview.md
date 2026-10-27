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

### Path rules

Use a standalone `-` segment to separate the asset path from selectors. Ordinary path segments may contain or end
with hyphens:

```http
GET /assets/album-/photo
GET /assets/album-/-/info
GET /assets/album-/photo/-/entry/42/content
```

The first request selects an asset at `album-/photo` using the default selectors. The second requests metadata at
`album-`. The third requests the content of entry `42` at `album-/photo`.

You cannot use a standalone `-` segment in an asset path. Supply a nonempty selector section after the separator,
and use at most one separator. Konifer returns `400 Bad Request` for paths such as `/assets/album/-`,
`/assets/album/-/`, or `/assets/album/-/info/-/entry/42`. Omit the separator to use the default selection.
Store requests cannot include selectors.

Earlier versions also interpreted segments ending in `-` as selector boundaries. Hyphenated segments now remain
part of the asset path; empty selector sections return `400 Bad Request`.

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

To query for assets by label, prefix each label query parameter with `label:`. Use this prefix for label filters in
fetch and delete URLs.

```http
GET /assets/users/123?label:label-key=label-value&label:phone=Android
```

Combine labels with query selectors to fetch up to five of the newest entries containing `phone=iphone`:

```http
GET /assets/users/123/-/new/entries?label:phone=iphone&limit=5
```

### Deleting

Use labels to filter exact-path or recursive bulk deletion. To delete a bounded selection, first fetch the matching
entries, then delete each returned entry ID:

```http
GET /assets/users/123/-/new/entries?label:phone=iphone&limit=5
DELETE /assets/users/123/-/entry/42
```

Replace `42` with an ID from the response's `entries` array and repeat the DELETE for the other returned IDs.
Retain the IDs for retries; the fetch and deletions are separate requests. See
[Deleting Assets](deleting-assets.md#delete-a-bounded-selection).

#### Delete all with label(s)

To delete all assets at a particular path, set your `limit` to `-1` and supply the labels.

```http
DELETE /assets/users/123?label:phone=iphone&limit=-1
```

#### Recursively delete

Recursive deletes can be performed with labels as well. To delete assets at and underneath a path, supply the label(s)
and the `recursive` selector.

```http
DELETE /assets/users/123/-/recursive?label:phone=iphone
```

### Reserved words

Use `label:` for label query parameters, including names that overlap transformation parameters. For example, filter
by the label `width=wide` and request a 100-pixel-wide image with:

```http
GET /assets/users/123/-/new/content?label:width=wide&width=100
```

Keep ordinary label keys, such as `width`, in POST/PUT JSON and response label maps. In the Kotlin and Java clients,
pass ordinary keys to `matchingLabels(...)`; the client adds `label:` when building the URL. See
[label filter examples](../../reference/api/assets/fetch-assets.mdx#label-filters).

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
