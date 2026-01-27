---
sidebar_position: 2
id: concepts-path-configuration
title: Path Configuration
sidebar_label: "Path Configuration"
---
# Overview
Path Configuration is one of the most powerful features in Konifer. It gives you fine-grained control over how your 
assets are processed, stored, and delivered, all based on the API path you use to store them.

This system allows you to treat different categories of assets (like public avatars, private documents, or marketing 
materials) in completely different ways, all from a single, unified configuration file (`konifer.conf`).

Path Configuration is defined in the `path-configuration` array in `konifer.conf`. Each object in the array must have 
a `path` attribute that specifies the path pattern it applies to.

## Example Configuration
You can configure the path `/public/avatars/**` to:
- Generate three specific thumbnail sizes eagerly upon upload. 
- Limit the height and width of a supplied image.

```hocon
path-configuration = [
  {
    path = "/public/avatars/**"
    eager-variants = [ small, medium, large ]
    max-height = 300
    max-width = 500
  }
]
```
While at the same time, configuring the path `/users/*/profile-picture` to:
- Use a completely different S3 bucket.
- Only accept JPEG images

```hocon
path-configuration = [
  {
    path = "/users/*/profile-picture"
    bucket = "profile-pictures"
    allowed-content-types = [ 
      "image/jpeg"
    ]
  }
]
```

# Wildcard Matching
You don't have to define rules for every exact path. Konifer allows you to apply rules to entire categories of assets 
using wildcards in your `konifer.conf` file.

There are two types of wildcards:
## Single Segment (`*`)
Matches any single path segment (the text between two slashes).

**Example**: `users/*` matches `users/123` but not `users/123/profile`.

## Multi-Segment 
Greedily matches zero or more path segments. This is the most common and powerful wildcard for applying rules 
to an entire "directory."

**Example**: `users/**` matches `users/`, `users/123`, and `users/123/profile`.

# Inheritance
Paths inherit the configuration of parent paths. For any given configuration value, **the most-specific configuration property
wins**.

### Example
Creating an asset at `/users/123` will use the `users` bucket (inherited from the `/users` path) and will also have 
restrictions on the allowed content types (defined on the more-specific `/users/123` path).
```hocon
path-configuration = [
  {
    path = "/users"
    bucket = "users"
  },
  {
    path = "/users/123"
    allowed-content-types = [
      "image/png",
      "image/jpeg"
    ]
  }
]
```
## Shallow Inheritance
Konifer's inheritance is **shallow**. Nested configuration values within objects or lists are not merged.

If a child path defines a list or object property (like `allowed-content-types`), the child's property completely 
overwrites the parent's property.

### Example 1: List Overwrite
Creating an asset at `/users/123` will not allow `image/png` since list properties are not merged. The `image/png` 
value from the parent is discarded, not merged.
```hocon
path-configuration = [
  {
    path = "/users"
    allowed-content-types = [
      "image/png",
    ]
  },
  {
    path = "/users/123"
    allowed-content-types = [
      "image/jpeg"
    ]
  }
]
```

### Example 2: Empty List Overwrite
Creating an asset at `/users/123` will not allow _any_ content-type. The empty list from the child path overwrites 
the parent's list.
```hocon
path-configuration = [
  {
    path = "/users"
    allowed-content-types = [
      "image/png",
    ]
  },
  {
    path = "/users/123"
    allowed-content-types = [ ]
  }
]
```

# Default Path Configuration
You have two types of defaults to be aware of:

## The `/**` Root Path

To specify a default configuration that applies to all paths, set the `path` attribute to `/**`. This serves as the 
root of the inheritance tree. All other paths will inherit from this base configuration.

## System Defaults

For any value not defined in the `/**` path or any of its children, Konifer uses a hardcoded system default. 
Consult the Path Configuration Reference (TODO) to determine the system default for each property.

## Example
Storing at `/users/123/profile-picture` will only allow `image/png` but storing at `/blog/123` would only allow `image/png`.

```hocon
path-configuration = [
  {
    path = "/**"
    allowed-content-types = [
      "image/png",
    ]
  }
  {
    path = "/users/**"
    allowed-content-types = [
      "image/png",
    ]
  }
]
```
