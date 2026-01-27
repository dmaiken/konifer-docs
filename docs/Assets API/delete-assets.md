---
sidebar_position: 5
id: asset-deleting
title: Deleting Assets
sidebar_label: "Delete"
---
# Overview
Konifer takes a simple approach to deleting assets. When the asset is deleted, the metadata is deleted synchronously. All variant content is
removed from the object store asynchronously, however the variant metadata is deleted synchronously. There is **no recovery of an asset** after it is deleted.

# Delete Modifiers
Delete modifiers are positional values specified after the path-separator, `/-/`. For the Delete Assets API, the positional ordering is:
```http request
DELETE /assets/{path}/-/{order}/{limit}
```

## Defaults
The following are the default values and can be omitted as modifiers:
- ordering: `created`
- limit: 1

So this:
```http request
DELETE /assets/users/123/profile-picture
```
Is the same as:
```http request
DELETE /assets/users/123/profile-picture/-/created/1
```

## Order
The `order` modifier functions identically to the `order` modifier when fetching assets. 
1. `created`: orders by the date the asset was created, descending. The newest asset created at the path will be returned first
2. `modified`: orders by the date the asset was modified, descending. The most recently-modified asset at the path will be returned first.
Note that an asset is not modified when a new variant is created. Only when attributes specific to the asset have been updated (labels, tags, alt, etc)
will the asset have been considered modified.

## Limit
The `limit` modified functions identically to the `limit` modifier when fetching assets. It limits the amount of assets relative
to the supplied `order` will be deleted. 

For example, this will delete the 5 most-recently created assets in the `/users/123/images` path:
```http request 
DELETE /assets/users/123/images/-/created/5
```

# Deleting By `entryId`
To delete a specific asset by it's `entryId`, supply the `entryId` in the URL:
```http request 
DELETE /assets/users/123/profile-picture/-/entry/1
```

# Deleting By Path
To delete all assets at a specific path, set the `limit` to `all`. Any assets defined underneath the supplied with will
not be deleted.

```http request 
DELETE /assets/users/123/profile-picture/-/all
```

# Deleting Assets Recursively
Let's say we want to delete all assets for user 123. To do so, supply the `recursive` modifier in your request:
```http request 
DELETE /assets/users/123/-/recursive
```
This will delete all assets with a path that starts with `/users/123`.
