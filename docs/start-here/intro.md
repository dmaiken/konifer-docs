---
slug: /
sidebar_position: 1
id: intro
title: Introduction
description: Learn what Konifer is, how its path-based model works, and why applications use it to manage image storage, transformation, and delivery.
sidebar_label: "What is Konifer?"
---

# Introduction

Konifer is a self-hosted image storage, transformation, and delivery service designed to fit your application’s domain
model.

It stores original images, generates and caches transformed variants, and delivers images as content, links, redirects,
downloads, or structured information. Instead of introducing a separate identity model for media, Konifer lets your
application address images using paths it already understands.

```text
/assets/users/123/profile-picture
/assets/organizations/acme/logo
/assets/products/sku-123/gallery
/assets/claims/456/evidence
```

If your application knows which user, product, organization, or record owns an image, it can usually construct the
corresponding Konifer URL without storing another opaque asset identifier.

## Image infrastructure often becomes a second application model

A typical image service begins with a simple upload:

1. Your application uploads an image.
2. The image service returns an asset identifier.
3. Your application stores that identifier.
4. Every future request must translate between your domain resource and the image service’s resource.

This is appropriate when media has an independent identity. But many application images do not.

A profile picture belongs to a user. A hero image belongs to a product. A receipt belongs to an expense. Card artwork
belongs to a program, region, and design. Adding a separate media identifier can create integration state without adding
useful meaning.

Konifer starts with the relationship your application already knows:

```http
POST /assets/users/123/profile-picture
```

The same path can later be used to retrieve the image:

```http
GET /assets/users/123/profile-picture/-/content
```

Or request a transformed version:

```http
GET /assets/users/123/profile-picture/-/content?w=256&h=256&fit=crop&format=webp
```

Konifer’s path is not merely an object-storage key. It is an application-level address through which images can be
stored, selected, transformed, and delivered.

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

Konifer can resize, crop, rotate, blur, pad, normalize, and convert images into modern formats.

Transformations can be requested directly:

```http
GET /assets/products/sku-123/hero/-/content?w=1200&h=630&fit=crop&format=webp
```

Frequently used transformations can instead be defined as named profiles:

```http
GET /assets/products/sku-123/hero/-/content?profile=social-card
```

When Konifer generates a variant, it stores the result and reuses it for later requests. Common variants can also be
generated after upload so they are ready before the first viewer requests them.

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
    allowed-content-types = [
      "image/jpeg",
      "image/png"
    ]
  }
}
```

More specific paths inherit and override broader rules. One Konifer deployment can therefore support several
applications or media workflows without placing every policy decision in application code.

## Storage and delivery remain under your control

Konifer is self-hosted. You choose where it runs, where originals and variants are stored, how it is exposed to clients,
and whether delivery passes through a CDN.

A persistent deployment uses PostgreSQL for asset records and an object-storage or filesystem backend for image content.
Konifer can deliver image bytes itself or integrate with object storage and CDNs through links, redirects, cache
headers, ETags, and signed transformation URLs.

Self-hosting does add operational responsibility. In return, your team controls:

* The infrastructure that processes uploaded images
* The storage account containing originals and variants
* Network and data-residency boundaries
* Retention, backup, and deletion procedures
* Resource limits and transformation policies
* Delivery and caching behavior
* Infrastructure costs and scaling decisions

Konifer does not prescribe how the rest of your application must be deployed.

## What Konifer is—and what it is not

Konifer is an API-first image infrastructure component for application and platform teams.

It provides storage, transformation, variant caching, information management, path-based policy, and several delivery
modes through one service.

Konifer is not:

* A hosted image SaaS
* A visual digital-asset-management interface
* A replacement for your application’s authorization model
* A complete content-management system
* Merely a stateless resize proxy

Konifer is image-focused today. It is best suited to systems where images are application resources with an owner,
purpose, lifecycle, and delivery policy.

## Where to go next

Start with [Who should use Konifer?](/docs/start-here/is-konifer-right-for-you) to evaluate whether its model fits your
application.

Then complete [Getting started](/docs/start-here/getting-started) to run Konifer locally, upload an image, request a
transformed variant, and replace the image without changing its application path.

To understand the design in more depth, continue to [Assets](/docs/concepts/Assets/concepts-assets).
