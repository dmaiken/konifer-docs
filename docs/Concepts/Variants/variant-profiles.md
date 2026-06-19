---
sidebar_position: 3
id: concepts-variant-profiles
title: Variant Profiles
sidebar_label: "Profiles"
---

Variant Profiles are an easy way to name a specific transformation you commonly make against an asset. For example,
let's say you want to define what a thumbnail is for your application.

Let's define a `thumbnail` variant profile to have:

- Width of 128
- a Fit of `fill`
- autorotation of the image

At the root level of your configuration, define a `variant-profile` array:

```hocon
variant-profiles {
  thumbnail {
    w = 128
    fit = fill
    r = auto
  }
}
```

Variant profiles use the same transformation parameters as the Fetch Asset API.

## Usage

To use a variant profile, supply the `profile` query parameter.

```http 
GET /assets/users/123/profile-picture?profile=thumbnail
```

## Overriding a Variant Profile

Konifer lets you override aspects of a supplied variant profile within the Fetch Asset API request. Using the example
from
above, let's say you wish to create a larger thumbnail that's 256 pixels wide. Specify the `w` you wish in the
request:

```http 
GET /assets/users/123/profile-picture?profile=thumbnail&w=256
```

Any individual transformation parameters supplied override the profile's respective parameter, if defined
in the profile.

## Restricting transformations to only profiles

You may want to limit the on-demand variants allowed to only those defined in variant profiles. To do this,
set `transform.on-demand-variant.mode` to `profile_only` in your Path Configuration.

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

With `profile_only` set, any request containing a transformation parameter that is not `profile` will return a 400 Bad
Request.
The default `mode` is `enabled` which permits any transformation parameter including `profile`. Original variants can
also be requested
if `profile` is not supplied.
