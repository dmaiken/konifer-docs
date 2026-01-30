---
sidebar_position: 4
id: concepts-updating-assets
title: Updating Assets
sidebar_label: "Updating"
---
Asset content is considered immutable. This is done to simplify HTTP cache semantics. You **cannot** change an asset's
content at a given `entryId`. Depending on how you use the `entryId`, you have a few options:

1. To truly "replace" the asset, you can delete the asset and then upload a new one
2. If using the `entryId` as a versioning mechanism, you can simply POST the new asset to the path. Doing so will let you
fetch the newest asset by default when calling `GET /assets/your/path` since the default ordering modifier is `created`.

Asset metadata _can_ be updated, however. This includes:
- `alt`
- Labels
- Tags

## Updating asset metadata
To update asset metadata, you must `PUT` to the asset using the `entryId`. Relative selectors such as order are not allowed.
`PUT /assets` follows RESTful PUT semantics. The entire metadata payload must be supplied and all fields will be overwritten.

:::warning
PUT is a complete replacement of the asset metadata. Even if updating one field, the rest of the fields 
must be supplied or they will be erased.
:::

To update the metadata of an asset:
```http
PUT /assets/users/123/-/entry/0
Content-Type: application/json

{
  "alt": "Profile Picture",
  "tags": ["headshot", "team"],
  "labels": {
    "department": "engineering"
  }
}
```

## Cache-Control 
Updating metadata will automatically change the asset's ETag.

Even though the binary content has not changed, the ETag must rotate because metadata fields like `alt` are often served 
alongside the content (e.g., in the Konifer-Alt header). Rotating the ETag ensures that CDNs and browsers re-fetch the 
asset to receive the updated accessibility information.
