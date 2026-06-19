---
sidebar_position: 4
id: concepts-variant-expiration
title: Variant Expiration
sidebar_label: "Expiration"
---

Variant expiration controls how long cached variants are retained in your object store before Konifer treats them as
expired and purges them. Expiration applies to both eager and on-demand variants.

Expiration is configured in [Path Configuration](../path-configuration.md) using `transform.expire`. Since path
configuration is inherited, expiration rules defined on a parent path apply to child paths unless they are overridden
by a more-specific path.

```hocon
paths {
  "/**" {
    transform {
      expire {
        strategy = ttl
        ttl = 7d
      }
    }
  }

  "/users/**" {
    transform {
      expire {
        ttl = 30d
      }
    }
  }
}
```

In this example, all variants expire after 7 days by default, but variants under `/users/**` expire after 30 days.
Both `strategy` and `ttl` can be overridden by a more-specific path.

## Expiration Strategies

Konifer supports three expiration strategies:

- **`never`**: Variants do not expire.
- **`ttl`**: Variants expire after a fixed amount of time since they were created.
- **`idle`**: Variants expire after a fixed amount of time since they were last accessed.

The `ttl` property is used by both `ttl` and `idle` strategies and is ignored when the strategy is `never`.

## `ttl`

The `ttl` strategy expires a variant after a fixed lifetime measured from the time the variant is generated and cached.
Accessing the variant does not extend its lifetime.

This strategy is useful when you want a predictable maximum lifetime for cached variants regardless of how frequently
they are requested.

## `idle`

The `idle` strategy also uses `ttl`, but the timer is based on the variant's last access time rather than its creation
time. Each successful access refreshes the expiration window.

This strategy is useful when you want frequently requested variants to remain cached while allowing unused variants to
age out automatically.

## Eager and On-demand Variants

Eager and on-demand variants follow the same expiration rules. The difference is when the variant is first created.

An on-demand variant is generated at the time of its first request, so its creation time and first access
time are the same.

An eager variant may be generated before it is ever requested. That distinction does not change behavior under the
`never` or `ttl` strategies, but it can matter under `idle`. Since `idle` is based on the last access time, an eager
variant that is generated but never requested may expire without ever being served.

## Duration Format

The `ttl` value uses Konifer's standard `Duration` format. For example:

- `10m`
- `24h`
- `7d`

See the [Path Configuration Reference](../../Reference/configuration-reference.md#expiration) for the complete property
reference.

:::note
Due to how expired variants are purged, expiration may be delayed by up to 1 minute after the configured TTL.
:::
