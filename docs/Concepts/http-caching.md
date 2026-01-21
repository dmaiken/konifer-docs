---
sidebar_position: 6
id: http-caching
title: HTTP Caching
sidebar_label: "HTTP Caching"
---

# Overview
Konifer exposes highly-customizable `Cache-Control` headers. Due to the relative nature of the API, no assumptions are made
regarding the appropriate `Cache-Control` header to apply to an asset. 

## Cache-Control Configuration
The `Cache-Control` header can be configured per-path. The following options are available:

| Parameter                 | Description                                           | Allowed Input                                     | Default |
|:--------------------------|:------------------------------------------------------|:--------------------------------------------------|:--------|
| `enabled`                 | Whether the `Cache-Control` header should be returned | Boolean                                           | `false` |
| `max-age`                 | Set the `max-age` descriptor                          | Integer `> 0`                                     |         |
| `s-maxage`                | Set the `max-age` descriptor                          | Integer `> 0`                                     |         |
| `visibility`              | Set the visbility of the cached asset                 | `public`, `private`                               |         |
| `revalidate`              | Cache control revalidation                            | `must-revalidate`, `proxy-revalidate`, `no-cache` |         |
| `stale-while-revalidate ` | Set the `stale-while-revalidate` descriptor           | Integer `> 0`                                     |         |
| `stale-if-error `         | Set the `stale-if-error` descriptor                   | Integer `> 0`                                     |         |
| `immutable`               | Whether to set the `immutable` descriptor             | Boolean                                           | `false` |

Konifer does not validate proper semantic `Cache-Control` configurations.

### Usage
To configure, specify properties within the `cache-control` block of your path configuration. You can explore more about the proper
usage of `Cache-Control` header directives [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control).
```hocon
{
  path-configuration = [
    {
      path = "/users"
      cache-control {
        enabled = true
        max-age = 1000000
        s-maxage = 2000000
        immutable = true
      }
    }
  ]
}
```

## Etags
Etags are always enabled and will be returned regardless of your `cache-control` configuration. `Etags` and conditional 
validation are only enabled when returning asset in the `content` return format. The usage of `Etags` is outside of the scope
of this document but can be explored further [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/ETag).
