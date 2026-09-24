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

## Cache Size Limit

By default, Konifer caches up to 16 generated variants per asset. The Original Variant does not count toward this
limit.

Set `transform.retention.cache.max-variants` in Path Configuration to change the limit:

```hocon
paths {
  "/**" {
    transform {
      retention {
        cache {
          max-variants = 16
          access-score-half-life = 1h
        }
      }
    }
  }
}
```

`max-variants` must be a positive integer and must exceed the number of eager variants configured for the path.

### Eviction Policy

Konifer checks the limit after it finishes generating and uploading a variant. If the new variant would exceed the
limit, Konifer keeps it and evicts existing generated variants until the cache returns to the configured size. Konifer
does not count the Original Variant or variants whose uploads remain pending.

With PostgreSQL, Konifer evicts the variant with the lowest access score first. Each access increases a variant's score,
and the score decays over time. The `access-score-half-life` property controls the decay rate: a variant's score falls
by half after one half-life without another access. The default half-life is 1 hour.

If you request an evicted variant, Konifer registers a cache miss, regenerates the variant, and may evict another cached
variant to stay within the limit.

## Expiration

Cached variants can also expire depending on your Path Configuration. See [Variant Expiration](expiration.md).
