---
sidebar_position: 1
id: configuration-reference
title: Configuration Reference
sidebar_label: "Configurations"
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
    access-key = [No default]
    endpoint-url = [No default]
    region = [No default]
    secret-key = [No default]
  }
  filesystem {
    mount-path = [No default]
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
## Variant Generation
```hocon
variant-generation {
  queue-size = 1000
  synchronous-priority = 80
  workers = [2 X CPU cores]
}
```

## URL Signing
```hocon
url-signing {
  enabled = false
  algorithm = hmac_sha256
  secret-key = [No default]
}
```

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
    variant-profiles = []
    object-store {
      bucket = assets
      redirect {
        strategy = none
      }
    }
    cache-control {
      enabled = false
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

### Variant Profiles
```hocon
{
  path = "/**"
  variant-profiles = []
}
```

### Object Store
```hocon
{
  path = "/**"
  object-store {
    bucket = assets
    redirect {
      strategy = none
    }
  }
}
```