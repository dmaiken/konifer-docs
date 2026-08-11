---
sidebar_position: 1
id: guides-konifer-cloudflare-r2
title: Integrating Cloudflare R2 with Konifer
sidebar_label: "Integrating Cloudflare R2 with Konifer"
---

## Objective

> Integrate Konifer with Cloudflare R2 using presigned URLs

## What you will need

1. A Cloudflare account with R2 activated. R2 has a generous free-tier.
2. Access to the Cloudflare console or `wrangler` [installed](https://developers.cloudflare.com/workers/wrangler/install-and-update/).
3. Docker (to run Konifer)

## Create a bucket in R2

Using the web console or wrangler, create a bucket in R2:

```bash
npx wrangler r2 bucket create profile-pictures
```

```
 ⛅️ wrangler 4.120.1
────────────────────
Creating bucket 'profile-pictures'...
✅ Created bucket 'profile-pictures' with default storage class of Standard.
To access your new R2 Bucket in your Worker, add the following snippet to your configuration file:
{
  "r2_buckets": [
    {
      "bucket_name": "profile-pictures",
      "binding": "profile_pictures"
    }
  ]
}
```

To view your bucket:

```bash
npx wrangler r2 bucket list
```

```
 ⛅️ wrangler 4.120.1
────────────────────
Listing buckets...
name:           profile-pictures
creation_date:  2026-08-10T23:59:42.305Z
```

## Generate Cloudflare API credentials

Konifer integrates with Cloudflare R2 using the S3-compatible API. To enable that, you must generate API
credentials that can be supplied to Konifer.

This must be done in the [Cloudflare dashboard](https://dash.cloudflare.com/).

1. Go to the Cloudflare dashboard and login if not already logged in
2. Select Storage & databases > R2 > Overview.
3. Select Manage in API Tokens.
4. Select Create Account API token or Create User API token
5. Choose Object Read & Write permission and Apply to specific buckets only to select the buckets you want to access.
6. Select Create API Token.
7. Copy the Access Key ID and Secret Access Key. Store these securely as you cannot view the secret again.

You will also need your S3 API URL which is at the bottom of the page that contains your API credentials. It will
look something like this:

```
https://123456789abcdef.r2.cloudflarestorage.com
```

## Configure Konifer

Create a file named `konifer.conf` and configure:

- Your `object-store` ([Object Store reference](../reference/configuration-reference#object-store))
- Your path configuration to always use the `profile-pictures` bucket

```hocon
data-store {
  provider = in-memory
}

object-store {
  provider = s3
  s3 {
    access-key = "[API_ACCESS_KEY]"
    endpoint-url = "[S3 API URL]" # https://123456789abcdef.r2.cloudflarestorage.com
  }
}

paths {
  "/**" {
    object-store {
      bucket = "profile-pictures"
    }
  }
}
```

Your Secret Key will be supplied through the `S3_SECRET_KEY` environment variable.


