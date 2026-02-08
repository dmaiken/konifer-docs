---
sidebar_position: 4
id: asset-updating
title: Updating Assets
sidebar_label: "Update"
---

# API Overview
Konifer lets you update asset metadata only. The content cannot be updated.

## Request
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
| Field Name | Type     | Description                                                                          | Required |
|------------|----------|--------------------------------------------------------------------------------------|----------|
| `alt`      | String   | The supplied alt text of your asset                                                  | No       |
| `labels`   | Object   | Supplied key-value pairs associated with the asset                                   | No       |
| `tags`     | Array    | Supplied attributes associated with the asset                                        | No       |

:::warning
PUT is a complete replacement of the asset metadata. Even if updating one field, the rest of the fields
must be supplied, or they are erased.
:::

## Response
The entire [asset metadata response](fetch-assets.md#fetching-metadata) is returned.
```http 
HTTP/1.1 200
Content-Type: application/json

{
  "class": "image",
  "alt": "Profile Picture",
  "entryId": 0,
  "labels": {
    "department": "engineering"
  },
  "tags": ["headshot", "team"],
  "source": "upload",
  "variants": [
	{
      "isOriginalVariant": false,
	  "storeBucket": "assets",
	  "storeKey": "b5050e94-0b05-471a-ae73-6cede8e077bd.webp",
	  "attributes": {
	    "height": 1752,
        "width": 2560,
        "format": "webp",
		"pageCount": 1,
		"loop": 0
      },
      "transformation": {
	    "width": 2560,
        "height": 1752,
		"fit": "fit",
		"gravity": "center",
		"format": "webp",
		"rotate": "zero",
		"flip": "none",
		"filter": "none",
		"blur": 150,
		"quality": 80,
		"padding": {
		  "amount": 0,
		  "color": []
		}
      },
	  "lqip": {}
	},
	{
	  "isOriginalVariant": true,
	  "storeBucket": "assets",
	  "storeKey": "d1caa24e-daba-4398-9fef-68c8b275456b.webp",
	  "attributes": {
        "height": 1752,
        "width": 2560,
        "format": "webp",
        "pageCount": 1,
        "loop": 0
      },
      "lqip": {}
    }
  ]
}
```
