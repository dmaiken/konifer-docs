---
title: Who should use Konifer?
sidebar_position: 2
description: Decide whether Konifer’s path-based image storage, transformation, and delivery model fits your application.
---

Konifer is a strong fit for applications where images belong to resources the application already knows about, and for
teams that want storage, transformation, and delivery in infrastructure they control.

```text
/assets/users/123/profile-picture
/assets/products/sku-123/hero
/assets/claims/456/evidence
/assets/tenants/acme/branding/logo
```

If your application can construct paths like these from its own data, it can use Konifer without storing a separate
image identifier for every ordinary request.

## Konifer is a good fit when…

### Images belong to identifiable application resources

Konifer works best when images naturally belong to users, organizations, products, posts, documents, cases, or other
domain objects.

Your application can derive an image path from identifiers it already stores:

```kotlin
val path = "/assets/tenants/$tenantId/products/$sku/hero"
```

A path can resolve to the newest image, hold a collection, or preserve previous entries. Konifer assigns each stored
image an `entryId`, so a caller can still address a particular item or version when necessary.

### You want Konifer to manage the image lifecycle

A stateless image proxy is enough when you already have a source image URL and only need to resize or convert it.
Konifer is useful when your application also needs capabilities such as:

* Original-image storage
* Replaceable images, collections, or history at a stable path
* On-demand and eagerly generated variants
* Named transformation profiles
* Image information, labels, and tags
* Content, link, redirect, download, and information responses

Konifer brings these parts together behind one API instead of leaving each application to implement its own upload,
storage, transformation, and replacement workflow.

### Different images need different policies

One application often contains several image categories:

```text
/public/avatars/**
/marketplace/listings/**
/claims/**/evidence
/tenants/*/branding/**
```

Konifer can apply different storage, validation, preprocessing, transformation, caching, redirect, and
low-quality-placeholder behavior by path. Broader rules can be shared while more specific paths override them.

This is especially useful when several applications or teams should follow the same media conventions without
duplicating the policy in every caller.

### You want to run the image pipeline in your infrastructure

Konifer gives you control over where images are processed and stored, how they are delivered, and how the service
integrates with your network, object storage, and CDN.

A persistent deployment uses PostgreSQL and S3-compatible or filesystem storage. If your team already runs application
services and data stores, Konifer fits that familiar operating model. If avoiding service ownership is the priority, a
managed image platform will likely be a better fit.

## Konifer may not be the right fit when…

### You primarily want a managed platform

Choose a hosted image service when you want the provider to own the service infrastructure, scaling, operational
tooling, and support. Konifer is intended for teams that value control over their image pipeline and are comfortable
running it alongside their other backend services.

### You only need stateless transformation

If another system owns images at stable URLs and you only need resizing, cropping, or format conversion, a focused
transformation proxy may be a simpler architectural match.

Open-source projects designed for this model include [imgproxy](https://docs.imgproxy.net/)
and [imagor](https://docs.imagor.net/).

### Media has an independent identity

A traditional asset-ID model may work better when assets are reused across many unrelated resources, move frequently
between classifications, or are primarily found through search and collections rather than through application paths.

Konifer supports individual entries, labels, tags, and metadata, but its main advantage is the path model. If paths do
not simplify the relationship between your application and its images, that advantage matters less.

### You need a visual media library

Konifer is API-first. It is not a digital asset management or editorial product with asset browsing, approval workflows,
rights management, and creative collaboration tools. A DAM, a CMS media library, or a custom interface may be more
suitable for those users.

For these use cases,
consider [ResourceSpace](https://www.resourcespace.com/), [Strapi](https://docs.strapi.io/cms/features/media-library),
or [Pimcore](https://pimcore.com/en/products/digital-asset-management).

## Common use cases

Konifer is domain-neutral, but its model maps naturally to:

* User avatars, organization logos, and tenant branding
* Product images, marketplace listings, and galleries
* CMS images and other user-uploaded content
* Receipts, inspection photos, claim evidence, and supporting documents
* Versioned or generated artwork such as cards, passes, tickets, and report covers
* Shared image infrastructure used by several internal services

These are examples rather than built-in modes. The common feature is that the application already knows what each image
belongs to.

## Next steps

Continue to [Getting started](getting-started.md) to run Konifer locally and try the path model.

Read [Assets](../concepts/Assets/overview.md) for a deeper explanation of paths, entries, selectors, and stable versus
specific references.

To explore how different parts of an image hierarchy can inherit different behavior,
see [Path configuration](../concepts/path-configuration.md).
