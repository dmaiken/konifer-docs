---
sidebar_position: 5
id: concepts-deleting-assets
title: Deleting Assets
sidebar_label: "Deleting"
---
Assets can be deleted using the same path selectors used for fetching. You can delete single assets by ID, multiple 
assets by order/limit, or entire path trees recursively.

## Delete Behavior
When you issue a delete request:
1.  **Metadata:** The database record is removed immediately. The asset is no longer discoverable or queryable via the API.
2.  **Content:** The binary content (in S3/Filesystem) is scheduled for asynchronous removal. It is usually physically deleted within a few minutes.

:::warning
Deleting an asset is unrecoverable. There is no way to reverse a delete, and there is no soft-delete mechanism!
:::

### Idempotency
The Delete API is idempotent. If you request the deletion of an asset that does not exist (or has already been deleted), 
the API will still return `204 No Content`. This ensures that a "Delete" workflow always succeeds in ensuring the asset 
is gone, regardless of its prior state.

## Deleting a specific asset
To delete an asset explicitly, use the `entry` selector. This is the safest way to delete an asset since the reference
is absolute.

## Selectors
Similar to fetching, specifying the `order` plus an optional limit (defaulting to 1) will result in the top asset(s)
in that ordering being deleted.

```http 
DELETE /assets/users/123/profile/-/modified
```
This results in the single most-recently modified asset being deleted.

:::caution 
Race condition risk on paths with high write volume, using relative selectors (like `modified`) can result in 
deleting data you did not intend to (e.g., a new file arrives milliseconds before your request). Use with care. 
:::

```http 
DELETE /assets/users/123/profile/-/entry/0
```
This deletes the asset at `/users/123/profile` with `entryId` of 0.

## Bulk & recursive deletion
Konifer supports powerful bulk-delete operations for cleaning up entire user directories or projects.

### Delete all assets in the path
By setting the limit query parameter to `-1`, all assets will be deleted within the path.

```http 
DELETE /assets/users/123/profile?limit=-1
```

### Recursive delete
By using the `recursive` selector, you can delete all assets in a path as well as all sub-paths. 

:::tip
A common use-case of a recursive delete is if your paths are user-scoped, and that user is being deleted from your platform.
:::

```http 
DELETE /assets/users/123/-/recursive
```
This deletes assets at `/user/123/profile`, `user/123/profile/footer`, and `user/123/background`, and any asset
underneath `/user/123/`.
