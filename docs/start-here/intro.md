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
GET /assets/products/sku-123/photo/-/entry/4/content?w=256&h=256&fit=fill&r=auto&format=webp
```

For a processing worker, request a 224×224 RGB buffer in planar layout:

```http
GET /assets/products/sku-123/photo/-/entry/4/content?w=224&h=224&fit=fill&r=auto&cs=srgb&format=pixels&pixel-channels=RGB&pixel-layout=planar
```

Konifer returns the pixel bytes together with dimensions, channel order, layout, and data type in HTTP headers.
The client exposes these attributes alongside the bytes. You can change the representation without uploading a
second source image, and Konifer caches generated variants for reuse.

Pixel output contains unsigned 8-bit samples. Your consumer constructs tensors and applies any model-specific
scaling or normalization it needs. See [Raw Pixels](../concepts/pixels.md) for the buffer contract and
[Image Transformations](../reference/image-transformation-reference.md) for preprocessing options.

## Address images through your application

Konifer lets your application address images using paths it already understands:

```text
/assets/users/123/profile-picture
/assets/organizations/acme/logo
/assets/products/sku-123/gallery
/assets/claims/456/evidence
```

If your application knows which user, product, organization, or record owns an image, it can usually construct the
corresponding Konifer URL without storing another opaque asset identifier.

Use these paths to store, select, transform, and deliver images. An application can request the current image at a
path, while a processing job can select a specific entry when its source version matters.

## A path can represent the current image, a collection, or history

Multiple images can be stored at the same path. Each receives an `entryId` that identifies that particular entry within
the path.

By default, your application can request the newest entry:

```http
GET /assets/users/123/profile-picture/-/content
```

After a new profile picture is uploaded to the same path, that URL resolves to the replacement. The application does not
need to update the URL it already knows.

A previous entry remains individually addressable:

```http
GET /assets/users/123/profile-picture/-/entry/4/content
```

The same model can represent several common workflows:

* A replaceable user avatar
* A product gallery containing several images
* Previous versions of published artwork
* Images attached to a case, claim, inspection, or document
* Generated media organized by tenant, product, or region

The path represents the domain concept. An `entryId` represents one specific item or version when that distinction
matters.

## Transformations are stored as reusable variants

Konifer can resize, crop, rotate, blur, pad, convert color spaces, and output encoded images or raw pixels.

Transformations can be requested directly:

```http
GET /assets/products/sku-123/hero/-/content?w=1200&h=630&fit=crop&format=webp
```

Frequently used transformations can instead be defined as named profiles:

```http
GET /assets/products/sku-123/hero/-/content?profile=social-card
```

When Konifer generates a variant, it stores the result and reuses it for later requests. Common variants can also be
generated after upload for display or processing consumers.

This makes Konifer more than an image-processing proxy. It manages the relationship between originals, generated
variants, application paths, stored information, and delivery behavior.

## Behavior can follow your path hierarchy

Different categories of images often need different rules.

Public avatars may use long-lived caching and eagerly generated thumbnails. Private evidence images may allow fewer
formats, remove metadata, and use a separate storage bucket. Product galleries may allow several entries, while a
company logo path may normally resolve only to the newest image.

Konifer lets you configure these differences by path pattern:

```hocon
paths {
  "/public/avatars/**" {
    transform {
      eager-variants = [small, medium]
    }

    cache-control {
      enabled = true
      visibility = public
      max-age = 31536000
    }
  }

  "/claims/**/evidence" {
    bucket = "private-evidence"
    allowed-formats = [ jpg, png ]
  }
}
```

More specific paths inherit and override broader rules. One Konifer deployment can therefore support several
applications or media workflows without placing every policy decision in application code.

## Fits your existing infrastructure

Konifer runs alongside your application services and integrates with the storage and delivery infrastructure your team
already uses. You choose where originals and variants are stored, how Konifer is exposed to clients, and whether
delivery passes through a CDN.

A persistent deployment uses PostgreSQL for asset records and an object-storage or filesystem backend for image content.
Konifer can deliver image bytes itself or integrate with object storage and CDNs through links, redirects, cache
headers, ETags, and signed transformation URLs.

This architecture gives your team control over:

* The infrastructure that processes uploaded images
* The storage account containing originals and variants
* Network and data-residency boundaries
* Retention, backup, and deletion procedures
* Resource limits and transformation policies
* Delivery and caching behavior
* Infrastructure costs and scaling decisions

Konifer does not prescribe how the rest of your application must be deployed.

## What Konifer is - and what it is not

Konifer is an API-first image infrastructure component for application and platform teams.

It provides storage, transformation, variant caching, information management, path-based policy, and several delivery
modes through one service.

Konifer is not:

* A visual digital-asset-management interface
* A replacement for your application’s authorization model
* A complete content-management system
* Merely a stateless resize proxy

## Where to go next

Start with [Who should use Konifer?](/docs/start-here/is-konifer-right-for-you) to evaluate whether its model fits your
application.

Then complete [Getting started](/docs/start-here/getting-started) to run Konifer locally, upload one image, and request
both a WebP thumbnail and a raw pixel buffer from it.

To understand the design in more depth, continue to [Assets](/docs/concepts/Assets/concepts-assets).
