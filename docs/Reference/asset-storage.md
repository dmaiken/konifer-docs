---
sidebar_position: 4
id: reference-variant-storage
title: Storing Assets and Variants
sidebar_label: "Storing Assets"
---
# Storage Architecture

Konifer leverages a dual-store architecture to manage assets efficiently.

1. **Object Store:** Persists the physical variant content (the binaries). Konifer supports AWS S3, S3-compatible, filesystem and in-memory providers.
2. **Metadata Store:** Persists relational data, path hierarchies, tags, and labels. Currently, in-memory and PostgreSQL are the supported engines.

## Object Store Configuration

Konifer supports three object store implementations:
1. In-memory
2. S3 (including S3-compatible providers)
3. Filesystem

### In-memory Configuration
To enable development mode, set the following flags in your configuration:

```hocon
object-store {
  in-memory = true
}

database {
  in-memory = true
}
```

:::warning
Non-Production Use In-memory implementations are **ephemeral**. All data is lost when the container restarts.
Additionally, storage capacity is strictly limited by the JVM Heap size. Uploading large files in this mode may cause
`OutOfMemoryError` crashes.
:::

### AWS S3
By default, Konifer looks for AWS credentials using the standard [AWS Default Credential Provider Chain](https://docs.aws.amazon.com/sdkref/latest/guide/standardized-credentials.html#credentialProviderChain). 
This enables seamless authentication when running on EC2 instances with IAM roles or locally with `~/.aws/credentials`.

```hocon
object-store {
  provider = s3
}
```

#### S3-compatible Providers
For non-AWS object stores (e.g., Cloudflare R2, MinIO, DigitalOcean Spaces, Oracle Cloud), you must explicitly provide 
the endpoint and credentials.

```hocon
object-store {
  provider = s3
  
  s3 {
    # The full URL to your provider's API
    endpoint-url = "https://<account-id>.r2.cloudflarestorage.com"

    # Static credentials
    access-key = "your-access-key"
    
    # Can also use S3_SECRET_KEY environment variable
    secret-key = "your-secret-key" 

    # The S3 SDK requires a region to be populated either through the Provider Chain (AWS)
    # or manually. Use 'auto' if your provider does not require a region.
    region = "us-east-1"

    # Many non-AWS providers require this to be true (i.e. MiniIO)
    force-path-style = false
  }
}
```

### Filesystem
Konifer can store files to a specified filesystem location. This filesystem path must be configured and has no default property.
```hocon
object-store {
  provider = filesystem # This is the default value
  
  filesystem {
    mount-path = "/path/to/filesystem/mount"
  }
}
```
`mount-path` must exist and must be the path referencing the mounted Docker volume. For example, given this Docker volume mount:
```bash
docker run -d \
  --name Konifer \
  -p 8080:8080 \
  -v /path/to/your/konifer.conf:/konifer.conf \
  -v /object-store:/mnt/nas1/assets
  your-registry/Konifer:latest
```
The `mount-path` should be `/object-store` and not `/mnt/nas1/assets`.

#### Buckets and Keys
When using the Filesystem implementation, the `bucket` is the top-level directory. The bucket directory is created if it does not exist. 
Similar to the S3 implementation, the `key` represents the generated filename.

### Redirection
When using the filesystem or in-memory object store implementations, the `presigned` strategy is not supported.

## Metadata Store (PostgreSQL)
Konifer uses PostgreSQL for robust transactional support and hierarchical path queries.

:::warning 
ltree Extension The ltree extension must be enabled on your PostgreSQL database before 
Konifer starts. Run the following SQL command as a superuser:
```sql
CREATE EXTENSION IF NOT EXISTS ltree;
```
:::

Define your database connection details in the postgres block of konifer.conf.

```hocon
data-store {
  provider = postgresql
  
  postgresql {
    host = "localhost"
    port = 5432
    user = "username"
    password = "password"
    database = "konifer"
    ssl-mode = "prefer"
  }
}
```

### SSL Mode
Konifer allows you to specify the `sslMode` used when connecting to Postgres. The default is `prefer`. More
information about these modes can be found in the relevant [Postgres documentation](https://www.postgresql.org/docs/current/libpq-ssl.html#LIBPQ-SSL-PROTECTION).
