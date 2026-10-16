---
sidebar_position: 5
id: concepts-lqip
title: LQIPs (Low Quality Image Previews)
sidebar_label: "LQIPs"
---

Low-quality image previews (LQIPs) provide a compact placeholder while a full image downloads. Konifer can generate two
types:

- [BlurHash](https://blurha.sh/): Encodes a blurred color approximation as a short string
- [ThumbHash](https://evanw.github.io/thumbhash/): Encodes color, aspect ratio, and optional transparency in a compact
  binary value

You can enable either format or both.

> **Note**: Use a BlurHash or ThumbHash decoder in your application to render the placeholder. The projects linked above
> provide format details and implementation libraries.

Konifer creates LQIPs with eager and on-demand variants. It regenerates a preview only when a transformation changes the
image data used by the preview. For example, a `blur` transformation reuses the existing LQIP.

## Usage

LQIPs are disabled by default. Enable both formats for a path with this configuration:

```hocon
paths {
  "/users" {
    lqip = [
      blurhash,
      thumbhash
    ]
  }
}
```

To disable inherited LQIPs for a child path, set `lqip` to an empty array:

```hocon
paths {
  "/**" {
    lqip = [
      blurhash,
      thumbhash
    ]
  }
  "/users" {
    lqip = []
  }
}
```
