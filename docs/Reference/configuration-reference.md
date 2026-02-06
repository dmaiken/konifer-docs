---
sidebar_position: 1
id: configuration-reference
title: Configuration Reference
sidebar_label: "Configuration Properties"
---
Values used in snippets are the default properties.

## Datastore
Properties for configuring the datastore.

```hocon 
datastore {
  provider = postgres
  postgres {
    database = konifer
    host = localhost
    port = 5432
    user = postgres
    password = ""
  }
}
```

## HTTP
```hocon
http {
  public-url = "http://localhost"
}
```
| Property      | Description                                                                                                    | Allowed Input                              | Default              |
|:--------------|:---------------------------------------------------------------------------------------------------------------|:-------------------------------------------|:---------------------|
| `public-url ` | The URL used to resolve content selector links. This will be the root public URL of your website/platform/API. | Any URL beginning with http:// or https:// | `http://localhost`   |


## Object Store
Properties for configuring the datastore.

```hocon 
objectstore {
  provider = filesystem
  s3 { # No defaults - will override Default Provider Chain if supplied
    access-key = "[no default]"
    endpoint-url = "[no default]"
    region = "[no default]"
    secret-key = "[no default]"
  }
  filesystem {
    mount-path = "[no default]"
  }
}
```
| Property                | Description                                                       | Allowed Input                       | Default      |
|:------------------------|:------------------------------------------------------------------|:------------------------------------|:-------------|
| `provider`              | The implementation of your object store                           | `in-memory`, `s3`, `filesystem`     | `filesystem` |
| `s3.access-key `        | The access key of your S3 (or S3-compatible) object store         | Any string                          | None         |
| `s3.endpoint-url`       | The endpoint URL of your S3 (or S3-compatible) object store       | Any string                          | None         |
| `s3.region`             | The region of your object store                                   | Any string                          | None         |
| `s3.secret-key`         | The secret key of your object store                               | Any string                          | None         |
| `filesystem.mount-path` | The path that your filesystem is mounted to within your container | Valid linux path (ex: `/mnt/store`) | None         |

## Source
```hocon 
source {
  url {
    allowed-domains = []
    max-bytes = 1048576 # 100MB
  }
  multipart {
    max-bytes = 1048576 # 100MB
  }
}
```
| Property                     | Description                                                                                                 | Allowed Input                        | Default   |
|:-----------------------------|:------------------------------------------------------------------------------------------------------------|:-------------------------------------|:----------|
| `source.url.allowed-domains` | Domains that Konifer is permitted to access when storing assets from a URL source                           | Any valid domain                     | `[]`      |
| `source.url.max-bytes`       | Maximum size of supplied asset content downloaded from URL. Will reject assets larger than this.            | Positive integer representing bytes  | 1048576   |
| `s3.endpoint-url`            | Maximum size of supplied asset content uploaded from Multipart source. Will reject assets larger than this. | Positive integer representing bytes  | 1048576   |

## Variant Profiles
```hocon
variant-profiles = [
  # Empty by default
  {
    name = ""
  }
]
```
| Property                | Description                                                                           | Allowed Input           | Default |
|:------------------------|:--------------------------------------------------------------------------------------|:------------------------|:--------|
| `variant-profiles`      | Array of defined variant profiles that canfor eager variants and on-demand variants.  | Variant profile object  | `[]`    |
| `variant-profiles.name` | Name of the variant profile                                                           | Any url-safe string     | None    |

All [image transformation parameters](image-transformation-reference.md#parameter-reference) can be used within a variant profile object.

## Variant Generation
```hocon
variant-generation {
  queue-size = 1000
  synchronous-priority = 80
  workers = [2 X CPU cores]
}
```
| Property                                  | Description                                                                                                                         | Allowed Input    | Default       |
|:------------------------------------------|:------------------------------------------------------------------------------------------------------------------------------------|:-----------------|:--------------|
| `variant-generation.queue-size`           | Amount of variant generation requests that can be queued up awaiting processing. Requests over this limit will suspend the request. | Positive integer | 1000          |
| `variant-generation.synchronous-priority` | Percentage priority to give to synchronous variant generation tasks. The remaining priority is reversed for async tasks.            | 1-99             | 80            |
| `variant-generation.workers`              | Amount of concurrent image processor workers                                                                                        | Positive integer | 2 x CPU cores |

## URL Signing
```hocon
url-signing {
  enabled = false
  algorithm = hmac_sha256
  secret-key = "[no default]"
}
```
| Property                 | Description                                    | Allowed Input                               | Default       |
|:-------------------------|:-----------------------------------------------|:--------------------------------------------|:--------------|
| `url-signing.enabled`    | Enable url-signing for GET requests or not     | Boolean                                     | false         |
| `url-signing.algorithm`  | HMAC signing algorithm that signatures use     | `hmac_sha256`, `hmac_sha384`, `hmac_sha512` | `hmac_sha256` |
| `url-signing.secret-key` | HMAC secret key used for validating signatures | String                                      | None          |

## Path Configuration Reference
By default, nothing is configured within `paths`. If nothing was configured, this is how your paths would be configured
by default
```hocon
paths = [
  {
    path = "/**" # Match everything greedily after /
    image {
      lqip = []
    }
    preprocessing {
      image {
        # Preprocessing disabled by default
      }
    }
    eager-variants = []
    object-store {
      bucket = assets
      redirect {
        strategy = none
        template {
          string = localhost
        }
        presigned {
          enabled = false
          ttl = 30m
        }
      }
    }
    cache-control {
      enabled = false
      max-age = "[no default]"
      s-maxage = "[no default]"
      visibility = "[no default]"
      revalidate = "[no default]"
      stale-while-revalidate = "[no default]"
      stale-if-error = "[no default]"
      immutable = false
    }
  }
]
```

### Image
```hocon
{
  path = "/**"
  image {
    lqip = []
  }
}
```
| Property     | Description             | Allowed Input            | Default |
|:-------------|:------------------------|:-------------------------|:--------|
| `image.lqip` | LQIP algorithms enabled | `blurhash`,  `thumbhash` | `[]`    |

### Preprocessing
```hocon
{
  path = "/**"
  preprocessing {
    image {
      # Preprocessing disabled by default
    }
  }
}
```
All [image transformation parameters](image-transformation-reference.md#parameter-reference) can be used within the `image` block.

### Eager Variants
```hocon
{
  path = "/**"
  eager-variants = []
}
```
| Property          | Description                                              | Allowed Input                                | Default |
|:------------------|:---------------------------------------------------------|:---------------------------------------------|:--------|
| `eager-variants`  | List of variant profiles to generate eager variants from | profiles names from `variant-profiles` array | None    |

### Object Store
```hocon
{
  path = "/**"
  object-store {
    bucket = assets
    redirect {
      strategy = none
      template {
        string = localhost
      }
      presigned {
        ttl = 30m
      }
    }
  }
}
```
| Property                                | Description                                                                                                                                                            | Allowed Input                                      | Default            |
|:----------------------------------------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|:---------------------------------------------------|:-------------------|
| `object-store.bucket`                   | Bucket to persist assets and variants in. This can be safely changed without de-referencing existing assets, however, existing assets will not be moved to new bucket. | Valid bucket name                                  | `assets`           |
| `object-store.redirect.strategy`        | How to serve redirect URLs                                                                                                                                             | `none`, `presigned`, `template`                    | `none`             |
| `object-store.redirect.template.string` | Template string to use if `strategy` is `template`                                                                                                                     | Valid URL string                                   | `localhost`        |
| `object-store.redirect.presigned.ttl`   | Time-to-live for presigned redirect URLs if `strategy` is presigned                                                                                                    | Duration-style format. Not less than 7 days (`7d`) | `30m` (30 minutes) |

### Cache Control
```hocon
{
  path = "/**"
  cache-control {
    enabled = false
    max-age = "[no default]"
    s-maxage = "[no default]"
    visibility = "[no default]"
    revalidate = "[no default]"
    stale-while-revalidate = "[no default]"
    stale-if-error = "[no default]"
    immutable = false
  }
}
```
| Property                  | Description                                           | Allowed Input                                     | Default |
|:--------------------------|:------------------------------------------------------|:--------------------------------------------------|:--------|
| `enabled`                 | Whether the `Cache-Control` header should be returned | Boolean                                           | `false` |
| `max-age`                 | Set the `max-age` descriptor                          | Integer `> 0`                                     |         |
| `s-maxage`                | Set the `max-age` descriptor                          | Integer `> 0`                                     |         |
| `visibility`              | Set the visbility of the cached asset                 | `public`, `private`                               |         |
| `revalidate`              | Cache control revalidation                            | `must-revalidate`, `proxy-revalidate`, `no-cache` |         |
| `stale-while-revalidate ` | Set the `stale-while-revalidate` descriptor           | Integer `> 0`                                     |         |
| `stale-if-error `         | Set the `stale-if-error` descriptor                   | Integer `> 0`                                     |         |
| `immutable`               | Whether to set the `immutable` descriptor             | Boolean                                           | `false` |
