---
slug: /
sidebar_position: 1
id: intro
title: Introduction
description: Store images once and serve display formats or raw pixel buffers through one self-hosted image storage and preprocessing API.
sidebar_label: "What is Konifer?"
---

Konifer is one image source for humans and machines. It stores your images and serves display formats or raw pixel
buffers through a self-hosted API, with reusable transformations for applications and vision pipelines.

A product photo may appear in a storefront and feed a classification worker. An inspection photo may need a preview
for a reviewer and a pixel buffer for analysis. With Konifer, both consumers can use the same stored image and request
the dimensions, format, and layout they need.

## One upload, two consumers

Store the source image at an application path:

```http
POST /assets/products/sku-123/photo
```

Use the returned `entryId` to select that source for both consumers. These examples use entry `4`; replace it with
the ID from your upload.

For a display thumbnail, request WebP with orientation applied:

```http
GET /assets/products/sku-123/photo/-/entry/4/content?width=256&height=256&fit=fill&rotate=auto&format=webp
```

For a processing worker, request a 224×224 RGB buffer in planar layout:

```http
GET /assets/products/sku-123/photo/-/entry/4/content?width=224&height=224&fit=fill&rotate=auto&color-space=srgb&format=pixels&pixel-channels=RGB&pixel-layout=planar
```

Konifer returns the pixel bytes together with dimensions, channel order, layout, and data type in HTTP headers.
The client exposes these attributes alongside the bytes. You can change the representation without uploading a
second source image, and Konifer caches generated variants for reuse.

Pixel output contains unsigned 8-bit samples. Your consumer constructs tensors and applies any model-specific
scaling or normalization it needs. See [Raw Pixels](../concepts/pixels.md) for the buffer contract and
[Image Transformations](../reference/image-transformation-reference.md) for preprocessing options.

## Address images through your application

Choose paths your application can construct from its own data:

```text
/assets/users/123/profile-picture
/assets/products/sku-123/gallery
```

Each path can hold several images. Fetch the newest entry without an ID, or use an `entryId` to select a specific
image after newer uploads arrive:

```http
GET /assets/users/123/profile-picture/-/content
GET /assets/users/123/profile-picture/-/entry/4/content
```

You can use the same path for a replaceable avatar, a gallery, or an upload history. See
[Assets](../concepts/Assets/overview.md) for selection and lifecycle operations.

Define [variant profiles](../concepts/Variants/variant-profiles.md) to reuse transformations, and apply storage,
validation, and delivery rules through [path configuration](../concepts/path-configuration.md).

## Fits your existing infrastructure

Run Konifer as a container with PostgreSQL for asset records and S3-compatible storage or a shared filesystem for
image content. Serve content through Konifer, object-store redirects, or your CDN. Your deployment provides
application authentication and authorization. See [Deploying Konifer](../operate/deployment.md) for setup.

## Where to go next

Start with [Who should use Konifer?](/docs/start-here/is-konifer-right-for-you) to evaluate whether its model fits your
application.

Then complete [Getting started](/docs/start-here/getting-started) to run Konifer locally, upload one image, and request
both a WebP thumbnail and a raw pixel buffer from it.

To understand the design in more depth, continue to [Assets](/docs/concepts/Assets/concepts-assets).
