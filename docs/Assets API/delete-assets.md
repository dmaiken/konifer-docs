---
sidebar_position: 4
id: asset-deleting
title: Deleting Assets
sidebar_label: "Delete"
---
# Overview
Direkt takes a simple approach to deleting assets. When the asset is deleted, the metadata is deleted and all variants are
removed from the object store. There is **no recovery of an asset** after it is deleted.

# Query Modifiers
For the Delete Assets API, the positional ordering is:
```http
DELETE /assets/{path}/-/{mode}
```

## Defaults
The following are the default values and can be omitted as modifiers:
- mode: `single`

So this:
```http
DELETE /assets/users/123/profile-picture
```
Is the same as:
```http
DELETE /assets/users/123/profile-picture/-/single
```

## Mode
Mode gives you options to delete multiple assets at once. The options are:
- `single`: Delete one asset at the path
- `children`: Delete all assets at the path
- `recursive`: Delete all assets at and underneath the path