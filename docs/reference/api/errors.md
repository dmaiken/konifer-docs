---
sidebar_position: 5
id: errors
slug: /reference/errors
title: Error Responses
sidebar_label: "Errors"
description: "Handle API failures using stable error codes and HTTP statuses."
---

Konifer returns JSON errors from the Assets and Rule Evaluation APIs:

```json
{
  "code": "INVALID_TRANSFORMATION",
  "message": "Invalid transformation"
}
```

Use `code` to distinguish failure categories and the HTTP status to determine the general outcome. Use `message`
for display or troubleshooting. Message wording can change; avoid parsing it to make application decisions.
Konifer omits `message` when it has no explanation. The field also accepts JSON `null`.

## Codes

| Code                         | HTTP status   | Meaning                                                                                                               |
|------------------------------|---------------|-----------------------------------------------------------------------------------------------------------------------|
| `INVALID_REQUEST`            | 400           | Invalid request structure, JSON, metadata, rule definitions, limits, multipart parts, or missing/conflicting sources. |
| `INVALID_PATH`               | 400           | Invalid asset path, entry ID, or selectors.                                                                           |
| `INVALID_TRANSFORMATION`     | 400           | Invalid transformation parameter, combination, limit, or unknown variant profile.                                     |
| `TRANSFORMATION_NOT_ALLOWED` | 400           | Transformation conflicts with configured restrictions or the selected profile.                                        |
| `ASSET_REJECTED`             | 400           | Upload rules rejected the image.                                                                                      |
| `ASSET_TOO_LARGE`            | 400, 413, 422 | An asset or request body exceeds its size limit.                                                                      |
| `INVALID_SOURCE`             | 422           | Invalid external source reference or response.                                                                        |
| `SOURCE_UNAVAILABLE`         | 502, 504      | External source retrieval failed (502) or timed out (504).                                                            |
| `FORBIDDEN`                  | 403           | Missing/invalid signature, disallowed image format, or forbidden external source.                                     |
| `NOT_FOUND`                  | 404           | No matching asset or API route; includes a disabled Rule Evaluation API.                                              |
| `UNSUPPORTED_MEDIA_TYPE`     | 415           | Request content type must be `application/json` or `multipart/form-data`.                                             |
| `INTERNAL_ERROR`             | 500           | Unexpected server failure. The message is `Internal server error`.                                                    |

Size errors retain their existing HTTP statuses: 413 for the request body limit, 422 for remotely retrieved
assets, and 400 for asset-data limits enforced within upload processing.

An empty asset collection returns a successful response. Deleting a selection with no matches also succeeds.
See [Fetch Assets](assets/fetch-assets.mdx) and [Delete Assets](assets/delete-assets.mdx).

## Client compatibility

The Kotlin and Java clients expose the code through `KoniferResult.Failure.Http.code`, alongside `statusCode` and
`message`. See [Handle results](../../start-here/using-the-client.mdx#handle-results) for examples.

The client uses `ErrorCode.UNKNOWN` when an older server omits the code or a newer server returns an unfamiliar
value. It preserves a readable message and the HTTP status. For an empty or unreadable error body, it retains the
HTTP status and uses `UNKNOWN` with a null message. Konifer does not emit `UNKNOWN` as a server error code.

Handle unfamiliar codes with a fallback based on the HTTP status. Proxies and storage/CDN delivery hosts can return
their own response formats. Once content streaming has started, a connection failure cannot become a JSON error.
Health endpoints retain their own response format; see [Health](health.md).
