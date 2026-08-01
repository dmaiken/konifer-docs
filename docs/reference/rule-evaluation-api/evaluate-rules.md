---
sidebar_position: 1
id: rule-evaluation-api
title: Evaluate Rules
sidebar_label: "Evaluate"
---

The Rule Evaluation API evaluates one or more rule definitions against a single image. It returns an overall score and
match decision for each definition, along with the score produced by every prompt.

```http
POST /rule-evaluations
```

The endpoint must be [enabled in configuration](../configuration-reference.md#api). When it is disabled, the route is
not registered and returns `404 Not Found`.

## Request Definitions

Both URL and multipart requests use the same definition structure:

```json
{
  "definitions": [
    {
      "name": "outdoor-landscape",
      "prompts": [
        "a mountain landscape",
        "a forest landscape",
        "an outdoor landscape"
      ],
      "threshold": 0.7
    }
  ]
}
```

| Field Name                | Type   | Description                                                 | Required | Constraints                         |
|---------------------------|--------|-------------------------------------------------------------|----------|-------------------------------------|
| `definitions`             | Array  | Rule definitions to evaluate against the supplied image.    | Yes      | 1-10 definitions                    |
| `definitions[].name`      | String | Name used to identify the definition in the response.       | Yes      | Non-blank; maximum 32 characters    |
| `definitions[].prompts`   | Array  | Visual descriptions compared with the image.                | Yes      | 1-100 distinct, non-blank strings   |
| `definitions[].threshold` | Number | Minimum overall score required for the definition to match. | Yes      | From `0.0` through `1.0`, inclusive |

Each prompt can contain up to 256 characters. Names and prompts are normalized to lowercase; prompts are also trimmed.

## Evaluate an Image From a URL

Send an `application/json` request and include the image `url`:

```http
POST /rule-evaluations HTTP/1.1
Content-Type: application/json

{
  "url": "https://images.example.com/landscape.jpg",
  "definitions": [
    {
      "name": "outdoor-landscape",
      "prompts": [
        "a mountain landscape",
        "a forest landscape",
        "an outdoor landscape"
      ],
      "threshold": 0.7
    }
  ]
}
```

| Field Name | Type   | Description                                      | Required |
|------------|--------|--------------------------------------------------|----------|
| `url`      | String | URL of the image to download and evaluate.       | Yes      |

The URL host must be present in `source.url.allowed-domains`, and the downloaded content cannot exceed
`source.url.max-bytes`. See the [Source configuration](../configuration-reference.md#source).

## Evaluate an Uploaded Image

Send a `multipart/form-data` request with exactly one `metadata` part and one `asset` part. Do not include `url` in the
metadata.

| Part Name  | Content-Type                                | Purpose                                  | Required |
|------------|---------------------------------------------|------------------------------------------|----------|
| `metadata` | `application/json`                          | JSON containing the `definitions` array. | Yes      |
| `asset`    | Image MIME type (for example, `image/jpeg`) | Raw image content to evaluate.           | Yes      |

For example:

```bash
curl --request POST \
  --url 'http://localhost:8080/rule-evaluations' \
  --form 'metadata={"definitions":[{"name":"outdoor-landscape","prompts":["a mountain landscape","a forest landscape","an outdoor landscape"],"threshold":0.7}];type=application/json' \
  --form 'asset=@landscape.jpg;type=image/jpeg'
```

Uploaded content cannot exceed `source.multipart.max-bytes`.

## Response

A successful evaluation returns `200 OK`:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "results": [
    {
      "name": "outdoor-landscape",
      "threshold": 0.7,
      "score": 0.84,
      "matched": true,
      "promptScores": [
        {
          "prompt": "a mountain landscape",
          "score": 0.84
        },
        {
          "prompt": "a forest landscape",
          "score": 0.61
        },
        {
          "prompt": "an outdoor landscape",
          "score": 0.79
        }
      ]
    }
  ]
}
```

| Field Name                        | Type    | Description                                              |
|-----------------------------------|---------|----------------------------------------------------------|
| `results`                         | Array   | Evaluation result for each supplied definition.          |
| `results[].name`                  | String  | Normalized name of the evaluated definition.             |
| `results[].threshold`             | Number  | Threshold supplied for the definition.                   |
| `results[].score`                 | Number  | Highest score from the definition's prompts.             |
| `results[].matched`               | Boolean | Whether `score` is greater than or equal to `threshold`. |
| `results[].promptScores`          | Array   | Score for each normalized prompt in the definition.      |
| `results[].promptScores[].prompt` | String  | Prompt that was scored.                                  |
| `results[].promptScores[].score`  | Number  | Score produced for that prompt.                          |

## Error Responses

| Status                       | Cause                                                                                  |
|------------------------------|----------------------------------------------------------------------------------------|
| `400 Bad Request`            | The request, rule definitions, URL, multipart parts, image format, or size is invalid. |
| `404 Not Found`              | The Rule Evaluation API is disabled.                                                   |
| `415 Unsupported Media Type` | The request is not `application/json` or `multipart/form-data`.                        |

Evaluation accepts the same [supported image formats](../../concepts/Assets/overview.md#content) as asset storage.
