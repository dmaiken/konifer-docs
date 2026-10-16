import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { decode as decodeBlurHash } from "blurhash";
import { thumbHashToRGBA } from "thumbhash";
import { PNG } from "pngjs";

// node scripts/generate-concept-examples.mjs [http://localhost:8080] [--rules-only]
// Required server settings: /documentation/preprocessing/** clamps both dimensions
// to 640 and converts to WebP; /documentation/lqip/** enables both preview types;
// api.rule-evaluation.enabled = true, with the inference model installed.
const server = new URL(
  process.argv.slice(2).find((argument) => !argument.startsWith("--")) ??
    "http://localhost:8080",
);
const rulesOnly = process.argv.includes("--rules-only");
const output = fileURLToPath(
  new URL("../static/image-examples/", import.meta.url),
);
const sourceRoot = fileURLToPath(
  new URL("../static/image-transformations/sources/", import.meta.url),
);
const manifest = rulesOnly
  ? JSON.parse(await readFile(path.join(output, "manifest.json"), "utf8"))
  : { preprocessing: {}, lqip: {}, ruleEvaluation: {} };
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

async function request(relative, options) {
  const response = await fetch(new URL(relative, server), {
    signal: AbortSignal.timeout(180_000),
    ...options,
  });
  if (!response.ok)
    throw new Error(`${relative}: ${response.status} ${await response.text()}`);
  return response;
}

async function save(file, bytes) {
  const destination = path.join(output, file);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, bytes);
  return { file, bytes: bytes.length, sha256: sha256(bytes) };
}

async function saveJson(file, value) {
  return save(file, Buffer.from(`${JSON.stringify(value, null, 2)}\n`));
}

async function upload(assetPath, bytes, filename, contentType) {
  const body = new FormData();
  body.set("metadata", "{}");
  body.set("asset", new Blob([bytes], { type: contentType }), filename);
  const asset = await (
    await request(`/assets/${assetPath}`, { method: "POST", body })
  ).json();
  return `/assets/${assetPath}/-/entry/${asset.entryId}`;
}

async function image(entry, parameters, file, expected) {
  const query = new URLSearchParams(parameters).toString();
  const suffix = query ? `?${query}` : "";
  const { attributes, lqip } = await (
    await request(`${entry}/link${suffix}`)
  ).json();
  const { width, height, format } = attributes;
  if (
    width !== expected[0] ||
    height !== expected[1] ||
    format !== expected[2]
  ) {
    throw new Error(
      `${file}: unexpected attributes ${JSON.stringify(attributes)}; check path configuration`,
    );
  }
  const response = await request(`${entry}/content${suffix}`);
  const content = new Uint8Array(await response.arrayBuffer());
  console.log(`${file}: ${width}×${height} ${format}, ${content.length} bytes`);
  return { ...(await save(file, content)), attributes, lqip };
}

async function generateImageExamples() {
  const cowBytes = await readFile(path.join(sourceRoot, "cow-original.jpg"));
  const source = await upload(
    "documentation/examples/source-cow",
    cowBytes,
    "cow-original.jpg",
    "image/jpeg",
  );
  const original = await (await request(`${source}/link`)).json();
  if (
    original.attributes.width !== 1365 ||
    original.attributes.height !== 1024 ||
    original.attributes.format !== "jpg"
  ) {
    throw new Error("The source path must not preprocess uploads");
  }

  const preprocessed = await upload(
    "documentation/preprocessing/cow",
    cowBytes,
    "cow-original.jpg",
    "image/jpeg",
  );
  const stored = await image(
    preprocessed,
    {},
    "preprocessing/cow-preprocessed-clamp-640.webp",
    [640, 480, "webp"],
  );
  const thumbnail = await image(
    preprocessed,
    { format: "webp", w: 128, h: 128, fit: "fill" },
    "preprocessing/cow-thumbnail-from-preprocessed-128.webp",
    [128, 128, "webp"],
  );
  const smallInput = await image(
    source,
    { format: "jpg", w: 240 },
    "preprocessing/cow-resized-input-240.jpg",
    [240, 180, "jpg"],
  );
  const smallBytes = await readFile(path.join(output, smallInput.file));
  const smallEntry = await upload(
    "documentation/preprocessing/cow-small",
    smallBytes,
    "cow-small.jpg",
    "image/jpeg",
  );
  const smallStored = await image(
    smallEntry,
    {},
    "preprocessing/cow-preprocessed-small-240.webp",
    [240, 180, "webp"],
  );
  manifest.preprocessing = {
    configuration: {
      enabled: true,
      "clamp-width": 640,
      "clamp-height": 640,
      fit: "fit",
      format: "webp",
    },
    uploadPath: "/assets/documentation/preprocessing/cow",
    input: {
      file: "/image-transformations/sources/cow-original.jpg",
      sha256: sha256(cowBytes),
      attributes: original.attributes,
    },
    storedOriginal: stored,
    thumbnail: { ...thumbnail, query: "format=webp&w=128&h=128&fit=fill" },
    small: { input: smallInput, storedOriginal: smallStored },
  };

  const previewEntry = await upload(
    "documentation/lqip/cow",
    cowBytes,
    "cow-original.jpg",
    "image/jpeg",
  );
  const finalImage = await image(
    previewEntry,
    { format: "webp", w: 480 },
    "lqip/cow-final-480.webp",
    [480, 360, "webp"],
  );
  const hashes = finalImage.lqip;
  if (!hashes?.blurhash || !hashes?.thumbhash)
    throw new Error("Enable blurhash and thumbhash for /documentation/lqip/**");
  const blurWidth = 32;
  const blurHeight = 24;
  const blurPixels = decodeBlurHash(hashes.blurhash, blurWidth, blurHeight);
  const thumbBytes = Buffer.from(hashes.thumbhash, "base64");
  const thumb = thumbHashToRGBA(thumbBytes);
  const blurPreview = await save(
    "lqip/cow-blurhash-preview.png",
    PNG.sync.write({
      width: blurWidth,
      height: blurHeight,
      data: Buffer.from(blurPixels),
    }),
  );
  const thumbPreview = await save(
    "lqip/cow-thumbhash-preview.png",
    PNG.sync.write({
      width: thumb.w,
      height: thumb.h,
      data: Buffer.from(thumb.rgba),
    }),
  );
  const linkExcerpt = { attributes: finalImage.attributes, lqip: hashes };
  manifest.lqip = {
    uploadPath: "/assets/documentation/lqip/cow",
    query: "format=webp&w=480",
    finalImage,
    blurhash: {
      hash: hashes.blurhash,
      hashBytes: Buffer.byteLength(hashes.blurhash),
      decoder: "blurhash@2.0.5",
      preview: { ...blurPreview, width: blurWidth, height: blurHeight },
    },
    thumbhash: {
      hash: hashes.thumbhash,
      hashBytes: thumbBytes.length,
      decoder: "thumbhash@0.1.1",
      preview: { ...thumbPreview, width: thumb.w, height: thumb.h },
    },
    responseExcerpt: await saveJson(
      "lqip/cow-link-response-excerpt.json",
      linkExcerpt,
    ),
  };
  console.log(
    `LQIPs: ${JSON.stringify(hashes)}; ThumbHash preview ${thumb.w}×${thumb.h}`,
  );
}

if (!rulesOnly) await generateImageExamples();

const prompts = ["a joshua tree", "a tree", "joshua tree national park"];
const threshold = 0.7;
const metadata = { definitions: [{ name: "joshua-tree", prompts, threshold }] };
manifest.ruleEvaluation = {
  metadata: await saveJson(
    "rule-evaluation/joshua-tree-definition.json",
    metadata,
  ),
  examples: [],
};
for (const subject of ["joshua-tree", "squirrel"]) {
  // Keep the test fixture in static so regeneration does not need a Konifer checkout.
  const input =
    subject === "joshua-tree"
      ? "/image-examples/rule-evaluation/joshua-tree-original.jpg"
      : "/image-transformations/sources/squirrel-original.jpg";
  const bytes = await readFile(
    fileURLToPath(new URL(`../static${input}`, import.meta.url)),
  );
  const body = new FormData();
  body.set("metadata", JSON.stringify(metadata));
  body.set(
    "asset",
    new Blob([bytes], { type: "image/jpeg" }),
    `${subject}-original.jpg`,
  );
  const response = await (
    await request("/rule-evaluations", { method: "POST", body })
  ).json();
  const result = response.results[0];
  if (result.matched !== (subject === "joshua-tree")) {
    throw new Error(
      `${subject}: the model's behavior changed; review this example's threshold and prose`,
    );
  }
  manifest.ruleEvaluation.examples.push({
    subject,
    input,
    bytes: bytes.length,
    sha256: sha256(bytes),
    evaluation: {
      ...(await saveJson(
        `rule-evaluation/${subject}-joshua-tree-response.json`,
        response,
      )),
      result,
    },
  });
  console.log(
    `${subject}, threshold ${threshold}: score ${result.score}, matched ${result.matched}`,
  );
}

await saveJson("manifest.json", manifest);
