---
sidebar_position: 3
id: concepts-variant-profiles
title: Variant Profiles
sidebar_label: "Variant Profiles"
---
# Overview
Variant Profiles are an easy way to name a specific transformation you commonly make against an asset. For example,
let's say you want to define what a thumbnail is for your application.

Let's define a `thumbnail` variant profile to have:
- Width of 128
- a Fit of `fill`
- auto-rotation of the image

At the root level of your configuration, define a `variant-profile` array:
```hocon
variant-profiles = [
  {
    name = thumbnail
    w = 128
    fit = fill
    r = auto
  }
]
```

Variant profiles use the same transformation parameters as the Fetch Asset API.

## Usage
To use a variant profile, supply the `profile` query parameter.
```http 
GET /assets/users/123/profile-picture?profile=thumbnail
```

## Overriding a Variant Profile
Konifer lets you override aspects of a supplied variant profile within the Fetch Asset API request. Using the example from
above, let's say you wish to create a larger thumbnail that's 256 pixels wide. Simply specify the `w` you wish in the request:
```http 
GET /assets/users/123/profile-picture?profile=thumbnail&w=256
```
Any individual transformation parameters supplied will override the profile's respective parameter, if it is defined
in the profile.
