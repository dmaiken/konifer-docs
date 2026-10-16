---
sidebar_position: 6
id: concepts-upload-rules
title: Upload Rules
sidebar_label: "Upload Rules"
---

Use upload rules to accept, reject, or label images based on their content.

Configure two pieces:

- `rule-definitions` describe the content to detect.
- `upload-ruleset` assigns definitions to a path and sets the actions for matches.

Konifer uses SigLIP2 to compare each image against a definition's text prompts. A rule matches when its highest prompt
score meets or exceeds its threshold.

:::note
Install the [model files](#installing-model-files) if you configure `rule-definitions` or enable the
[Rule Evaluation API](rule-evaluation.md).
:::

## Rule Definitions

Define rules at the top level of `konifer.conf`. Use lowercase names to match Konifer's normalization of rule references.

```hocon
rule-definitions {
  "blood-and-gore" {
    prompts = [
      "graphic visible blood",
      "open wound with blood",
      "bloody injury scene",
      "gore and severe injury"
    ]
    threshold = 0.72
  }
}
```

Describe visible content: `"open wound with blood"` gives the model more detail than `"unsafe content"`.

## Upload Rulesets

Add an `upload-ruleset` under a path in `paths`:

- Use `default = accept` with `reject-rules` for a deny list.
- Use `default = reject` with `accept-rules` for an allow list.
- Add `modify-rules` to either policy to label matching uploads without changing the accept/reject decision.

This deny list rejects images that match `blood-and-gore`:

```hocon
paths {
  "/public/uploads/**" {
    upload-ruleset {
      default = accept
      reject-rules = [
        {
          rule = "blood-and-gore"
          violation-response = "Upload rejected by content policy"
        }
      ]
    }
  }
}
```

This allow list requires a matching portrait for avatar uploads:

```hocon
rule-definitions {
  "profile-photo" {
    prompts = [
      "a clear portrait photo of one person",
      "a headshot of a person",
      "a face centered in a profile picture"
    ]
    threshold = 0.68
  }
}

paths {
  "/users/*/avatar" {
    upload-ruleset {
      default = reject
      accept-rules = [
        { rule = "profile-photo" }
      ]
    }
  }
}
```

Konifer returns the matched reject rules' `violation-response` messages, joined if several match. Without a custom
response, Konifer returns its default rejection message.

### Labeling Matched Uploads

Use `modify-rules` to add labels to matching assets:

```hocon
rule-definitions {
  "product-photo" {
    prompts = [
      "a product photo on a plain background",
      "a single item photographed for sale",
      "a clean catalog image of a product"
    ]
    threshold = 0.66
  }
}

paths {
  "/catalog/**" {
    upload-ruleset {
      default = accept
      modify-rules = [
        {
          rule = "product-photo"
          labels = {
            "content-type" = "product-photo"
            "classification-source" = "upload-rule"
          }
        }
      ]
    }
  }
}
```

Konifer labels assets that pass the ruleset's accept/reject decision. It combines labels from matched rules with the
upload's labels; rule values override upload values for the same key.

Use distinct keys across label rules. Conflicting rule values depend on evaluation order.

## Prompt Ensembles

A prompt ensemble covers several descriptions of the same content. Konifer uses the highest score, so one broad prompt
can cause false matches.

To write an ensemble:

- Start with a few focused prompts. You can use up to 100 per definition.
- Describe visible content and its common variations. Avoid assumptions about intent or policy labels.
- Write prompts that complete `This is a photo of ...`; Konifer adds this prefix before embedding them.
- Test with matching, non-matching, and borderline images before expanding the ensemble.

For an LLM-generated draft, use a request like this and review the output:

```text
Write 8 image classification prompts for [content category].
Describe visible content and common variations, without policy labels or assumptions about intent.
Each prompt must complete: This is a photo of [prompt].
```

:::note
Konifer caches prompt embeddings. A persistent datastore lets Konifer reuse them across restarts.
:::

## Thresholds

Thresholds are model scores, not confidence percentages. Raise a threshold to reduce false matches; lower it to catch
missed matches. Tune each definition against representative images because score ranges differ by concept.

Use the [Rule Evaluation API](rule-evaluation.md) to test without storing assets or changing active upload rules.
The [Joshua tree example](rule-evaluation.md#example-joshua-tree-detection) includes real images and per-prompt scores.

The thresholds in this guide's configuration examples are illustrative. Validate them against your own images before
using them to accept or reject uploads.

## Installing Model Files

Download the SigLIP2 ONNX model pack with the script in the [Konifer repository](https://github.com/dmaiken/konifer/tree/main/scripts):

```bash
./scripts/download-siglip2-models.sh
```

:::note
Set `HF_TOKEN` for authenticated Hugging Face downloads.
:::

The script creates:

```text
models/siglip2-base-patch16-224/
  vision_model.onnx
  text_model.onnx
  tokenizer.json
```

Mount the generated directory into the Konifer container at the expected path:

```yaml
# docker-compose.yml
volumes:
  - ./models/siglip2-base-patch16-224:/app/models/siglip2-base-patch16-224:ro
```

Pin a Hugging Face revision for reproducible deployments:

```bash
./scripts/download-siglip2-models.sh --revision <hugging-face-revision>
```
