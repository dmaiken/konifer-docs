---
title: Who should use Konifer?
sidebar_position: 2
description: Evaluate Konifer for your application's image lifecycle, addressing choices, and self-hosted deployment.
---

Konifer is a self-hosted image backend for application and platform teams. Handle uploads, validation, storage,
transformations, and deletion without building and maintaining those workflows yourself. Use your storage and CDN,
and choose image paths that fit your application.

## Work you can hand to Konifer

* **Uploads and validation:** accept images and enforce size, dimension, pixel count, and format limits in one place.
* **Storage and replacement:** keep originals, metadata, collections, and upload history. Replace an image without
  changing its application URL.
* **Transformations and caching:** define reusable profiles, generate variants after upload or on demand, and reuse
  cached results without building a separate thumbnail workflow.
* **Policies and cleanup:** give avatars, product galleries, and tenant branding different rules. Delete images beneath
  a resource's path through one request.

Share these capabilities across applications while keeping image handling code out of individual services.

## Choose how you address images

Use resource paths, image IDs, or a combination in the same deployment:

```text
/assets/users/123/profile-picture
/assets/products/sku-123/gallery
/assets/{imageId}
/assets/users/123/images/{imageId}
```

With a resource path, construct an image URL from the resource ID without storing a separate image reference.
Replace `{imageId}` with your own identifier when you prefer independent image references.

Group related images under parent paths to apply shared storage and processing policies and delete them together.
Each upload gets a Konifer `entryId` within its path, so you can retrieve a particular item or previous version.

See [Assets](../concepts/Assets/overview.md) and [Path configuration](../concepts/path-configuration.md) for details.

## Common uses

* User avatars, organization logos, and tenant branding
* Product photos, marketplace galleries, and CMS images
* Receipts, inspection photos, and claim evidence
* Shared image infrastructure for several applications or services

For vision pipelines, request display images and raw pixel buffers from the same stored source. Your worker handles
tensor construction and model-specific scaling and normalization. See [Pixels for inference](../guides/pixels-for-inference.md).

## Deployment and product boundaries

### You operate the service

Run Konifer with PostgreSQL and S3-compatible storage or a persistent filesystem. Image processing and background
variant generation run inside Konifer, without a separate message broker or worker deployment.

Add replicas behind a load balancer using shared PostgreSQL and image storage. Filesystem deployments need a shared
persistent mount accessible to all replicas.

Your team manages backups, upgrades, and capacity, and supplies application authentication and authorization. You
choose your storage and CDN. See [Deployment](../operate/deployment.md) for setup and operating requirements.

### You supply the user interface

Konifer provides an HTTP API for your application or custom administration interface. For a ready-made media library
with editorial approvals, rights management, and creative collaboration, evaluate a DAM or CMS.

### Consider what your existing pipeline handles

If another system manages your originals and their lifecycle, compare whether you need a transformation proxy or
want Konifer to manage storage, variants, replacement, and deletion together.

## Try it

Follow the [10-minute quickstart](getting-started.md) to upload an image, request a WebP thumbnail, and replace the
original while keeping the same application URL.
