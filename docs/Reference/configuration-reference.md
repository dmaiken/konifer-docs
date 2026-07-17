---
sidebar_position: 1
id: configuration-reference
title: Configuration Reference
sidebar_label: "Configuration Properties"
---

Values used in snippets are the default properties.

## Environment Variables

Properties that have an environment variable specified will override the respective property in `konifer.conf`.

The order of configuration precedence is:

1. Environment variable (for available properties)
2. Property in `konifer.conf`
3. Default value (if specified)

## Datastore

Properties for configuring the datastore.

```hocon 
data-store {
  provider = postgresql
  postgresql {
    database = konifer
    host = localhost
    port = 5432
    user = postgres
    password = ""
  }
}
```

| Property                         | Description                           | Allowed Input             | Default      | Environment variable |
|:---------------------------------|:--------------------------------------|:--------------------------|:-------------|:---------------------|
| `data-store.provider`            | The implementation of your data store | `in-memory`, `postgresql` | `postgresql` | IN_MEMORY*           |
| `data-store.postgresql.database` | Database to use within the RDBMS      | String                    | `konifer`    |                      |
| `data-store.postgresql.host`     | Postgresql host                       | String                    | `localhost`  |                      |
| `data-store.postgresql.port`     | Postgresql port                       | Integer                   | 5432         |                      |
| `data-store.postgresql.user`     | Postgresql user                       | String                    | `postgres`   | PG_USER              |
| `data-store.postgresql.password` | Postgresql password                   | String                    | `""`         | PG_PASSWORD          |          
| `data-store.postgresql.ssl-mode` | Postgresql SSL Mode                   | String                    | `prefer`     |                      |

If `IN_MEMORY=true` is set as an environment variable, both the data store and object store providers will be set to
`in-memory`.

## HTTP

```hocon
http {
  public-url = "http://localhost"
}
```

| Property          | Description                                                                                               | Allowed Input                              | Default            |
|:------------------|:----------------------------------------------------------------------------------------------------------|:-------------------------------------------|:-------------------|
| `http.public-url` | The URL used to resolve content selector links. This is the root public URL of your website/platform/API. | Any URL beginning with http:// or https:// | `http://localhost` |

## Object Store

Properties for configuring the datastore.

```hocon 
objectstore {
  provider = filesystem
  s3 { # No defaults - overrides Default Provider Chain if supplied
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

| Property                            | Description                                                       | Allowed Input                       | Default      | Environment variable |
|:------------------------------------|:------------------------------------------------------------------|:------------------------------------|:-------------|:---------------------|
| `objectstore.provider`              | The implementation of your object store                           | `in-memory`, `s3`, `filesystem`     | `filesystem` | IN_MEMORY*           |
| `objectstore.s3.access-key `        | The access key of your S3 (or S3-compatible) object store         | String                              | None         |                      |
| `objectstore.s3.endpoint-url`       | The endpoint URL of your S3 (or S3-compatible) object store       | String                              | None         |                      |
| `objectstore.s3.region`             | The region of your object store                                   | String                              | None         |                      |
| `objectstore.s3.secret-key`         | The secret key of your object store                               | String                              | None         | S3_SECRET_KEY        |
| `objectstore.s3.force-path-style`   | Communicate with S3 API using path-style or virtual-host style    | Boolean                             | `false`      |                      |
| `objectstore.filesystem.mount-path` | The path that your filesystem is mounted to within your container | Valid linux path (ex: `/mnt/store`) | None         |                      |

If `IN_MEMORY=true` is set as an environment variable, both the data store and object store providers will be set to
`in-memory`.

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

| Property                     | Description                                                                                                 | Allowed Input                       | Default |
|:-----------------------------|:------------------------------------------------------------------------------------------------------------|:------------------------------------|:--------|
| `source.url.allowed-domains` | Domains that Konifer is permitted to access when storing assets from a URL source                           | Any valid domain                    | `[]`    |
| `source.url.max-bytes`       | Maximum size of supplied asset content downloaded from URL. Will reject assets larger than this.            | Positive integer representing bytes | 1048576 |
| `source.multipart.max-bytes` | Maximum size of supplied asset content uploaded from Multipart source. Will reject assets larger than this. | Positive integer representing bytes | 1048576 |

## Variant Profiles

```hocon
variant-profiles {
  # Empty by default
  "profile-name" {
  }
}
```

| Property           | Description                                                                                                  | Allowed Input          | Default |
|:-------------------|:-------------------------------------------------------------------------------------------------------------|:-----------------------|:--------|
| `variant-profiles` | Map of defined variant profiles that canfor eager variants and on-demand variants. Keyed by the profile name | Variant profile object | `{}`    |

All [image transformation parameters](image-transformation-reference.md#parameter-reference) can be used within a
variant profile object.

## Rule Definitions

Rule definitions are global zero-shot image classification rules that can be referenced by path-level upload rulesets.
They are empty by default.

```hocon
rule-definitions {
  "rule-name" {
    prompts = [
      "a visual description of the content to detect"
    ]
    threshold = 0.70
  }
}
```

| Property                            | Description                                                                                      | Allowed Input             | Default |
|:------------------------------------|:-------------------------------------------------------------------------------------------------|:--------------------------|:--------|
| `rule-definitions`                  | Map of named rule definitions. The rule name is referenced from path-level upload rulesets.      | Rule definition object    | `{}`    |
| `rule-definitions.<name>.prompts`   | Text prompts used for zero-shot matching. The highest scoring prompt determines the rule result. | 1-100 strings             | None    |
| `rule-definitions.<name>.threshold` | Minimum model score required for the rule to match.                                              | Decimal from `0.0`-`1.0`  | None    |

Rule names cannot be blank and cannot be longer than 32 characters. Use lowercase rule definition keys because upload
rule references are normalized to lowercase.

SigLIP2 model files are only required when `rule-definitions` is populated. See
[Upload Rules](../Concepts/upload-rules.md#installing-model-files) for model installation and mount instructions.

## Variant Generation

```hocon
variant-generation {
  queue-size = 1000
  synchronous-priority = 80
  workers = [2 X CPU cores]
}
```

| Property                                  | Description                                                                                                                    | Allowed Input    | Default       |
|:------------------------------------------|:-------------------------------------------------------------------------------------------------------------------------------|:-----------------|:--------------|
| `variant-generation.queue-size`           | Amount of variant generation requests that can be queued up awaiting processing. Requests over this limit suspend the request. | Positive integer | 1000          |
| `variant-generation.synchronous-priority` | Percentage priority to give to synchronous variant generation tasks. The remaining priority is reversed for async tasks.       | 1-99             | 80            |
| `variant-generation.workers`              | Amount of concurrent image processor workers                                                                                   | Positive integer | 2 x CPU cores |

## URL Signing

```hocon
url-signing {
  enabled = false
  algorithm = hmac_sha256
  secret-key = "[no default]"
}
```

| Property                 | Description                                    | Allowed Input                               | Default       | Environment variable   |
|:-------------------------|:-----------------------------------------------|:--------------------------------------------|:--------------|:-----------------------|
| `url-signing.enabled`    | Enable url-signing for GET requests or not     | Boolean                                     | `false`       |                        |
| `url-signing.algorithm`  | HMAC signing algorithm that signatures use     | `hmac_sha256`, `hmac_sha384`, `hmac_sha512` | `hmac_sha256` |                        |
| `url-signing.secret-key` | HMAC secret key used for validating signatures | String                                      | None          | URL_SIGNING_SECRET_KEY |

## Path Configuration Reference

By default, nothing is configured within `paths`. If nothing is configured, the default configuration below is used.

```hocon
paths {
  # Match everything greedily after /
  "/**" {
    image {
      lqip = []
    }
    transform {
      preprocessing {
        enabled = false
        image {
          # Preprocessing disabled by default
          # Populate with URL manipulation parameters i.e. w = 100, h = 200, r = 90, etc.
        }
      }
      eager-variants = []
      on-demand-variant {
        mode = enabled
      }
      expire {
        strategy = never
        ttl = [no default]
      }
    }
    object-store {
      bucket = assets
    }
    upload-ruleset {
      default = accept
      accept-rules = []
      reject-rules = []
      label-rules = []
    }
    return-format {
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
}
```

### Image

```hocon
"/**" {
  image {
    lqip = []
  }
}
```

| Property     | Description             | Allowed Input            | Default |
|:-------------|:------------------------|:-------------------------|:--------|
| `image.lqip` | LQIP algorithms enabled | `blurhash`,  `thumbhash` | `[]`    |

### Allowed Content Types

```hocon
"/**" {
  allowed-content-types = [ "image/png", "image/jpeg" ]
}
```

| Property                | Description                                                                                 | Allowed Input                  | Default |
|:------------------------|:--------------------------------------------------------------------------------------------|:-------------------------------|:--------|
| `allowed-content-types` | Content types allowed for uploads to the path. Omit to allow all supported image formats.   | Supported image MIME type list | None    |

### Transform

#### Preprocessing

```hocon
"/**" {
  transform {
    preprocessing {
      enabled = false
      image {
        # Preprocessing disabled by default
      }
    }
  }
}
```

| Property                           | Description          | Allowed Input | Default |
|:-----------------------------------|:---------------------|:--------------|:--------|
| `transform.preprocessing.enabled ` | Enable preprocessing | Boolean       | `false` |

All [image transformation parameters](image-transformation-reference.md#parameter-reference) can be used within the
`image` block as well as:

| Property                                    | Description    | Allowed Input | Default |
|:--------------------------------------------|:---------------|:--------------|:--------|
| `transform.preprocessing.image.max-height ` | Maximum height | Integer       | None    |
| `transform.preprocessing.image.max-width `  | Maximum width  | Integer       | None    |

:::note
`h` and `w` take precedence over `max-height` and `max-width` respectively, if both are specified.
:::

#### Eager Variants

```hocon
"/**" {
  transform {
    eager-variants = []
  }
}
```

| Property                   | Description                                              | Allowed Input                                | Default |
|:---------------------------|:---------------------------------------------------------|:---------------------------------------------|:--------|
| `transform.eager-variants` | List of variant profiles to generate eager variants from | profiles names from `variant-profiles` array | None    |

#### On-demand Variant

```hocon
"/**" {
  transform {
    on-demand-variant {
      mode = enabled
    }
  }
}
```

| Property                           | Description                       | Allowed Input                         | Default   |
|:-----------------------------------|:----------------------------------|:--------------------------------------|:----------|
| `transform.on-demand-variant.mode` | On-demand variant generation mode | `enabled`, `profile_only`, `disabled` | `enabled` |

#### Expiration
```hocon
"/**" {
  transform {
    expire {
      strategy = never
      ttl = [no default]
    }
  }
}
```

| Property                    | Description                                                                                                   | Allowed Input                    | Default    |
|:----------------------------|:--------------------------------------------------------------------------------------------------------------|:---------------------------------|:-----------|
| `transform.expire.strategy` | The variant expiry strategy to use                                                                            | `never`, `ttl`, `idle`           | `never`    |
| `transform.expire.ttl`      | The time-to-live (in `Duration` format) used in `idle` or `ttl` strategies. Ignored when strategy is `never`. | Duration e.g. `24h`, `7d`, `10m` | No default |

##### Duration
A duration is represented similarly to how Spring accepts a `Duration` property value. The time unit is appended to the amount. 
Units can be:
- s for seconds
- m for minutes
- h for hours
- d for days

:::note
Due to how expired variants are purged, expiration may be delayed by up to 1 minute after the configured TTL.
:::


### Object Store

```hocon
"/**" {
  object-store {
    bucket = assets
  }
}
```

| Property              | Description                                                                                                                                                        | Allowed Input     | Default  |
|:----------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------|:------------------|:---------|
| `object-store.bucket` | Bucket to persist assets and variants in. This can be safely changed without de-referencing existing assets, however, existing assets are not moved to new bucket. | Valid bucket name | `assets` |

### Upload Ruleset

```hocon
"/**" {
  upload-ruleset {
    default = accept
    accept-rules = []
    reject-rules = []
    label-rules = []
  }
}
```

| Property                                      | Description                                                                                                           | Allowed Input                 | Default  |
|:----------------------------------------------|:----------------------------------------------------------------------------------------------------------------------|:------------------------------|:---------|
| `upload-ruleset.default`                      | Decision to use when no configured accept or reject rule matches.                                                     | `accept`, `reject`            | `accept` |
| `upload-ruleset.accept-rules`                 | Rules that accept an upload when matched. Usually used with `default = reject`.                                       | List of upload rule objects   | `[]`     |
| `upload-ruleset.reject-rules`                 | Rules that reject an upload when matched. Usually used with `default = accept`.                                       | List of upload rule objects   | `[]`     |
| `upload-ruleset.label-rules`                  | Rules that add labels when matched. Labeling does not change the upload decision.                                     | List of upload rule objects   | `[]`     |
| `upload-ruleset.*-rules[].rule`               | Name of a top-level rule definition to evaluate.                                                                      | Configured rule name          | None     |
| `upload-ruleset.*-rules[].violation-response` | Optional response message returned when a reject rule rejects an upload.                                              | String shorter than 200 chars | None     |
| `upload-ruleset.label-rules[].labels`         | Labels added to the stored asset when the rule matches. Rule labels override request labels that use the same key.    | Map of label keys and values  | `{}`     |

The same rule cannot appear in both `accept-rules` and `reject-rules` within a single upload ruleset.

Each label key must be nonblank and no longer than 128 characters. Each value must be nonblank and no longer than 256
characters. An asset can have at most 50 labels after labels from the upload request and matched label rules are merged.

Upload rulesets are path configuration, so a child path can override an inherited ruleset. See
[Upload Rules](../Concepts/upload-rules.md) for examples and prompt ensemble guidance.

### Return Format

```hocon
"/**" {
  return-format {
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

| Property                                 | Description                                                         | Allowed Input                                      | Default            |
|:-----------------------------------------|:--------------------------------------------------------------------|:---------------------------------------------------|:-------------------|
| `return-format.redirect.strategy`        | How to serve redirect URLs                                          | `none`, `presigned`, `template`                    | `none`             |
| `return-format.redirect.template.string` | Template string to use if `strategy` is `template`                  | Valid URL string                                   | `localhost`        |
| `return-format.redirect.presigned.ttl`   | Time-to-live for presigned redirect URLs if `strategy` is presigned | Duration-style format. Not less than 7 days (`7d`) | `30m` (30 minutes) |

### Cache Control

```hocon
"/**" {
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
