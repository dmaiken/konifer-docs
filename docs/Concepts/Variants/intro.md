---
sidebar_position: 1
id: concepts-variants
title: Introduction
sidebar_label: "Introduction"
---
# Overview
A Variant represents a specific, transformed version of the asset's content. It is generated using the
transformation options available within Konifer (e.g., resizing, cropping, format change).

A variant is composed of:
1.  **Attributes**: Properties of the variant, such as its `height`, `width`, and `mimeType`.
2.  **Transformation**: The specific operations applied to the **Original Variant** to create *this* variant
    (e.g., `rotate: 90`, `blur: 2`).

## Original Variant
The Original Variant is the physical representation of the asset content supplied during the Store Assets request.
**All other variants for this asset are transformed *from* the Original Variant.**

Only pre-processing defined in your configuration (e.g., applying a global `max-width` limit or file format conversion)
can transform the supplied content into the Original Variant. If no pre-processing is configured or applied, the
Original Variant is the exact representation of the supplied content.

# Variant Types
Variants can be generated in 2 different ways (in addition to Ingest Transformations):
- Eager variant generation
- On-demand variant generation

## Eager Variant Generation
You may know which variants you need at the time you store the asset. Eager variants are generated at the time of upload,
however, the generation is asynchronous and best-effort. The Store Asset API will return before eager variants are
generated, however, a background process to generate them is kicked off at the time of upload.

**Important**: Eager variants _must_ be defined using variant profiles. 

### Best-effort 
Eager variants are generated on a best-effort basis. If your Konifer instance is killed or the variant fails to generate
for any reason, it will not be rescheduled. When you request the variant, it will instead be generated on-demand.

### Configuration
Eager variants are defined in your path configuration. The following configuration will generate two different variants.
```json5
variant-profiles = [
  {
    name = small
    h = 50
    w = 50
    fit = cover
    mimeType = "image/png"
  },
  {
    name = medium
    h = 100
    w = 100
    fit = cover
    mimeType = "image/png"
  }
]

path-configuration = [
  {
    path = "/users/**"
    eager-variants = [
      small,
      medium
    ]
  }
]
```

## On-demand Variant Generation
Whenever the Fetch Asset API is invoked and manipulation arguments are supplied (e.g. `w`, `h`, `g`, etc), a variant
is generated from the Original Variant on-demand. The variant is also cached in your configured object store.

# Variant Caching
When variants are generated eagerly or on-demand, they are cached in your object store. If a cached variant matching
your request exists, it is returned. If not, the variant is generated and persisted in your object store.

Sometimes, the different parameters result in the same variant. For example, these two requests generate the same variant:
```http
GET /assets/users/123/profile-picture?f=h&r=180
```
and
```http
GET /assets/users/123/profile-picture?f=v
```
The first requests a variant that is horizontally-flipped and rotated 180 degrees. The second requests a variant that 
is vertically-flipped. Konifer is intelligent enough to know the resulting variant is the same.

# Deleting your Asset
Deleting your asset results in all variants belonging to the asset also being deleted.
