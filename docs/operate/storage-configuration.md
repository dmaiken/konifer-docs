---
sidebar_position: 3
id: reference-variant-storage
slug: /reference/reference-variant-storage
title: Storage Configuration
sidebar_label: "Storage Configuration"
---

Konifer stores originals and generated variants in an object store, and asset information in a metadata store.

## Object Store Configuration

### In-memory Configuration

Set `IN_MEMORY=true` to override both storage providers, or set each provider in `konifer.conf`:

```hocon
object-store {
    provider = in-memory
}

data-store {
    provider = in-memory
}
```

In-memory storage uses JVM heap and loses all data when the container restarts. Large uploads can exhaust the heap.

### AWS S3

Konifer uses the
[AWS Default Credential Provider Chain](https://docs.aws.amazon.com/sdkref/latest/guide/standardized-credentials.html#credentialProviderChain)
unless you configure static credentials.

```hocon
object-store {
    provider = s3
}
```

#### S3-compatible Providers

For S3-compatible providers, configure the endpoint, credentials, and region:

```hocon
object-store {
    provider = s3

    s3 {
        endpoint-url = "https://<account-id>.r2.cloudflarestorage.com"
        access-key = "your-access-key"
        # Or use S3_SECRET_KEY
        secret-key = "your-secret-key"
        region = "us-east-1"
        force-path-style = false
    }
}
```

The SDK requires a region even if the provider does not use one; use `auto` for providers that support it. Some
providers, including MinIO, require `force-path-style = true`.

### Filesystem

The default object-store provider is `filesystem`. Set `mount-path` to an existing, writable directory inside the
container; this property has no default:

```hocon
object-store {
    provider = filesystem

    filesystem {
        mount-path = "/mnt/nas1/assets"
    }
}
```

For example:

```bash
docker run -d \
  --name konifer \
  -p 8080:8080 \
  --mount type=bind,source=/etc/konifer/konifer.conf,target=/app/config/konifer.conf,readonly \
  --mount type=bind,source=/object-store,target=/mnt/nas1/assets \
  ghcr.io/dmaiken/konifer:{{koniferVersion}}
```

Here, `/object-store` is the host directory and `/mnt/nas1/assets` is the configured `mount-path`.

#### Buckets and Keys

The filesystem provider uses `bucket` as a top-level directory and `key` as the generated filename. Konifer creates
missing bucket directories. The S3 provider requires buckets to exist before use.

### Presigned delivery

When using the filesystem or in-memory object store implementations, the `presigned` delivery strategy falls back to
the service URL because these providers cannot generate presigned URLs. The S3 provider returns a temporary URL using
the selected variant's stored bucket, key, and configured TTL.

## Metadata Store (PostgreSQL)

Konifer uses PostgreSQL for transactions and hierarchical path queries.

Enable `ltree` in the application database before Konifer starts, using a role with permission to create the extension:

```sql
CREATE EXTENSION IF NOT EXISTS ltree;
```

Configure the connection under `data-store.postgresql` in `konifer.conf`:

```hocon
data-store {
    provider = postgresql

    postgresql {
        host = "localhost"
        port = 5432
        # can also use PG_USER environment variable
        user = "username"
        # can also use PG_PASSWORD environment variable
        password = "password"
        database = "konifer"
        ssl-mode = "prefer"
    }
}
```

### SSL Mode

`data-store.postgresql.ssl-mode` defaults to `prefer`. See
[PostgreSQL SSL modes](https://www.postgresql.org/docs/current/libpq-ssl.html#LIBPQ-SSL-PROTECTION) for mode behavior.
