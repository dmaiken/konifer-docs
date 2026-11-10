---
slug: /
sidebar_position: 1
id: intro
title: Introduction
description: Save application development work with one self-hosted API for image uploads, validation, storage, transformations, and deletion.
sidebar_label: "What is Konifer?"
---

Konifer is a self-hosted image backend for applications. Handle uploads, validation, storage, transformations, and
deletion through one HTTP API, using your storage and CDN.

Your team can configure these workflows in Konifer instead of building upload handlers, thumbnail workers, image
history, and cleanup jobs for each application.

## One API for the image lifecycle

Upload a profile picture, request a thumbnail, and upload its replacement to the same path:

```http
# Upload a profile picture
POST /assets/users/123/profile-picture

# Generate a WebP thumbnail and cache it for reuse
GET /assets/users/123/profile-picture/-/content?width=256&format=webp

# Replace the current picture without changing its URL
POST /assets/users/123/profile-picture

# Delete the user's images when they close their account
DELETE /assets/users/123/-/recursive
```

Konifer keeps earlier uploads as entries at the path. Use the path to fetch the current image, or select an `entryId`
to retrieve a particular item or previous version. See [Assets](../concepts/Assets/overview.md).

## Choose paths and configure shared policies

Address images by resource, image ID, or both:

```text
/assets/users/123/profile-picture
/assets/products/sku-123/gallery
/assets/{imageId}
/assets/users/123/images/{imageId}
```

Resource paths let you construct image URLs without storing a separate image reference. Replace `{imageId}` with
your own identifier when you prefer independent image references.

Group related images under parent paths to apply common rules and delete them together. Set upload limits, choose
storage buckets, and configure delivery through [path configuration](../concepts/path-configuration.md). Define
[variant profiles](../concepts/Variants/variant-profiles.md) to reuse transformations across callers.

## Run it alongside your application

Deploy Konifer with PostgreSQL for asset records and S3-compatible storage or a persistent filesystem for image
content. Processing and background variant generation run inside Konifer, without a separate message broker or worker
deployment. Use your CDN, object-store redirects, or the API to deliver images.

Add replicas behind a load balancer using shared PostgreSQL and image storage. Filesystem replicas need access to
the same persistent mount. Your team manages backups, upgrades, and capacity, and supplies application authentication
and authorization. See [Deployment](../operate/deployment.md).

## Reuse images for vision pipelines

Request display images and raw pixel buffers from the same stored source, using profiles to share preprocessing and
cached variants. Your workers handle tensor construction and model-specific scaling and normalization. See
[Pixels for inference](../guides/pixels-for-inference.md) for a complete example.

## Try it

Follow the [10-minute quickstart](getting-started.md) to upload an image, generate a thumbnail, and replace the
original while keeping the same application URL.

Read [Who should use Konifer?](is-konifer-right-for-you.md) for use cases and deployment responsibilities.
