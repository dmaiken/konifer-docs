---
sidebar_position: 3
id: getting-started
title: Getting Started with Konifer
sidebar_label: "Quickstart"
---

## Objective

> Build a replaceable profile-image pipeline in 10 minutes

## 1. Start Konifer

Run the container in development mode, exposing the service on port 8080 (or any port you want) using this command:

```bash
docker run --detach \
  --rm \
  --name konifer-quickstart \
  --publish 8080:8080 \
  --env IN_MEMORY=true \
  ghcr.io/dmaiken/konifer:latest
```

This starts Konifer with in-memory dependencies. This mode is for evaluation; its data is discarded when the container
stops.

Verify that Konifer is ready before continuing:

```bash
curl --fail \
  --retry 10 \
  --retry-connrefused \
  --retry-delay 1 \
  'http://localhost:8080/health'
```

:::note
Konifer is deployed exclusively via Docker. Due to the precise configuration required for the underlying libvips binary,
we do not provide standalone JARs or binary releases.
:::

## 2. Store your first image

Store an image at the `/users/123/profile-picture` path.

```bash
curl --fail-with-body \
  --request POST \
  --url 'http://localhost:8080/assets/users/123/profile-picture' \
  --form 'metadata={"alt":"profile picture"}' \
  --form 'file=@/path/to/your/image.png'
```

## 3. View your asset's content

To view the content itself, use the `content` query selector.

```bash
curl --fail-with-body \
  --request GET \
  --output profile-picture.png \
  --url 'http://localhost:8080/assets/users/123/profile-picture/-/content'
```

## 4. Request a WebP thumbnail

Request a thumbnail. The thumbnail is transformed by:

- Specifying WebP format, a space-efficient, mature, and well-supported format
- Setting height and width to be 256×256
- Setting the fit to `fill` and gravity to `attention` to center on the most important part of the image

```bash
curl --fail-with-body \
  --header 'Accept: image/webp' \
  --output profile-picture.webp \
  --url 'http://localhost:8080/assets/users/123/profile-picture/-/content?w=256&h=256&fit=fill&g=attention'
```

:::note
The `Accept` header asks Konifer to return the generated variant as WebP. A `format` query parameter, when present,
takes precedence over the header.
:::

## 5. View your asset's information

To view information about this profile picture, use the `info` query selector. You will see two variants listed:

1. The original variant is the content supplied when storing the asset initially.
2. The WebP thumbnail

```bash
curl --fail-with-body \
  --request GET \
  --url 'http://localhost:8080/assets/users/123/profile-picture/-/info'
```

## 6. Upload an updated profile picture

The user has chosen a new profile picture. Upload another image to the same path; Konifer creates a new entry without
changing the application-facing URL.

```bash
curl --fail-with-body \
  --request POST \
  --url 'http://localhost:8080/assets/users/123/profile-picture' \
  --form 'metadata={"alt":"profile picture"}' \
  --form 'file=@/path/to/new-profile-picture.png'
```

Note the `entryId` returned. It will have incremented.

## 7. Fetch the new and old profile pictures

Using the `content` query selector, request the new image using the same path as before:

```bash
curl --fail-with-body \
  --request GET \
  --output profile-picture-new.png \
  --url 'http://localhost:8080/assets/users/123/profile-picture/-/content'
```

To fetch the old one, specify the old `entryId`:

```bash
curl --fail-with-body \
  --request GET \
  --output profile-picture-old.png \
  --url 'http://localhost:8080/assets/users/123/profile-picture/-/entry/0/content'
```

In a fresh quickstart container, the first entry has an `entryId` of `0`. Use the value returned by your first upload if
it differs.

## 8. View information for every profile picture

The `info` selector can return information for every entry at the path when `limit` is `-1`:

```bash
curl --fail-with-body \
  --request GET \
  --output profile-pictures.json \
  --url 'http://localhost:8080/assets/users/123/profile-picture/-/info?limit=-1'
```

## 9. Stop Konifer

```bash
docker stop konifer-quickstart
```

Because the container was started with `--rm`, Docker removes it after it stops.

## Next steps

The quickstart uses ephemeral in-memory storage. To configure persistent storage, path policies, variant profiles, and
delivery behavior, continue to [Configure Konifer](configure-konifer.md).

For a production-ready PostgreSQL and S3-compatible deployment, see
[Deploying Konifer](../operate/deployment.md).
