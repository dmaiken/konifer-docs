---
sidebar_position: 2
title: Configure Health Probes
description: Configure liveness and readiness probes for a Konifer deployment.
---

Konifer exposes separate endpoints for liveness and readiness:

| Probe     | Endpoint            | Use                                                                                    |
|:----------|:--------------------|:---------------------------------------------------------------------------------------|
| Liveness  | `GET /health/live`  | Restart an instance that cannot serve HTTP requests.                                   |
| Readiness | `GET /health/ready` | Remove an instance from traffic until Konifer and its dependencies can serve requests. |

Use both probes in an orchestrated deployment. A dependency outage should make an instance unready without triggering
a restart loop.

## Kubernetes configuration

The following configuration uses the container's HTTP port:

```yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 8080
  periodSeconds: 10
  timeoutSeconds: 1
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /health/ready
    port: 8080
  periodSeconds: 5
  timeoutSeconds: 1
  failureThreshold: 2
```

Adjust the periods and failure thresholds to match your platform's rollout and traffic-management behavior. Konifer
returns both responses with an empty body, so the probe client only needs to inspect the HTTP status.

## Liveness behavior

The liveness endpoint returns `200 OK` when Konifer's HTTP server can handle the request. It does not query PostgreSQL,
S3, or filesystem storage.

## Readiness behavior

The readiness endpoint returns `200 OK` when every registered health indicator reports healthy. It returns
`503 Service Unavailable` when any indicator reports unhealthy.

Konifer checks these components:

| Component               | Check                                                                 |
|:------------------------|:----------------------------------------------------------------------|
| Application lifecycle   | The Konifer application has started and is not stopping.              |
| PostgreSQL              | Executes `SELECT 1`.                                                  |
| In-memory data store    | Reports healthy without an external check.                            |
| S3 object store         | Sends `HeadBucket` for the effective default bucket.                  |
| Filesystem object store | Confirms that the mount path exists, is a directory, and is writable. |
| In-memory object store  | Reports healthy without an external check.                            |

The S3 check covers the default bucket resolved for `/`. It does not enumerate buckets assigned to specific path
configurations. Create and validate every configured bucket as part of deployment.

PostgreSQL and object-store checks run in the background every five seconds with a two-second timeout. Readiness
requests read this cached result. A new instance remains unready until its first checks succeed, and a dependency
change may take up to one refresh interval to appear.

Konifer logs a warning when a cached indicator first becomes unhealthy and an informational message when it recovers.

See the [Health API reference](../reference/health-api.md) for the API reference.
