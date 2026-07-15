---
sidebar_position: 6
id: concepts-upload-rules
title: Upload Rules
sidebar_label: "Upload Rules"
---

Upload rules let Konifer accept or reject uploads by comparing image content against text prompts. They are useful when a
path should only receive a narrow class of images, or when a path should reject images that match an unwanted content
category.

Upload rules are built from two configuration pieces:

- `rule-definitions` define what Konifer should look for in the uploaded image.
- `upload-ruleset` selects which definitions apply to a path and whether matching definitions accept or reject the
  upload.

Konifer evaluates rules with a SigLIP2 zero-shot image classification model. Each rule definition has one or more text
prompts and a threshold. Konifer embeds the uploaded image, compares it to each prompt in the rule definition, and uses
the highest prompt score. The rule matches when that score is greater than or equal to the rule's threshold.

:::note
The SigLIP2 model files are only required when `rule-definitions` is populated. If no rule definitions are configured,
Konifer does not initialize upload rule model inference.
:::

## Rule Definitions

Rule definitions are global. They live at the top level of `konifer.conf` and are keyed by rule name. Use lowercase
rule definition keys because upload rule references are normalized to lowercase.

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

A good rule definition should describe the visual evidence you want the model to detect. Prefer concrete image
descriptions over policy language. For example, prompts like `"graphic visible blood"` and `"open wound with blood"` are
usually more useful than `"unsafe content"`.

## Upload Rulesets

Upload rulesets are path configuration. They live under a path entry in `paths` and decide how matched rules affect the
upload.

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

There are two common patterns:

- Deny list: set `default = accept` and add `reject-rules`. Uploads pass unless they match a reject rule.
- Allow list: set `default = reject` and add `accept-rules`. Uploads fail unless they match an accept rule.

For example, an avatar path can require human portrait-like uploads:

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

If an upload is rejected and the matched reject rule has a `violation-response`, Konifer returns that message. If several
reject rules match, their responses are joined together. When no response is configured, Konifer uses the default upload
rules rejection message.

## Prompt Ensembles

A prompt ensemble is a set of related prompts for the same rule definition. Ensembles make rules less dependent on a
single wording. Konifer scores each prompt and uses the highest score for that rule.

When creating an ensemble:

- Start with 4 to 12 prompts for most rules, then expand if testing shows the model is missing important variations.
- Use up to 100 prompts when a rule needs broad coverage, but keep the set focused because Konifer uses the highest
  scoring prompt for the rule.
- Describe visible content, not intent or policy categories.
- Mix short labels with natural descriptions.
- Include common variants of the same concept.
- Avoid prompts that are broader than the rule you intend to enforce.
- Start with a conservative threshold, test with representative uploads, and adjust from real results.
- Prompts must complete the phrase: This is a photo of ...

You can ask an LLM to draft a prompt ensemble. Keep the prompt focused on visual descriptions and review the result
before using it:

```text
Create a zero-shot image classification prompt ensemble containing up to [x] prompts for detecting [content category].
Return 8 concise prompts. Each prompt should describe visible image content only.
Avoid policy wording, legal labels, or assumptions about intent.
Include common visual variations and exclude unrelated concepts.
Prompts must complete the phrase: This is a photo of [prompt].
```

Example prompt ensembles:

```hocon
rule-definitions {
  "blood-and-gore" {
    prompts = [
      "graphic visible blood",
      "bloody injury",
      "open wound with blood",
      "severe injury with exposed tissue",
      "gore in an image",
      "blood splatter on a person",
      "medical trauma with visible blood",
      "violent bloody scene"
    ]
    threshold = 0.72
  }

  "product-photo" {
    prompts = [
      "a product photo on a plain background",
      "an ecommerce product image",
      "a single item photographed for sale",
      "a clean catalog image of a product",
      "a centered object on a simple background",
      "a studio photo of merchandise"
    ]
    threshold = 0.66
  }

  "documents" {
    prompts = [
      "a scanned document",
      "a page of printed text",
      "a form or receipt",
      "a screenshot of a document",
      "paper document with readable text",
      "an invoice or statement"
    ]
    threshold = 0.67
  }
}
```

:::note
Konifer caches text prompt embeddings after they are computed. Large prompt ensembles can add startup time the first time
Konifer sees them, but cached embeddings make later startups faster when using a persistent datastore.
:::

## Thresholds

Thresholds are model scores, not percentages. Higher values are stricter and may miss borderline matches. Lower values
catch more possible matches but may reject unrelated uploads. Tune each rule separately because some concepts are easier
for the model to identify than others.

## Installing Model Files

Upload rules use the SigLIP2 ONNX model pack. Download it from the [Konifer repository](https://github.com/dmaiken/konifer/tree/main/scripts):

```bash
./scripts/download-siglip2-models.sh
```

:::note
`HF_TOKEN` is respected by the script and can be provided for faster downloads from Hugging Face. 
:::

By default, this creates:

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

For reproducible deployments, use a pinned Hugging Face revision when downloading the model pack:

```bash
./scripts/download-siglip2-models.sh --revision <hugging-face-revision>
```

Konifer expects these files to exist at runtime (if `rule-definitions` are configured):

```text
/app/models/siglip2-base-patch16-224/vision_model.onnx
/app/models/siglip2-base-patch16-224/text_model.onnx
/app/models/siglip2-base-patch16-224/tokenizer.json
```
