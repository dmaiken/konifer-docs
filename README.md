# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Installation

```bash
yarn
```

## Local Development

```bash
yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without
having to restart the server.

## Build

```bash
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting
service.

## Verify API examples

With Konifer running on port 8080, execute the curl blocks from the Asset API and Rule Evaluation reference:

```bash
npm run test:api-examples
```

The check requires `curl`. It substitutes the examples' literal URLs and filenames for test fixtures under a unique
`documentation/examples/verify-...` path,
checks responses and downloaded images, and deletes its fixtures afterward. It does not use existing assets.
Set `KONIFER_URL` to test another server. URL and S3 examples can be checked by supplying `SOURCE_URL` for an allowed
image URL and `SOURCE_ARN` for an S3 object readable by the server. Rule Evaluation must be enabled to test evaluations.
The output reports unavailable examples as skipped.

## Deployment

Using SSH:

```bash
USE_SSH=true yarn deploy
```

Not using SSH:

```bash
GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the
`gh-pages` branch.
