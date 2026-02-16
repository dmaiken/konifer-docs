---
sidebar_position: 2
id: getting-started
title: Getting Started with Konifer
sidebar_label: "Getting Started"
---
## Docker
Konifer is deployed exclusively via Docker. Due to the precise configuration required for the underlying libvips binary, 
we do not provide standalone JARs or binary releases.

## Requirements
Konifer requires the following to start:
1. **Container Runtime:** A functional installation of Docker or any OCI-compatible runtime
2. **Database:** A running database instance, such as PostgreSQL (required for production use or depending on the specified configuration).
3. **Object Store:** Access to an S3 API-compatible object store (e.g., AWS S3, Cloudflare R2, MinIO, etc.). 
The filesystem is also a supported option as long as it can be mounted to container at runtime.
4. **Configuration:** A configuration file named `konifer.conf` using HOCON syntax.

:::tip
HOCON is not as scary as it sounds. It is a superset of JSON and there is a [complete reference](Reference/configuration-reference.md) 
of all properties used within Konifer. Do not be afraid!
:::

## Development mode
Konifer can start up using an in-memory object store and/or metadata store for development use. In-memory configuration
is NOT recommended for production use since anything stored in-memory is ephemeral and could result in excessive memory usage.

## Running Konifer Container
1. Create a `konifer.conf` file and enable in-memory storage modes.

```hocon
data-store {
  provider = in-memory
}

object-store {
  provider = in-memory
}
```

2. Run the container, exposing the service on port 8080 (or any port you want) using this command:
```bash
docker run -d \
  --name konifer \
  -p 8080:8080 \
  -v /path/to/your/konifer.conf:/app/config/konifer.conf \
  ghcr.io/dmaiken/konifer:0.1.0
```

## Store an Asset
Use this curl (Insomnia/Bruno examples coming!) to store your first asset.

```curl
curl --request POST \
  --url 'http://localhost:8080/assets/my-images/' \
  --header 'Content-Type: multipart/form-data' \
  --form 'metadata={"alt":"moon"}' \
  --form file=/path/to/your/image.png
```

## Fetch a Variant
Use this curl to fetch the content of your asset
```curl
curl --request GET \
  --url 'http://localhost:8080/assets/my-images/-/content' \
```

### Generate Variants
Requesting a variant will generate and store the variant on-demand if one does not exist already.

#### Sepia Example
```curl
curl --request GET \
  --url 'http://localhost:8080/assets/my-images/-/content?filter=sepia' \
```

#### Blur Example
```curl
curl --request GET \
  --url 'http://localhost:8080/assets/my-images/-/content?blur=100' \
```

### Fetch Redirect
Fetch your variant as a redirect to your CDN.

Add this to `konifer.conf` and restart your container:
```hocon
paths = [
  {
    path = "/**"
    return-format {
      redirect {
        strategy = template
        template {
          string = "https://mycdn.com/{bucket}/{key}"
        }
      }
    }
  }
]
```

Now specify the redirect selector:
```curl
```curl
curl --request GET \
  --url 'http://localhost:8080/assets/my-images/-/redirect?blur=100' \
```

### Metadata
View metadata of the asset as well.

```curl
```curl
curl --request GET \
  --url 'http://localhost:8080/assets/my-images/-/metadata' \
```

### Labels and Tags
Update the asset to add labels and tags using PUT.

```curl 
curl --request PUT \
  --url http://localhost:8080/assets/my-images/-/entry/0 \
  --header 'Content-Type: application/json' \
  --data '{
	"alt": "a friendly alt",
	"labels": {
		"phone": "iphone",
		"signedAt": "2026-01-01",
		"koniferIsAwesome": "true"
	},
	"tags": [
		"hot", "innovative", "productionReady"
	]
}
'
```

## Libvips
Konifer's container comes with an installation of [libvips](https://www.libvips.org/) optimized for use with Konifer. Optimal hardware configuration 
is dependent on your specific use-case, but libvips generally exhibits near-linear scaling with respect to available 
CPU cores and performance benefits significantly from increased memory.
