---
sidebar_position: 2
id: guides-konifer-cloudflare-r2
title: Integrating Cloudflare R2 with Konifer
sidebar_label: "Integrating Cloudflare R2 with Konifer"
---

## Objective

> Store Konifer assets in Cloudflare R2 and deliver them through temporary presigned URLs.

## What you will need

Complete the [common guide prerequisites](./guides-intro#what-you-will-need). You will also need:

1. A Cloudflare account with R2 enabled.
2. Access to the Cloudflare dashboard or
   [Wrangler installed](https://developers.cloudflare.com/workers/wrangler/install-and-update/).

Open the Bruno collection as described in the [Guides overview](./guides-intro#open-the-bruno-collection). The requests
for this guide are under **Guides > Cloudflare R2 Integration**.

## 1. Create a bucket in R2

Using the Cloudflare dashboard or Wrangler, create an R2 bucket named `profile-pictures`. To use Wrangler, run:

```bash
npx wrangler login
npx wrangler r2 bucket create profile-pictures
```

Verify that the new bucket appears in the bucket list:

```bash
npx wrangler r2 bucket list
```

## 2. Generate Cloudflare API credentials

Konifer integrates with Cloudflare R2 using the S3-compatible API. To enable that, you must generate API
credentials that can be supplied to Konifer.

This must be done in the [Cloudflare dashboard](https://dash.cloudflare.com/).

1. Go to the Cloudflare dashboard and log in if necessary.
2. Select Storage & databases > R2 > Overview.
3. Select Manage in API Tokens.
4. Select Create Account API token or Create User API token.
5. Choose Object Read & Write permission and Apply to specific buckets only to select the buckets you want to access.
6. Select Create API Token.
7. Copy the Access Key ID and Secret Access Key. Store these securely as you cannot view the secret again.

You will also need your S3 API URL which is at the bottom of the page that contains your API credentials. It will
look something like this:

```text
https://<ACCOUNT_ID>.r2.cloudflarestorage.com
```

## 3. Configure Konifer

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
    access-key = "<ACCESS_KEY_ID>"
    endpoint-url = "https://<ACCOUNT_ID>.r2.cloudflarestorage.com"
    region = "auto"
  }
}

paths {
  "/**" {
    object-store {
      bucket = "profile-pictures"
    }
    return-format {
      redirect {
        strategy = presigned

        presigned {
          ttl = 30m
        }
      }
    }
  }
}
```

Replace `<ACCESS_KEY_ID>` and `<ACCOUNT_ID>` with your Cloudflare values. The Secret Access Key will be supplied through
the `S3_SECRET_KEY` environment variable when you start Konifer.

:::caution
This guide uses an in-memory data store to avoid requiring a database. Asset metadata is lost when Konifer stops, and
deleting an asset while using this configuration does not currently remove its objects from R2. Do not use this
configuration in production, and empty the tutorial bucket manually when you finish.
:::

## 4. Start Konifer

Start Konifer with your `konifer.conf` file and `S3_SECRET_KEY` environment variable:

```bash
read -rsp "R2 secret access key: " S3_SECRET_KEY
export S3_SECRET_KEY
printf '\n'

docker run \
  --rm \
  --name konifer \
  --publish 8080:8080 \
  --env S3_SECRET_KEY \
  --mount type=bind,source="$PWD/konifer.conf",target=/app/config/konifer.conf,readonly \
  ghcr.io/dmaiken/konifer:{{koniferVersion}}
```

Leave the container running. In Bruno, send the **Health** request and confirm that it returns `200 OK`.

## 5. Store an asset

Open the **Store Asset** request, select an image from your computer for the `asset` field in the multipart form body,
and send the request. Confirm that Konifer returns `201 Created`.

The Bruno requests in this guide use the asset path `users/123abc/profile-pictures`. In the Cloudflare dashboard, 
confirm that an object now appears in the `profile-pictures` bucket.

## 6. Request a variant's content

Open the **Fetch Asset Content** request. Enable any transformations you want under **Params**, then send the request.
Confirm that Konifer returns `200 OK` and that Bruno displays the image.

:::warning
Bruno 4.0.0 may crash while previewing JXL responses.
:::

## 7. Request a presigned redirect

Open the **Fetch Presigned Redirect** request. Enable any transformations you want under **Params**, then send the
request.

Konifer returns `307 Temporary Redirect` because the path uses the `presigned` redirect strategy. This request disables
automatic redirect following so you can inspect the intermediate response. Confirm that the `Location` response header
contains an R2 URL with `X-Amz-Algorithm`, `X-Amz-Expires`, and `X-Amz-Signature` query parameters.

To follow the redirect and retrieve the image from R2, send the **Fetch and Follow Presigned Redirect** request. Confirm
that the final response is `200 OK` and contains the image.

:::note
Bruno may display "There was an error executing the request" in its Timeline
for a `307` response. This is a Bruno redirect-handling message and does not
mean the Konifer request failed.
:::

## 8. Clean up

Stop Konifer with `Ctrl+C`, then remove the secret from your shell environment:

```bash
unset S3_SECRET_KEY
```

Because of the in-memory data-store limitation described above, do not use the **Recursive Delete** request to clean up
this tutorial. Instead, use the Cloudflare dashboard to empty the `profile-pictures` bucket. You can then delete the
bucket and revoke its API token if you created them only for this guide.
