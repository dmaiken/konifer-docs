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

## Supplying Images

The API accepts either an image URL in a JSON request or image bytes in a multipart request. URL sources must use a host
listed in `source.url.allowed-domains`. URL downloads and multipart uploads also use their respective `source` size
limits.

Up to 10 definitions can be evaluated in one request, with up to 100 prompts in each definition. Konifer embeds the
image once and evaluates all supplied definitions against that embedding.

See the [Rule Evaluation API reference](../reference/rule-evaluation-api/evaluate-rules.md) for request and response
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
