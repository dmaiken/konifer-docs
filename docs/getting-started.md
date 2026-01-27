---
sidebar_position: 2
id: getting-started
title: Getting Started with Konifer
sidebar_label: "Getting Started"
---
# Docker
Konifer is deployed exclusively via Docker. Due to the precise configuration required for the underlying libvips binary, 
we do not provide standalone JARs or binary releases.

# Requirements
Konifer requires the following to start:
1. **Container Runtime:** A functional installation of Docker or any OCI-compatible runtime
2. **Database:** A running database instance, such as PostgreSQL (required for production use or depending on the specified configuration).
3. **Object Store:** Access to an S3 API-compatible object store (e.g., AWS S3, Cloudflare R2, MinIO, etc.). 
The filesystem is also a supported option as long as it can be mounted to container at runtime.
4. **Configuration:** A configuration file named `konifer.conf` using HOCON syntax.

# Development mode
Konifer can start up using an in-memory object store and/or metadata store for development use. In-memory configuration
is NOT recommended for production use since anything stored in-memory is ephemeral and could result in excessive memory usage.

# Running Konifer container
1. Create a `konifer.conf` file. More on Konifer configuration in Configuration (TODO).
2. Run the container, exposing the service on port 8080 (or any port you want) using this command:
```bash
docker run -d \
  --name konifer \
  -p 8080:8080 \
  -v /path/to/your/konifer.conf:/konifer.conf \
  your-registry/konifer:latest
```

# Libvips
Konifer's container comes with an installation of [libvips](https://www.libvips.org/) optimized for use with Konifer. Optimal hardware configuration 
is dependent on your specific use-case, but libvips generally exhibits near-linear scaling with respect to available 
CPU cores and performance benefits significantly from increased memory.
