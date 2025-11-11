---
slug: /
sidebar_position: 1
id: intro
title: Welcome to Direkt documentation
sidebar_label: "Introduction"
---
Direkt is an asset management service designed to store and deliver static content at your direction. With a simple, 
expressive API and robust configuration options, you control your content however you see fit.

Direkt uses PostgreSQL to manage metadata and is designed to work with image assets today, with planned support for 
other file types, such as PDFs. The platform's modular design may support other relational database systems in the future.

Direkt is built for maximum flexibility, working seamlessly with any S3-compatible object store (including local 
options like MiniIO). You maintain control over asset manipulation, and expensive transformations are generated on your 
own hardware, exactly when and how you specify. This frees you from vendor lock-in and external API subscription costs.

Direkt offers robust and growing image transformation options, leveraging the speed of libvips. Vips and Direkt work 
together to stream content, avoiding the need to buffer the entire asset into memory. This allows large assets to be 
handled easily and efficiently. Image variants can be generated on-demand or eagerly upon asset storage, and the 
platform includes powerful caching capabilities for commonly-used variants such as well known viewports, image formats,
or thumbnails.
