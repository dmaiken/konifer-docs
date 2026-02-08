---
sidebar_position: 5
id: asset-deleting
title: Deleting Assets
sidebar_label: "Delete"
---
When the asset is deleted, the metadata is deleted synchronously. All variant content is
removed from the object store asynchronously, however the variant metadata is deleted synchronously and the asset
is no longer accessible using Konifer APIs.

:::warning
Deleting an asset is unrecoverable. There is no way to reverse a delete, and there is no soft-delete mechanism!
:::

## Request
Request options are similar to fetching an asset. Order selectors and limits are available.

### Delete Specific Asset
Delete a specific asset by specifying its entryId. 

```http 
DELETE /assets/users/123/-/entry/0
```

### Ordering
Ordering is specified using the `order` [query selector](../../Concepts/Assets/fetching-assets.md#ordering).

| Order      | Description                             | Default if not supplied |
|------------|-----------------------------------------|-------------------------|
| `new`      | Order by last-created (stack semantics) | Yes                     |
| `modified` | Order by last-modified                  |                         |

### Limit
Multiple assets can be deleting using limits. Specify limit using the `limit` query parameter.
- **Default**: 1
- **Delete all at path**: -1

## Deleting Recursively
By using the `recursive` selector, you can delete all assets in a path as well as all sub-paths.

```http 
DELETE /assets/users/123/-/recursive
```

## Response
A `204 No Content` is always returned regardless of whether an asset was actually deleted or not.
