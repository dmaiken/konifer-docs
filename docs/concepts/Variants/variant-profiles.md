---
sidebar_position: 3
id: concepts-variant-profiles
title: Variant Profiles
sidebar_label: "Profiles"
---

Variant profiles assign a name to a reusable transformation. A profile keeps dimensions, format, and other image rules
in server configuration instead of repeating them in each request.

This `thumbnail` profile:

- Produces a 128×128-pixel image
- Uses `fill` resizing
- Applies the source image's EXIF orientation

Define profiles in the top-level `variant-profiles` block:

```hocon
variant-profiles {
  thumbnail {
    w = 128
    h = 128
    fit = fill
    r = auto
  }
}
```

Variant profiles use the same transformation parameters as the Fetch Asset API.

## Usage

Supply the profile name in the `profile` query parameter:

```http
GET /assets/users/123/profile-picture?profile=thumbnail
```

## Overriding a Variant Profile

Individual transformation parameters in the request override matching values from the profile. This request uses the
`thumbnail` profile but changes its dimensions to 256×256 pixels:

```http
GET /assets/users/123/profile-picture?profile=thumbnail&w=256&h=256
```

## Restricting Transformations to Profiles

Set `transform.on-demand-variant.mode` to `profile_only` to reject on-demand transformations that do not use a profile:

```hocon
paths {
  "/**" {
    transform {
      on-demand-variant {
        mode = profile_only
      }
    }
  }
}
```

With `profile_only`, a request that contains a transformation parameter other than `profile` returns `400 Bad Request`.
A request without transformation parameters can still retrieve the original variant. The default mode, `enabled`,
accepts profiles and individual transformation parameters.
