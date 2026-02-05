---
slug: /
sidebar_position: 1
id: intro
title: Welcome to Konifer
sidebar_label: "Introduction"
---
Konifer is an asset management service designed to store and deliver static content at your direction. With a simple, 
expressive API and robust configuration options, you control your content however you see fit.

Using Postgres for metadata and a wide variety of options for object storage, you own your data. You maintain control 
over asset manipulation, and expensive transformations are generated on your own hardware, exactly when and how you specify. 
This frees you from vendor lock-in and external API subscription costs. No more tokens!

Konifer is built for maximum flexibility, working seamlessly with any S3-compatible object store (including local 
options like MiniIO). Don't use cloud storage? Filesystems are also supported! 

Konifer offers several features including:
- A robust, explicit, and hierarchical path-configuration framework for maximum flexibility
- Generating variants on-demand and eagerly
- Variant profiles for defining commonly-used image transformations
- Support for several image formats including PNG, JPEG, and also modern formats such as Webp, AVIF, HEIC, and JPEG XL
- Support for multi-paged formats such as GIF and animated Webp
- Low-quality image placeholders (LQIP) using BlurHash or Thumbhash algorithms
- Labels and tag metadata with the ability to search by labels
- Query selector primitives to let you query your assets your way
- Cache-friendly with robust Cache-Control, Etag, and CDN support
- URL-signing
