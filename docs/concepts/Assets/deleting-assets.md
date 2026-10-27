---
sidebar_position: 5
id: concepts-deleting-assets
title: Deleting Assets
sidebar_label: "Deleting"
---

Choose an entry ID to delete one asset, `limit=-1` to delete all entries at an exact path, or `recursive` to delete
a path and its descendants. Each DELETE request requires one of these selections.

## Delete Behavior

Konifer removes the asset's metadata and variant references during the request, so you can no longer fetch the asset
through the API. It schedules object-store content for removal and retries failed cleanup.

:::warning
Deletion is permanent. Konifer has no soft-delete or restore operation.
:::

### Idempotency

A valid DELETE request returns `204 No Content`, including when no entries match. You can repeat an entry-specific
request after a lost response without deleting another entry at that path. Konifer does not reuse a deleted entry ID.

Bulk deletion evaluates matching entries when you send each request. A repeated bulk request can delete new matching
uploads that arrived after the first request. To keep a fixed selection, fetch entry IDs once and delete those IDs.

## Selectors

| Selection                    | Request                                       |
|:-----------------------------|:----------------------------------------------|
| One entry                    | `DELETE /assets/users/123/profile/-/entry/42` |
| All entries at an exact path | `DELETE /assets/users/123/profile?limit=-1`   |
| A path and its descendants   | `DELETE /assets/users/123/-/recursive`        |

Use the `entryId` from an upload or fetch response for an entry-specific request. Exact-path deletion leaves
descendant paths intact. Recursive deletion at `/users/123` includes `/users/123`, `/users/123/profile`, and
`/users/123/profile/footer`, for example.

Konifer returns `400 Bad Request` for a DELETE without a selection, or with an ordering selector such as `new` or
`modified`.

## Limit

For DELETE, `limit=-1` selects all matching entries at the exact path. There is no default deletion limit. Konifer
rejects positive DELETE limits and any supplied limit alongside an `entry` or `recursive` selector.

Supply `limit` once. Blank, malformed, overflowing, zero, or below-`-1` values return `400 Bad Request`. See the
[Delete API reference](../../reference/api/assets/delete-assets.mdx#limit) for the request rules.

### Delete a bounded selection

To delete up to five of the newest entries, first list them:

```http
GET /assets/users/123/profile/-/new/entries?limit=5
```

Then delete each `entryId` from the response's `entries` array:

```http
DELETE /assets/users/123/profile/-/entry/42
DELETE /assets/users/123/profile/-/entry/41
```

Use the returned IDs in place of the example IDs. Fetch the list once and retain it if you need to retry deletion.
These are separate requests: a failure can leave some entries deleted and others present. See the
[curl and client examples](../../reference/api/assets/delete-assets.mdx#example-delete-the-most-recently-modified-entries).

## Labels

Use labels to filter exact-path or recursive bulk deletion. For example, delete entries with `phone=iphone` at the
exact path:

```http
DELETE /assets/users/123/profile?limit=-1&label:phone=iphone
```

To include matching entries at descendant paths:

```http
DELETE /assets/users/123/-/recursive?label:phone=iphone
```

For a bounded selection with labels, filter the initial `entries` fetch and delete the returned IDs.
