---
sidebar_position: 2
id: getting-started
title: Getting Started with Direkt
sidebar_label: "Getting Started"
---
# Docker
Direkt is deployed **exclusively via Docker**. Due to the precise configuration required for the underlying libvips processor, we do not provide standalone JAR or binary releases.

# Requirements
Direkt requires the following to start:
1. **Container Runtime:** A functional installation of Docker or any OCI-compatible runtime
2. **Database:** A running database instance, such as PostgreSQL (required for production use or depending on the specified configuration).
3. **Object Store:** Access to an S3 API-compatible object store (e.g., AWS S3, Cloudflare R2, MinIO, etc.). The filesystem is also a supported option.
4. **Configuration:** A configuration file named `direkt.conf` using HOCON syntax.

# Development mode
Direkt can start up using an in-memory object store and/or metadata store for development use. In-memory configuration
is NOT recommended for production use since anything stored in-memory is ephemeral and could result in excessive memory usage.

# Running Direkt container
1. Create a `direkt.conf` file. More on Direkt configuration in Configuration (TODO).
2. Run the container, exposing the service on port 8080 (or any port you want) using this command:
```bash
docker run -d \
  --name direkt \
  -p 8080:8080 \
  -v /path/to/your/direkt.conf:/direkt.conf \
  your-registry/direkt:latest
```

# Libvips
Direkt's container comes with an installation of libvips optimized for use with Direkt. Optimal hardware configuration 
is dependent on your specific use-case, but libvips generally exhibits near-linear scaling with respect to available 
CPU cores and performance benefits significantly from increased memory.
