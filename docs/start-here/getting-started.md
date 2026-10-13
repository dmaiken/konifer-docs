---
sidebar_position: 3
id: getting-started
title: Getting Started with Konifer
sidebar_label: "Quickstart"
---

Upload a profile picture, create a WebP thumbnail, and replace the original without changing its URL.
You can follow along in about 10 minutes with Docker and curl, or browse the images and example responses below.

## 1. Start Konifer

Start a development container on port 8080:

```bash
docker run --detach \
  --rm \
  --name konifer-quickstart \
  --publish 8080:8080 \
  --env IN_MEMORY=true \
  ghcr.io/dmaiken/konifer:{{koniferVersion}}
```

This evaluation mode uses in-memory storage. You lose the uploaded images and their information when you stop the
container.

Verify that Konifer is ready before continuing:

```bash
curl --fail \
  --retry 10 \
  --retry-connrefused \
  --retry-delay 1 \
  'http://localhost:8080/health/ready'
```

Open [Swagger UI](http://localhost:8080/api/docs) to explore the running server's asset API. The generated OpenAPI
specification is available at `http://localhost:8080/api/docs/openapi.json`. See the
[OpenAPI reference](../reference/api/openapi.md).

:::note
Use Docker to run Konifer with its required libvips configuration. We do not provide standalone JARs or binary releases.
:::

## 2. Store your first image

Download Mr. Dog and save it as `mr-dog-1.jpg`. Run the upload command from the folder where you saved the image.
You will store it at the `/users/123/profile-picture` path.

<figure className="quickstart-image">
  <img src="/getting-started/mr-dog-1.jpg" alt="Mr. Dog, a small cute dog" width="1200" height="798" />
  <figcaption>
    Mr. Dog · Original JPG · 1200×798 pixels.{' '}
    <a href="/getting-started/mr-dog-1.jpg" download="mr-dog-1.jpg">Download Mr. Dog (JPG)</a>
  </figcaption>
</figure>

```bash
curl --fail-with-body \
  --request POST \
  --url 'http://localhost:8080/assets/users/123/profile-picture' \
  --form 'metadata={"alt":"profile picture"}' \
  --form 'asset=@mr-dog-1.jpg'
```

The response includes `"entryId": 0`, which identifies this first upload. Keep it to retrieve this picture after you
upload a replacement. Your entry ID may differ if you have uploaded to this path before.

<details>
<summary>Full upload response</summary>

```json
{
  "class": "image",
  "alt": "profile picture",
  "entryId": 0,
  "labels": {},
  "tags": [],
  "source": "upload",
  "variants": [
    {
      "isOriginalVariant": true,
      "storeBucket": "assets",
      "storeKey": "d2128c60-e2e2-4056-ae6a-3d6799b41b83.jpeg",
      "attributes": {
        "height": 798,
        "width": 1200,
        "format": "jpg",
        "colorSpace": "srgb",
        "pageCount": 1
      },
      "lqip": {}
    }
  ],
  "createdAt": "2026-10-15T01:46:42.879461495",
  "modifiedAt": "2026-10-15T01:46:42.906062144"
}
```

</details>

## 3. View your asset's content

Open this URL in your browser to view Mr. Dog. The `content` selector returns the image itself:

```http
http://localhost:8080/assets/users/123/profile-picture/-/content
```

## 4. Request a WebP thumbnail

Open this URL in your browser to create a 256×256 WebP thumbnail. Use `fit=fill` to fill the square without stretching
the image, and `g=attention` to choose which area to keep when cropping:

```http
http://localhost:8080/assets/users/123/profile-picture/-/content?format=webp&w=256&h=256&fit=fill&g=attention
```

<div className="quickstart-images">
  <figure className="quickstart-image">
    <img src="/getting-started/mr-dog-1.jpg" alt="Original landscape photo of Mr. Dog" width="1200" height="798" />
    <figcaption>Original JPG · 1200×798 pixels</figcaption>
  </figure>
  <figure className="quickstart-image">
    <img src="/getting-started/mr-dog-thumbnail.webp" alt="Square thumbnail of Mr. Dog" width="256" height="256" />
    <figcaption>WebP thumbnail · 256×256 pixels</figcaption>
  </figure>
</div>

You now have the original image and a thumbnail under the same asset path.

:::note
Konifer respects the `Accept` header. A `format` query parameter, when present, takes precedence over the header.
:::

## 5. View your asset's information

Open the `info` URL in your browser to inspect the stored image and its variants:

```http
http://localhost:8080/assets/users/123/profile-picture/-/info
```

The response includes the original JPG and the WebP thumbnail you requested. This excerpt shows their dimensions and
formats; it omits the other response fields:

```json
{
  "entryId": 0,
  "variants": [
    {
      "isOriginalVariant": true,
      "attributes": { "height": 798, "width": 1200, "format": "jpg" }
    },
    {
      "isOriginalVariant": false,
      "attributes": { "height": 256, "width": 256, "format": "webp" }
    }
  ]
}
```

<details>
<summary>Full asset information response</summary>

```json
{
  "class": "image",
  "alt": "profile picture",
  "entryId": 0,
  "labels": {},
  "tags": [],
  "source": "upload",
  "variants": [
    {
      "isOriginalVariant": true,
      "storeBucket": "assets",
      "storeKey": "d2128c60-e2e2-4056-ae6a-3d6799b41b83.jpeg",
      "attributes": {
        "height": 798,
        "width": 1200,
        "format": "jpg",
        "colorSpace": "srgb",
        "pageCount": 1
      },
      "lqip": {}
    },
    {
      "isOriginalVariant": false,
      "storeBucket": "assets",
      "storeKey": "f68b413f-a5db-4e9a-b38c-613909bd9bc0.webp",
      "attributes": {
        "height": 256,
        "width": 256,
        "format": "webp",
        "colorSpace": "srgb",
        "pageCount": 1,
        "loop": 0
      },
      "transformation": {
        "width": 256,
        "height": 256,
        "fit": "fill",
        "gravity": "attention",
        "format": "webp",
        "rotate": "0",
        "flip": "",
        "filter": "",
        "blur": 0,
        "quality": 80,
        "padding": {
          "amount": 0,
          "color": []
        },
        "metadata": {
          "strip": []
        },
        "colorSpace": "srgb"
      },
      "lqip": {}
    }
  ],
  "createdAt": "2026-10-15T01:46:42.879461495",
  "modifiedAt": "2026-10-15T01:46:42.906062144"
}
```

</details>

## 6. Upload an updated profile picture

Replace Mr. Dog's profile picture with a new one. Download the image as `mr-dog-2.jpg` into the same folder, then
upload it to the same path. Konifer creates a new entry without changing the URL your application uses.

<figure className="quickstart-image">
  <img src="/getting-started/mr-dog-2.jpg" alt="Mr. Dog, a cute little dog" width="1200" height="798" />
  <figcaption>
    Mr. Dog · Replacement JPG · 1200x798 pixels.{' '}
    <a href="/getting-started/mr-dog-2.jpg" download="mr-dog-2.jpg">Download Mr. Dog (JPG)</a>
  </figcaption>
</figure>

```bash
curl --fail-with-body \
  --request POST \
  --url 'http://localhost:8080/assets/users/123/profile-picture' \
  --form 'metadata={"alt":"profile picture"}' \
  --form 'asset=@mr-dog-2.jpg'
```

The response now includes `"entryId": 1`. You have two entries at the same path, each with its own entry ID.

<details>
<summary>Full replacement upload response</summary>

```json
{
  "class": "image",
  "alt": "profile picture",
  "entryId": 1,
  "labels": {},
  "tags": [],
  "source": "upload",
  "variants": [
    {
      "isOriginalVariant": true,
      "storeBucket": "assets",
      "storeKey": "d87ce003-aa51-4e00-b507-30465751e971.jpeg",
      "attributes": {
        "height": 798,
        "width": 1200,
        "format": "jpg",
        "colorSpace": "srgb",
        "pageCount": 1
      },
      "lqip": {}
    }
  ],
  "createdAt": "2026-10-15T01:53:32.95613658",
  "modifiedAt": "2026-10-15T01:53:32.958626453"
}
```

</details>

## 7. Fetch the new and old profile pictures

Open the same `content` URL again to view Mr. Dog's latest profile picture:

```http
http://localhost:8080/assets/users/123/profile-picture/-/content
```

To view Mr. Dog's old profile picture, add the first upload's entry ID to the URL:

```http
http://localhost:8080/assets/users/123/profile-picture/-/entry/0/content
```

In a fresh quickstart container, the first entry has an `entryId` of `0`. Use the value returned by your first upload if
it differs.

<div className="quickstart-images">
  <figure className="quickstart-image">
    <img src="/getting-started/mr-dog-1.jpg" alt="Mr. Dog, the current profile picture" width="1200" height="798" />
    <figcaption>Current picture · Mr. Dog · Entry 1</figcaption>
  </figure>
  <figure className="quickstart-image">
    <img src="/getting-started/mr-dog-2.jpg" alt="Mr. Dog, the previous profile picture" width="1200" height="798" />
    <figcaption>Previous picture · Mr. Dog · Entry 0</figcaption>
  </figure>
</div>

## 8. View information for every profile picture

Open the `entries` URL in your browser to see both uploads, newest first. By default, Konifer returns up to 20 entries;
use the `limit` query parameter to change that number.

```http
http://localhost:8080/assets/users/123/profile-picture/-/entries
```

This excerpt shows the two entry IDs. Expand the full response to inspect each entry's variants:

```json
{
  "entries": [
    { "entryId": 1 },
    { "entryId": 0 }
  ]
}
```

<details>
<summary>Full entries response</summary>

```json
{
  "entries": [
    {
      "class": "image",
      "alt": "profile picture",
      "entryId": 1,
      "labels": {},
      "tags": [],
      "source": "upload",
      "variants": [
        {
          "isOriginalVariant": true,
          "storeBucket": "assets",
          "storeKey": "d87ce003-aa51-4e00-b507-30465751e971.jpeg",
          "attributes": {
            "height": 798,
            "width": 1200,
            "format": "jpg",
            "colorSpace": "srgb",
            "pageCount": 1
          },
          "lqip": {}
        }
      ],
      "createdAt": "2026-10-15T01:53:32.95613658",
      "modifiedAt": "2026-10-15T01:53:32.958626453"
    },
    {
      "class": "image",
      "alt": "profile picture",
      "entryId": 0,
      "labels": {},
      "tags": [],
      "source": "upload",
      "variants": [
        {
          "isOriginalVariant": true,
          "storeBucket": "assets",
          "storeKey": "d2128c60-e2e2-4056-ae6a-3d6799b41b83.jpeg",
          "attributes": {
            "height": 798,
            "width": 1200,
            "format": "jpg",
            "colorSpace": "srgb",
            "pageCount": 1
          },
          "lqip": {}
        },
        {
          "isOriginalVariant": false,
          "storeBucket": "assets",
          "storeKey": "f68b413f-a5db-4e9a-b38c-613909bd9bc0.webp",
          "attributes": {
            "height": 256,
            "width": 256,
            "format": "webp",
            "colorSpace": "srgb",
            "pageCount": 1,
            "loop": 0
          },
          "transformation": {
            "width": 256,
            "height": 256,
            "fit": "fill",
            "gravity": "attention",
            "format": "webp",
            "rotate": "0",
            "flip": "",
            "filter": "",
            "blur": 0,
            "quality": 80,
            "padding": {
              "amount": 0,
              "color": []
            },
            "metadata": {
              "strip": []
            },
            "colorSpace": "srgb"
          },
          "lqip": {}
        }
      ],
      "createdAt": "2026-10-15T01:46:42.879461495",
      "modifiedAt": "2026-10-15T01:46:42.906062144"
    }
  ]
}
```

</details>

## Optional: fetch raw pixels

For image-processing code, request a 224×224 RGB buffer in planar layout:

```bash
curl --fail-with-body \
  --output profile-picture.bin \
  --url 'http://localhost:8080/assets/users/123/profile-picture/-/content?format=pixels&w=224&h=224&fit=fill&cs=srgb&pixel-channels=RGB&pixel-layout=planar'
```

Konifer returns 150,528 unsigned 8-bit samples as `application/octet-stream`. This buffer contains the red plane,
then the green plane, then the blue plane. It has no image header. Fetch `link` with the same transformation to inspect
the dimensions and `attributes.pixels`:

```bash
curl --fail-with-body \
  --url 'http://localhost:8080/assets/users/123/profile-picture/-/link?format=pixels&w=224&h=224&fit=fill&cs=srgb&pixel-channels=RGB&pixel-layout=planar'
```

See [Raw Pixels](../concepts/pixels.md) for channel order, grayscale, and preprocessing, and the
[Fetch Assets reference](../reference/api/assets/fetch-assets.mdx#example-raw-pixels) for client examples.

## 9. Stop Konifer

```bash
docker stop konifer-quickstart
```

Because the container was started with `--rm`, Docker removes it after it stops.

## Next steps

To use Konifer from your application, see [Konifer Client](using-the-client.mdx).

The quickstart uses temporary in-memory storage. To configure persistent storage, path policies, variant profiles, and
delivery behavior, continue to [Configure Konifer](configure-konifer.md).

For a production-ready PostgreSQL and S3-compatible deployment, see
[Deploying Konifer](../operate/deployment.md).
