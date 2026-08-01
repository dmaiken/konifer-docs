---
sidebar_position: 4
id: configure-konifer
title: Configure Konifer
sidebar_label: "Configure Konifer"
description: Learn where Konifer configuration lives, how settings are resolved, and how to create a production-ready konifer.conf.
---

# Configure Konifer

The quickstart uses `IN_MEMORY=true` so you can try Konifer without configuring infrastructure. Before using persistent
storage, path policies, variant profiles, or delivery settings, create a `konifer.conf` file.

`konifer.conf` is a [HOCON](https://github.com/lightbend/config/blob/main/HOCON.md) file that describes how Konifer
connects to its dependencies and how it should behave. Keep it outside the container and mount it when the container
starts.

## Where configuration belongs

Keep the configuration with the deployment definition for each environment. A simple local layout might be:

```text
konifer/
├── konifer.conf       # Non-secret configuration
├── konifer.env        # Secrets; do not commit this file
└── compose.yaml       # Or another deployment definition
```

Mount `konifer.conf` at `/app/config/konifer.conf`. The container reads that path automatically:

```bash
docker run --detach \
  --name konifer \
  --publish 8080:8080 \
  --env-file ./konifer.env \
  --mount type=bind,source="$(pwd)/konifer.conf",target=/app/config/konifer.conf,readonly \
  ghcr.io/dmaiken/konifer:latest
```

Use an absolute path instead of `$(pwd)` when your deployment system does not run from the configuration directory.

## Start with a small configuration

This example describes the essential persistent deployment settings: PostgreSQL for asset information, S3-compatible
storage for image content, a public URL for generated links, and a default bucket for every asset path.

```hocon title="konifer.conf"
data-store {
  provider = postgresql

  postgresql {
    host = "postgres.internal"
    port = 5432
    database = "konifer"
    ssl-mode = "require"
  }
}

object-store {
  provider = s3

  # Konifer respects the AWS Credential Provider chain, so this may be omitted when that is available
  s3 {
    endpoint-url = "https://s3.example.com"
    region = "us-east-1"
  }
}

http {
  public-url = "https://images.example.com"
}

paths {
  "/**" {
    object-store {
      bucket = "konifer-assets"
    }
  }
}
```

Replace the hostnames, public URL, and bucket with values for your environment. Create every configured bucket before
starting Konifer.

The `paths` block is where image behavior becomes application-specific. Start with a default rule, then add more
specific paths as your needs grow:

```hocon
variant-profiles {
  thumbnail {
    w = 256
    h = 256
    fit = fill
    g = attention
  }
}

paths {
  "/**" {
    object-store {
      bucket = "konifer-assets"
    }
  }

  "/public/avatars/**" {
    transform {
      eager-variants = [thumbnail]
    }
  }
}
```

More-specific path rules inherit from broader rules. See [Path configuration](../concepts/path-configuration.md) for
the full model.

## Keep secrets out of `konifer.conf`

Use `konifer.conf` for non-secret settings: provider choices, hostnames, bucket names, path rules, transformation
profiles, and public URLs. Supply secrets through your platform's secret mechanism or supported environment variables:

```dotenv title="konifer.env"
PG_USER=konifer
PG_PASSWORD=replace-with-a-database-password
S3_SECRET_KEY=replace-with-an-object-store-secret
URL_SIGNING_SECRET_KEY=replace-with-a-signing-secret
```

Only set `URL_SIGNING_SECRET_KEY` when URL signing is enabled. Do not commit `konifer.env`; in a container orchestrator,
use its secret-management facility instead.

For settings that support an environment variable, precedence is:

1. Environment variable
2. `konifer.conf`
3. Built-in default

## Continue from here

Use the [Configuration reference](../reference/configuration-reference.md) to find every property and its default.

When you are ready to run PostgreSQL and object storage, continue to [Deploying Konifer](../operate/deployment.md).
