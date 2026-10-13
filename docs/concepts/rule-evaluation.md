---
sidebar_position: 7
id: concepts-rule-evaluation
title: Rule Evaluation
sidebar_label: "Rule Evaluation"
---

Rule evaluation compares an image with one or more natural-language rule definitions. It returns the score for each
prompt, the highest score for each definition, and whether that score meets the definition's threshold.

The Rule Evaluation API is useful for two related workflows:

- Test and tune rule definitions against representative images before adding them to an
  [upload ruleset](upload-rules.md).
- Classify images directly without storing them as Konifer assets.

Evaluating an image does not store the image, create an asset, or apply an upload ruleset. The definitions in the request
are evaluated directly and do not need to exist in the global `rule-definitions` configuration.

## How Evaluation Works

Konifer uses the same SigLIP2 zero-shot image classification model for the Rule Evaluation API and Upload Rules. For
each definition, Konifer:

1. Embeds the supplied image.
2. Compares the image with every prompt in the definition.
3. Uses the highest prompt score as the definition's overall score.
4. Sets `matched` to `true` when the overall score is greater than or equal to the definition's threshold.

Because the two features share the same model and matching behavior, a definition can be tested through the API and
then copied into `rule-definitions` without changing its prompts or threshold.

:::note
Scores are model scores, not confidence percentages. Compare results across representative matching and non-matching
images rather than treating a score as a probability.
:::

## Tuning a Rule Definition

Start with a small, focused prompt ensemble and a conservative threshold. Evaluate it against images that should match,
images that should not match, and difficult borderline examples. The per-prompt scores show which wording contributes to
the overall result.

As you review the results:

- Remove prompts that score highly for unrelated images.
- Add concrete visual variations that the rule misses.
- Raise the threshold to reduce false matches.
- Lower the threshold to reduce missed matches.
- Tune each definition independently because different visual concepts produce different score ranges.

For guidance on writing prompt ensembles, see [Prompt Ensembles](upload-rules.md#prompt-ensembles).

### Example: Joshua Tree Detection

Define a `joshua-tree` rule with three prompts and a threshold of `0.7`. Save this request metadata as
`joshua-tree-definition.json`:

```json
{
  "definitions": [
    {
      "name": "joshua-tree",
      "prompts": [
        "a joshua tree",
        "a tree",
        "joshua tree national park"
      ],
      "threshold": 0.7
    }
  ]
}
```

Download the photo using the link below and save it as `joshua-tree-original.jpg` in the same folder, then evaluate it.
The `<` form syntax reads the metadata file as a text field:

```bash
curl --fail-with-body \
  --request POST \
  'http://localhost:8080/rule-evaluations' \
  --form 'metadata=<joshua-tree-definition.json;type=application/json' \
  --form 'asset=@joshua-tree-original.jpg;type=image/jpeg'
```

Repeat the request with the squirrel photo to compare a non-matching image against the same definition.
Konifer returned these results from the configured SigLIP2 model, rounded to six decimal places:

<div className="doc-images doc-images--comparison">
  <figure className="doc-image">
    <img src="/image-examples/rule-evaluation/joshua-tree-original.jpg"
      alt="Joshua tree with spiky leaves among desert rocks beneath a cloudy sky"
      width="800" height="602" loading="lazy" decoding="async" />
    <figcaption>
      <a href="/image-examples/rule-evaluation/joshua-tree-original.jpg" download="joshua-tree-original.jpg">
        Joshua tree photo
      </a>
      · Score 0.956054 · Matched
    </figcaption>
  </figure>
  <figure className="doc-image">
    <img src="/image-transformations/sources/squirrel-original.jpg" alt="Squirrel resting on a branch beside a tree trunk"
      width="1536" height="1024" loading="lazy" decoding="async" />
    <figcaption>
      <a href="/image-transformations/sources/squirrel-original.jpg" download="squirrel-original.jpg">Squirrel photo</a>
      · Score 0.000534 · No match
    </figcaption>
  </figure>
</div>

| Prompt                       | Joshua tree score | Squirrel score |
|:-----------------------------|:------------------|:---------------|
| `a joshua tree`              | 0.956054          | 0.000012       |
| `a tree`                     | 0.016330          | 0.000534       |
| `joshua tree national park`  | 0.844172          | 0.000014       |

Konifer uses each image's highest prompt score. The Joshua tree photo exceeds `0.7`, so `matched` is `true`. The squirrel
photo falls below it, so `matched` is `false`. Inspect the full responses for the
[Joshua tree](/image-examples/rule-evaluation/joshua-tree-joshua-tree-response.json) and
[squirrel](/image-examples/rule-evaluation/squirrel-joshua-tree-response.json).

The specific prompts score higher for the Joshua tree photo than the broad `a tree` prompt. Test each prompt against
representative images; related descriptions can produce different scores. Raising the threshold above `0.95605449`
would miss this tree photo without changing its score. Validate your threshold on more images before using it in an
[upload ruleset](upload-rules.md), which applies match decisions to uploads.

## Supplying Images

The API accepts an image URL or S3 object ARN in a JSON request, or image bytes in a multipart request. URL sources
must use a host listed in `source.url.allowed-domains`; S3 sources require server credentials with read access.
External downloads and multipart uploads also use their respective `source` size limits.

Up to 10 definitions can be evaluated in one request, with up to 100 prompts in each definition. Konifer embeds the
image once and evaluates all supplied definitions against that embedding.

See the [Rule Evaluation API reference](../reference/api/rule-evaluation.mdx) for request and response
formats.

## Enabling the API

The Rule Evaluation API is disabled by default and must be enabled explicitly:

```hocon
api {
  rule-evaluation {
    enabled = true
  }
}
```

Enabling the API initializes rule inference even when no global `rule-definitions` are configured. The SigLIP2 model
files must therefore be installed and mounted into the Konifer container. Follow the
[model installation instructions](upload-rules.md#installing-model-files), then restart Konifer after changing the
configuration.

:::caution
Rule evaluation performs model inference and can consume significant CPU and memory. Enable and expose this endpoint
only when clients using it are trusted or separately protected by your deployment.
:::
