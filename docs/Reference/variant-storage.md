---
sidebar_position: 4
id: reference-variant-storage
title: Storing Assets and Variants
sidebar_label: "Storing Assets"
---
# Storage Architecture

Direkt leverages a dual-store architecture to manage assets efficiently.

1. **Object Store:** Persists the physical variant content (the binaries). Direkt supports AWS S3 and any S3-compatible provider.
2. **Metadata Store:** Persists relational data, path hierarchies, tags, and labels. Currently, PostgreSQL is the supported engine.

## Object Store Configuration

Direkt supports three object store implementations:
1. in-memory
2. S3 (including S3-compatible providers)
3. Filesystem

### In-memory (Default)
For local development, unit testing, or trying out Direkt without infrastructure dependencies, you can enable in-memory storage implementations.

> ⚠️ Warning: Non-Production Use In-memory implementations are **ephemeral**. All data is lost when the container restarts.
> Additionally, storage capacity is strictly limited by the JVM Heap size. Uploading large files in this mode may cause
> `OutOfMemoryError` crashes.

To enable development mode, set the following flags in your configuration:

```hocon
object-store {
  in-memory = true
}
database {
  in-memory = true
}
```

### AWS S3

By default, Direkt looks for AWS credentials using the standard [AWS Default Credential Provider Chain](https://docs.aws.amazon.com/sdkref/latest/guide/standardized-credentials.html#credentialProviderChain). 
This enables seamless authentication when running on EC2 instances with IAM roles or locally with `~/.aws/credentials`.

⛔ **Requirement**:
Even when using implicit credentials, you **must** specify the `region`. This is required to correctly generate public 
URLs for your assets.

```hocon
object-store {
  s3 {
    # Required for URL generation
    region = "us-east-2"
  }
}
```

#### S3-compatible Providers

For non-AWS object stores (e.g., Cloudflare R2, MinIO, DigitalOcean Spaces, Oracle Cloud), you must explicitly provide 
the endpoint and credentials.

```hocon
object-store {
  s3 {
    # The full URL to your provider's API
    endpoint-url = "https://<account-id>.r2.cloudflarestorage.com"

    # Static credentials
    access-key = "your-access-key"
    secret-key = "your-secret-key"

    # Some providers require a specific region (often 'auto' or 'us-east-1')
    region = "auto"
  }
}
```

### Filesystem

Direkt can store files to a specified filesystem location. This filesystem path must be configured and has no default property.
```hocon
object-store {
  filesystem {
    mount-path = "/path/to/filesystem/mount"
  }
}
```
`mount-path` must exist and must be the path referencing the mounted Docker volume. For example, given this Docker volume mount:
```bash
docker run -d \
  --name direkt \
  -p 8080:8080 \
  -v /path/to/your/direkt.conf:/direkt.conf \
  -v /object-store:/mnt/nas1/assets
  your-registry/direkt:latest
```
The `mount-path` should be `/object-store` and not `/mnt/nas1/assets`.

#### Buckets and Keys
When using the Filesystem implementation, the `bucket` will still be used as the top-level directory for the assets. If it
does not exist when storing an asset, the directory will be created. Similar to the S3 implementation, the `key` will represent 
the filename.

#### URL resolution
Direkt is designed to serve content over HTTP(S). Therefore, a `http-path` must be specified as well. This will be used
to prefix the `bucket/key` path. An `http-path` must be specified and has no default. HTTP and HTTPS protcols may be used. 
A port may optionally be supplied in the URL.
```hocon
object-store {
  filesystem {
    http-path = "https://your-public-site.com"
    mount-path = "/path/to/filesystem/mount"
  }
}
```
When fetching an asset with `link` or `redirect` return formats, the asset link will be returned as:
```http
https://your-public-site.com/bucket/key
```

### Path-style URL Configuration
TODO

> 💡 **Note**: If endpoint-url is omitted, Direkt defaults to the standard AWS S3 endpoints.

## Metadata Store (PostgreSQL)
Direkt uses PostgreSQL for robust transactional support and hierarchical path queries.

> ⛔ **Requirement**: ltree Extension The ltree extension must be enabled on your PostgreSQL database before 
> Direkt starts. Run the following SQL command as a superuser:
> ```sql
> CREATE EXTENSION IF NOT EXISTS ltree;
> ```

Define your database connection details in the postgres block of direkt.conf.

```hocon
postgres {
  host = "localhost"
  port = 5432
  user = "username"
  password = "password"
}
```
