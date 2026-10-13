---
sidebar_position: 4
id: openapi
slug: /reference/openapi
title: OpenAPI
sidebar_label: "OpenAPI"
description: Access Konifer's Swagger UI and generated OpenAPI specification.
---

Konifer serves API documentation from the running service. Open `http://localhost:8080/api/docs` in your browser to
use Swagger UI, or download the generated specification at `/api/docs/openapi.json`.

| Method | Path                     | Response                     |
| :----- | :----------------------- | :--------------------------- |
| `GET`  | `/api/docs`              | Swagger UI (HTML)            |
| `GET`  | `/api/docs/openapi.json` | OpenAPI specification (JSON) |

These routes require no request body or configuration flag. Konifer registers them at startup.

## Download the specification

```bash
curl --fail-with-body \
  --output openapi.json \
  'http://localhost:8080/api/docs/openapi.json'
```

Use this JSON document in an OpenAPI viewer or tooling that imports API specifications. Download it from the Konifer
instance you use so the document reflects that server's implementation.

## Asset operations

The specification represents asset routes as `/assets/{**}`. Replace `**` with your asset path and selectors,
such as `users/123/profile-picture/-/content`. See the [Fetch Assets reference](assets/fetch-assets.mdx) for
selector examples.
