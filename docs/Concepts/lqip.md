---
sidebar_position: 5
id: concepts-lqip
title: LQIPs (Low Quality Image Previews)
sidebar_label: "LQIPs"
---
# Overview
Low quality image previews or LQIPs are small, usually blurry versions of the image you'd like to display while the
larger image is downloaded over a network. This can be useful for a variety of reasons. Konifer supports two LQIP 
implementations:
- [Blurhash](https://blurha.sh/): By far the most common LQIP implementation
- [Thumbhash](https://evanw.github.io/thumbhash/): A newer, more compact version of Blurhash
One or both of these can be enabled.

> **Note**: For proper usage and decoding of these LQIP implementations, reference the links above. Correct LQIP 
> usage is out of scope of this documentation.

LQIP(s) are generated at the same time a variant is generated which could be eagerly or on-demand. Konifer is smart enough
to know when an LQIP should be regenerated and when it does not need to be. For example, if you apply a `blur` transformation,
an LQIP will not be regenerated, saving compute resources.

# Usage
LQIPs are disabled by default. LQIP implementations are enabled within Path Configuration. To enable both implementations, 
define your Path Configuration to be:
```json5
path-configuration = [
  {
    path = "/users"
    lqip = [ 
      blurhash, 
      thumbhash 
    ]
  }
]
```
If LQIPs are enabled in a parent path and you wish to disable in a specific child path, set `lqip` to an empty array:
```json5
path-configuration = [
  {
    path = "/**"
    lqip = [
      blurhash,
      thumbhash
    ]
  },
  {
    path = "/users"
    lqip = [ ]
  }
]
```
