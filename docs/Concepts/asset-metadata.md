---
sidebar_position: 4
id: concepts-asset-metadata
title: Asset Metadata
sidebar_label: "Asset Metadata"
---
# Overview
An asset can have the following metadata supplied when creating or updating an asset:
- alt
- labels
- tags

## Alt
An `alt` is intended to populate the `alt` attribute of an HTML tag such as `<img>`. It will be returned as asset metadata but
will also be returned in the `Konifer-Alt` response header when requesting asset `content` or `link`. To comply with 
general limits set by screen readers, the maximum length of an `alt` is 125 characters.

## Labels
Labels are key-value pairs used to define custom attributes to the asset. They are optional. Up to 50 labels can be associated to an asset.
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
Labels can also be combined with other query modifiers to further filter your results. For example, this returns the metadata of the 5 most-recently
created assets containing the label of `phone=iphone`:
```http 
GET /assets/users/123/-/metadata/created/5?phone=iphone
```

### Deleting
Labels can be used to delete assets and are used in the same manner as fetching assets. For example, this deletes the 5 most-recently
created assets containing the label of `phone=iphone`:
```http 
DELETE /assets/users/123/-/created/5?phone=iphone
```

#### Delete All With Label(s)
To delete all assets at a particular path, set your `limit` to `all` and supply the labels.
```http 
DELETE /assets/users/123/-/all?phone=iphone
```

#### Recursive Delete
Recursive deletes can be performed with labels as well. To delete assets at and underneath a path, supply the label(s) and the `recursive` modifier.
```http 
DELETE /assets/users/123/-/recursive?phone=iphone
```

### Reserved words
Labels and transformation parameters (`h`, `w`, etc) are both defined using query parameters. To specify a label with the key `w`, prefix the key with 
`label:`.
```http
GET /assets/users/123/-/metadata/created/5?label:w=wValue
```
Prefixing labels using reserved keys is not necessary when creating or updating labels through a POST or PUT.

### Limits
- Maximum amount of labels: 50
- Maximum label key length: 128 characters
- Maximum label value length: 256 characters

## Tags
Tags are similar to labels in that they are custom attributes assignable to an asset but differ in the following ways:
- They are value-only and do not contain any key-value structure
- They cannot be used to query or delete assets

To specify tags when storing or updating an asset, use the `tags` field in the request.
```json
{
  "tags": [ "happy", "smiling", "bread" ]
}
```

### Limits
- Maximum amount of tags: 50
- Maximum tag value length: 256
