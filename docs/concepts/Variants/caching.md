---
sidebar_position: 2
id: concepts-variant-caching
title: Variant Caching
sidebar_label: "Caching"
---

When variants are generated eagerly or on-demand, they are cached in your configured object store. If a matching
cached variant already exists, Konifer returns it. Otherwise, Konifer generates the variant and persists it for future
requests.

Caching applies equally to eager and on-demand variants. The difference is simply when the variant is first generated.

## Normalized Variant Requests

Konifer normalizes variant requests when possible so that equivalent transformations resolve to the same cached
variant. This prevents duplicate variants from being generated and stored when different requests produce the same
result.

For example, these two requests generate the same variant:

```http
GET /assets/users/123/profile-picture?f=h&r=180
```

```http
GET /assets/users/123/profile-picture?f=v
```

The first requests a variant that is horizontally flipped and rotated 180 degrees. The second requests a vertically
flipped variant. Although the requests are different, the resulting image is the same, so Konifer can reuse the same
cached variant.

This normalization reduces unnecessary storage and avoids repeated work for transformations that are different in form
but equivalent in output.

## Cache Misses

If no cached variant matches the normalized request, Konifer generates the variant from the Original Variant and stores
it in the object store.

## Expiration

Cached variants can also expire depending on your Path Configuration. See [Variant Expiration](expiration.md).
