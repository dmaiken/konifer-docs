---
sidebar_position: 6
id: url-signing
title: URL Signing
sidebar_label: "URL Signing"
---
URL Signing is a method of ensuring that a request cannot be tampered with. It is _highly_ recommended to require signed URLs
if exposing Konifer publicly to prevent denial-of-service attacks.

Currently URL signing is only utilized when fetching assets. URL signatures cannot be used for storing, deleting, or updating an asset.

## Supported Signing Algorithms
3 HMAC signing algorithms are supported:
- `hmac_sha256` (default)
- `hmac_sha384`
- `hmac_sha512`

## Configuration
To enable URL signing, configure your secret and your algorithm in `konifer.conf`.
```hocon
url-signing {
  enabled = true
  secret-key = secret
  algorithm = hmac_sha512
}
```

## Usage
To sign a request, the entire path, including query modifiers and query parameters must be included in the signature payload.

:::warning
Query parameters **must** be sorted alphabetically by parameter key in the signature payload.
:::

Include the signature as an `s` query parameter in your payload.
```http 
GET /assets/users/123/profile?h=300&blur=20&format=webp&s=f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8
```

If URL-signing is enabled, then all requests missing a signature will return a 403. Invalid signatures will also return a 403.
