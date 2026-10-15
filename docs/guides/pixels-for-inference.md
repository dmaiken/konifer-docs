---
sidebar_position: 3
id: guides-pixels-for-inference
title: Prepare Pixels for Inference with Variant Profiles
sidebar_label: "Pixels for Inference"
description: Define a pixel profile, construct a Python tensor, and classify an image with a pretrained ViT model.
---

## Objective

This guide demonstrates how named variant profiles prepare a photograph for display and inference. A display client
requests a WebP preview, while a Python worker requests raw pixels from the same image version and classifies them
with a pretrained ViT model.

The worker uses the pretrained [Google ViT base model](https://huggingface.co/google/vit-base-patch16-224) to rank
1,000 ImageNet categories. The example runs on a CPU and requires no model training.

## Prerequisites

- Docker and curl.
- Python 3.10 or newer, with support for virtual environments.
- A photograph of a recognizable object or animal.
- Internet access to install Python packages and download the model weights.

Run the commands from a directory where you can create `konifer.conf`, `classify.py`, and a Python virtual environment.
This guide uses an isolated Konifer container with in-memory storage; stopping it discards its assets and variants.

## 1. Define the variant profiles

Create `konifer.conf` with two profiles: `preview` for a reviewer and `vision-224-v1` for the inference worker.

```hocon title="konifer.conf"
variant-profiles {
  preview {
    format = webp
    w = 512
    h = 512
    fit = fit # Resize to fit inside 512x512 but retain aspect ratio
    r = auto # auto-rotate 
    cs = srgb # normalize colorspace (important if your image came from an iphone, for example)
  }

  vision-224-v1 {
    format = pixels
    w = 224
    h = 224
    fit = stretch # Force image into box and break aspect ratio. Rectangular images will get squashed.
    r = auto
    cs = srgb
    pixel-channels = RGB
    pixel-layout = planar # Pixel layout will look like: RRRRRGGGGGGBBBBB 
  }
}

paths {
  "/products/**" {
    transform {
      on-demand-variant {
        mode = profile_only
      }
    }
  }
}
```

With `profile_only`, Konifer rejects transformation overrides on `/products/**`. Consumers choose a profile name,
and the deployment configuration defines its resize, color, and layout settings. See
[Variant Profiles](../concepts/Variants/variant-profiles.md).

:::note
Konifer uses Lanczos3 resampling and shrink-on-load when possible. This differs from the checkpoint's reference
processor, which uses _bilinear_ resizing. The worker below applies the checkpoint's scaling and normalization, but
the image samples and predictions can differ from the reference pipeline. Evaluate accuracy on representative images
before adopting this preprocessing for your workload.
See the [ViT processor source](https://github.com/huggingface/transformers/blob/main/src/transformers/models/vit/image_processing_vit.py).
:::

## 2. Start Konifer

Mount your configuration and enable in-memory dependencies:

```bash
docker run --detach \
  --rm \
  --name konifer-inference-guide \
  --publish 8080:8080 \
  --env IN_MEMORY=true \
  --mount type=bind,source="$PWD/konifer.conf",target=/app/config/konifer.conf,readonly \
  ghcr.io/dmaiken/konifer:{{koniferVersion}}
```

Wait for readiness:

```bash
curl --fail \
  --retry 10 \
  --retry-connrefused \
  --retry-delay 1 \
  'http://localhost:8080/health/ready'
```

## 3. Upload a photograph

Upload an encoded photograph, replacing the local file path:

```bash
curl --fail-with-body \
  --request POST \
  --url 'http://localhost:8080/assets/products/example/photo' \
  --form 'metadata={"alt":"photograph for classification"}' \
  --form 'asset=@/path/to/your/photo.jpg'
```

Note the returned `entryId`. In a fresh container, it is `0`. Replace `0` in the commands below if your upload
returns another ID.

## 4. Fetch a display preview

Request the `preview` profile and open the saved file in an image viewer (or use a browser to visit the URL):

```bash
curl --fail-with-body \
  --output preview.webp \
  --url 'http://localhost:8080/assets/products/example/photo/-/entry/0/content?profile=preview'
```

Konifer retains the original photograph and generates the preview as a separate variant.

## 5. Install the Python dependencies

Create and activate a virtual environment. These commands use a POSIX shell:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install torch --index-url https://download.pytorch.org/whl/cpu
python -m pip install numpy requests transformers
```

The PyTorch command installs a CPU build. For a platform without a compatible wheel, use the
[PyTorch installation selector](https://pytorch.org/get-started/locally/) to choose an installation command.
The example has been tested with Python 3.12, PyTorch 2.14.1, and Transformers 5.19.0 on a CPU.

## 6. Fetch pixels and run inference

Save the following as `classify.py`:

```python title="classify.py"
import argparse

import numpy as np
import requests
import torch
from transformers import AutoModelForImageClassification


MODEL_ID = "google/vit-base-patch16-224"
PROFILE = "vision-224-v1"


def fetch_tensor(base_url, entry_id):
    url = (
        f"{base_url.rstrip('/')}/assets/products/example/photo"
        f"/-/entry/{entry_id}/content"
    )
    response = requests.get(url, params={"profile": PROFILE}, timeout=60)
    response.raise_for_status()

    expected = {
        "Content-Type": "application/octet-stream",
        "K-Attr-Format": "pixels",
        "K-Attr-Color-Space": "srgb",
        "K-Attr-Pixels-Channels": "rgb",
        "K-Attr-Pixels-Layout": "planar",
        "K-Attr-Pixels-Data-Type": "uint8",
        "K-Attr-Rotate": "0",
        "K-Attr-Horizontal-Flip": "false",
    }
    for name, value in expected.items():
        actual = response.headers.get(name, "").split(";", 1)[0].strip().lower()
        if actual != value:
            raise ValueError(f"Expected {name}={value}, received {actual!r}")

    width = int(response.headers["K-Attr-Width"])
    height = int(response.headers["K-Attr-Height"])
    if (width, height) != (224, 224):
        raise ValueError(f"Expected 224x224 pixels, received {width}x{height}")
    if len(response.content) != 3 * height * width:
        raise ValueError("Pixel buffer size does not match its attributes")

    print(f"Pixel variant cache: {response.headers.get('K-Cache-Status', 'unknown')}")

    # Interpret packed uint8 samples as channels x height x width.
    pixels = np.frombuffer(response.content, dtype=np.uint8)
    pixels = pixels.reshape(3, height, width)

    # Allocate writable float32 samples and scale from [0, 255] to [0, 1].
    image = torch.from_numpy(pixels.astype(np.float32)) / 255.0

    # This checkpoint uses mean=0.5 and std=0.5 for each RGB channel.
    image = (image - 0.5) / 0.5
    return image.unsqueeze(0)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("entry_id", type=int)
    parser.add_argument("--base-url", default="http://localhost:8080")
    args = parser.parse_args()

    batch = fetch_tensor(args.base_url, args.entry_id)
    print(f"Input: shape={tuple(batch.shape)}, dtype={batch.dtype}")

    model = AutoModelForImageClassification.from_pretrained(MODEL_ID).eval()
    with torch.inference_mode():
        probabilities = model(pixel_values=batch).logits[0].softmax(dim=0)

    scores, indices = probabilities.topk(5)
    for score, index in zip(scores.tolist(), indices.tolist()):
        print(f"{model.config.id2label[index]}: {score:.3f}")


if __name__ == "__main__":
    main()
```

Run the script with the upload's entry ID:

```bash
python classify.py 0
```

On the first run, the script downloads the pretrained weights to the Hugging Face cache. Subsequent runs reuse those files.
The script prints the pixel cache status, input shape, and five category names with their model scores. The labels depend
on your photograph; they describe the model's ranking among its ImageNet categories.

The input line should read:

```text
Input: shape=(1, 3, 224, 224), dtype=torch.float32
```

The worker fetches bytes and attributes together through `/content`. The raw body has no embedded dimensions or image header,
so the worker validates the HTTP headers before constructing a tensor. This profile produces 150,528 bytes:
224 × 224 × 3 unsigned 8-bit samples. See [Raw Pixels](../concepts/pixels.md) for the buffer contract.

The worker uses NumPy to interpret the buffer, then allocates floating-point samples for PyTorch. With planar RGB,
the buffer has shape `[3, 224, 224]`. After scaling and normalization, the worker adds a batch dimension to get
`[1, 3, 224, 224]`.
The worker performs no image decoding or resizing. The normalization follows the
[checkpoint configuration](https://huggingface.co/google/vit-base-patch16-224/blob/main/preprocessor_config.json).

## 7. Reuse the profile and cached variant

Run `python classify.py 0` again. The script should print `Pixel variant cache: hit` after the first successful fetch.
Konifer returns the cached pixel variant for the same entry and profile settings. The worker still downloads the
pixel bytes and runs the model; caching avoids repeating the image transformation in Konifer. See
[Variant Caching](../concepts/Variants/caching.md).

Consumers can request `vision-224-v1` for other photographs under `/products/**` without copying transformation
parameters into each request. For a new input recipe, define a new profile name such as `vision-224-v2` and update
the worker that consumes it. Konifer caches variants by their transformation settings. The profile is merely a
shortcut for transformation settings.

To prepare pixels at upload time, add `eager-variants` under the existing path's `transform` block:

```hocon
paths {
  "/products/**" {
    transform {
      eager-variants = [vision-224-v1]
      on-demand-variant {
        mode = profile_only
      }
    }
  }
}
```

See [Eager Variant Generation](../concepts/Variants/overview.md#eager-variant-generation) for generation behavior.
Konifer attempts eager generation in the background after upload; a worker can request the profile before generation
finishes and let Konifer generate it on demand.

## Using the pixels with SigLIP2

The `vision-224-v1` profile and `fetch_tensor` function also prepare image inputs for
[`google/siglip2-base-patch16-224`](https://huggingface.co/google/siglip2-base-patch16-224), the fixed-resolution
SigLIP2 checkpoint used by [Upload Rules](../concepts/upload-rules.md). Its image inputs use the same square
dimensions, RGB channels, scaling, and normalization. See its
[processor configuration](https://huggingface.co/google/siglip2-base-patch16-224/blob/main/preprocessor_config.json).

Replace the model invocation and output handling for SigLIP2. Zero-shot classification requires tokenized text
prompts alongside the image tensor; image embedding extraction uses the vision encoder. Changing the model ID
alone in this script will not perform those tasks. See the
[SigLIP2 examples](https://huggingface.co/docs/transformers/model_doc/siglip2).

The resampling caveat applies to both checkpoints. SigLIP2 checkpoints with other resolutions or NaFlex inputs need
different preparation.

## Clean up

Stop the guide's container:

```bash
docker stop konifer-inference-guide
```

Docker removes the container after it stops, discarding the in-memory assets and cached variants. Leave the virtual
environment with `deactivate`.

## Next steps

For a persistent deployment, see [Deploying Konifer](../operate/deployment.md). For a path with an `allowed-content-types`
list, include `application/octet-stream` for pixel variants alongside the encoded input
and display formats.

For a production workload, compare task accuracy with the checkpoint's reference processor on a labeled evaluation
set. Measure image preparation, transfer, and inference costs for your deployment: raw pixels avoid worker-side
decoding but can take more bandwidth than compressed images.
