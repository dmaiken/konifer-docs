---
sidebar_position: 7
id: health-api
title: Health API
sidebar_label: "Health API"
description: HTTP reference for Konifer liveness and readiness endpoints.
---

Konifer exposes two unauthenticated health endpoints.

Both endpoints accept `GET` requests without a request body, query parameters, or required headers. Responses have an
empty body.

## Liveness

```http
GET /health/live HTTP/1.1
Host: images.example.com
```

### Response

```http
HTTP/1.1 200 OK
Content-Length: 0
```

| Status   | Meaning                                         |
|:---------|:------------------------------------------------|
| `200 OK` | The Konifer HTTP process can serve the request. |

The endpoint does not query the data store or object store. When the process cannot serve HTTP, the caller receives a
connection error or timeout instead of an application-generated response.

## Readiness

```http
GET /health/ready HTTP/1.1
Host: images.example.com
```

### Healthy response

```http
HTTP/1.1 200 OK
Content-Length: 0
```

### Unhealthy response

```http
HTTP/1.1 503 Service Unavailable
Content-Length: 0
```

| Status                    | Meaning                                                                 |
|:--------------------------|:------------------------------------------------------------------------|
| `200 OK`                  | The application lifecycle, data store, and object store report healthy. |
| `503 Service Unavailable` | At least one readiness indicator reports unhealthy.                     |

Dependency checks run in the background, and this endpoint returns their cached result. See
[Configure health probes](../operate/health-checks.md) for the checks, refresh timing, and orchestrator guidance.
