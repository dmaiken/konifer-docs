---
sidebar_position: 4
id: reference-variant-storage
title: Storing Assets and Variants
sidebar_label: "Storing Assets"
---
# Storage Architecture

Direkt leverages a dual-store architecture to manage assets efficiently. This separation of concerns allows the system 
to scale storage (for large binaries) independently of textual metadata.

1.  **Object Store:** Persists the physical variant content (the binaries). Direkt supports AWS S3 and any S3-compatible provider.
2.  **Metadata Store:** Persists relational data, path hierarchies, tags, and labels. Currently, PostgreSQL is the supported engine.

## Object Store Configuration

Direkt uses a unified S3 client wrapper. You can configure it to run in a native AWS environment (EC2/EKS) or with 
custom credentials for 3rd party providers.

### AWS S3 (Default)

By default, Direkt looks for AWS credentials using the standard [AWS Default Credential Provider Chain](https://docs.aws.amazon.com/sdkref/latest/guide/standardized-credentials.html#credentialProviderChain). 
This enables seamless authentication when running on EC2 instances with IAM roles or locally with `~/.aws/credentials`.

**Required Configuration:**
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

### S3-compatible Providers

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

### Path-style URL Configuration
TODO

> 💡 **Note**: If endpoint-url is omitted, Direkt defaults to the standard AWS S3 endpoints.

## Metadata Store (PostgreSQL)
Direkt uses PostgreSQL for robust transactional support and hierarchical path queries.

> ⛔ Critical Requirement: ltree Extension The ltree extension must be enabled on your PostgreSQL database before 
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

## Development Mode (In-Memory)

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
