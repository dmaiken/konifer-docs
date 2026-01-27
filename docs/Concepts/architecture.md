---
sidebar_position: 1
id: concepts-architecture
title: Architecture
sidebar_label: "Architecture"
---
# Overview
Konifer leverages a dual-store architecture to manage assets efficiently.

1. **Object Store:** Persists the physical variant content (the binaries). Konifer supports AWS S3 and any S3-compatible provider.
2. **Metadata Store:** Persists relational data, path hierarchies, tags, and labels. Currently, PostgreSQL is the supported engine.

Konifer avoids buffering the entire asset content in memory (not counting `in-memory` object store) as much as
possible to keep memory pressure low.

## Object Store
The object store contains the binary asset content. Konifer supports three object store implementations:
1. in-memory
2. S3 (including S3-compatible providers)
3. Filesystem

Konifer treats the Object Store as a dumb "Key-Value" blob store.

### In-memory
For local development, unit testing, or trying out Konifer without infrastructure dependencies, you can enable in-memory storage implementations.

> ⚠️ Warning: Non-Production Use In-memory implementations are **ephemeral**. All data is lost when the container restarts.
> Additionally, storage capacity is strictly limited by the JVM Heap size. Uploading large files in this mode may cause
> `OutOfMemoryError` crashes.

### S3
Konifer supports any S3 provider in addition to Amazon S3. This enables the usage of local storage options like [MiniIO](https://www.min.io/) 
and the growing number of storage providers that provide S3-compatible APIs. 

### Filesystem
By mounting a volume to the Docker container, Konifer can store assets on any filesystem.

## Metadata Store
Konifer uses Postgres to manage asset metadata. This is done because relying on Object Store metadata is slow and inflexible. 
Konifer leverages the [Ltree](https://www.postgresql.org/docs/current/ltree.html) extension and is required to be enabled on the 
configured Postgres database.

> ⚠️ Warning: The Ltree extension must be enabled within Postgres. Enabling extensions generally requires superuser privileges.

## Temporary Files
In order to keep memory pressure low when storing assets and generating variants, temporary files are used extensively.
It is recommended to leverage a local disk source like [AWS Instance Storage](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/InstanceStorage.html) 
and not external storage like [AWS EBS](https://aws.amazon.com/ebs/) for performant IO. Temporary data is deleted as soon as possible.
