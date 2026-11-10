import type { ReactNode } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";
import {
  Highlight,
  Prism,
  themes as prismThemes,
  type PrismTheme,
} from "prism-react-renderer";
import { hoconGrammar } from "../prism/prism.hocon";
import styles from "./index.module.css";

Prism.languages.hocon = hoconGrammar;

const hoconTheme: PrismTheme = {
  ...prismThemes.dracula,
  plain: {
    ...prismThemes.dracula.plain,
    backgroundColor: "#121713",
  },
  styles: [
    ...prismThemes.dracula.styles,
    { types: ["property"], style: { color: "rgb(139, 233, 253)" } },
    { types: ["operator"], style: { color: "rgb(255, 121, 198)" } },
  ],
};

const responsibilities = [
  {
    number: "01",
    title: "Upload",
    body: "Accept image files or import them from URLs and S3 object ARNs through one API.",
  },
  {
    number: "02",
    title: "Validate",
    body: "Enforce upload size, format, and pixel limits without repeating validation in each caller.",
  },
  {
    number: "03",
    title: "Store",
    body: "Keep originals, metadata, and upload history together in your storage.",
  },
  {
    number: "04",
    title: "Transform",
    body: "Generate and cache variants after upload or on demand, without a separate thumbnail workflow.",
  },
  {
    number: "05",
    title: "Replace and delete",
    body: "Replace an image at the same URL, retrieve previous entries, or delete related images in one request.",
  },
];

const infrastructure = [
  {
    label: "Processing",
    value: "Konifer, including background variant workers",
  },
  {
    label: "Image files",
    value: "S3-compatible storage or a persistent filesystem",
  },
  {
    label: "Asset records",
    value: "PostgreSQL for paths, metadata, and variant state",
  },
  {
    label: "Delivery",
    value: "Your CDN, object-store redirects, or image content from the API",
  },
];

function ApiExample(): ReactNode {
  return (
    <div
      className={styles.apiExample}
      aria-label="Upload, transform, replace, and delete images through the asset API"
    >
      <div className={styles.codeLabel}>One API for the image lifecycle</div>
      <pre>
        <code>
          <span className={styles.codeComment}>
            # Upload a profile picture
          </span>
          {"\n"}
          <span className={styles.codeVerb}>POST</span>{" "}
          /assets/users/123/profile-picture
          {"\n\n"}
          <span className={styles.codeComment}>
            # Request a cached WebP thumbnail
          </span>
          {"\n"}
          <span className={styles.codeVerb}>GET</span>{" "}
          /assets/users/123/profile-picture/-/content?width=256&format=webp
          {"\n\n"}
          <span className={styles.codeComment}>
            # Replace the picture at the same path
          </span>
          {"\n"}
          <span className={styles.codeVerb}>POST</span>{" "}
          /assets/users/123/profile-picture
          {"\n\n"}
          <span className={styles.codeComment}>
            # Delete this user&apos;s images
          </span>
          {"\n"}
          <span className={styles.codeVerb}>DELETE</span>{" "}
          /assets/users/123/-/recursive
        </code>
      </pre>
    </div>
  );
}

function HoconCodeBlock({ code }: { code: string }): ReactNode {
  return (
    <Highlight prism={Prism} theme={hoconTheme} code={code} language="hocon">
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={clsx(styles.configCode, className)}
          style={style}
          tabIndex={0}
        >
          <code>
            {tokens.map((line, lineIndex) => (
              <div key={lineIndex} {...getLineProps({ line })}>
                {line.map((token, tokenIndex) => (
                  <span key={tokenIndex} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </code>
        </pre>
      )}
    </Highlight>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Self-hosted image backend"
      description="Spend less time building image infrastructure. Upload, validate, store, transform, and delete images through one self-hosted API, using your storage and CDN."
    >
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <Heading as="h1">
              {"The self-hosted image backend your application doesn't have to build."}
            </Heading>
            <p className={styles.heroLead}>
              Upload, validate, store, transform, and delete images through one
              API. Spend less time maintaining image workflows, using your
              storage and CDN.
            </p>
            <div className={styles.heroActions}>
              <Link
                className={clsx("button button--primary", styles.primaryButton)}
                to="/docs/start-here/getting-started"
              >
                Try the 10-minute quickstart
              </Link>
              <Link className={styles.textLink} to="/docs">
                Read the overview <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          <ApiExample />
        </section>

        <section className={clsx(styles.section, styles.lifecycleSection)}>
          <div className={styles.sectionCopy}>
            <span className={styles.sectionLabel}>Image lifecycle</span>
            <Heading as="h2">Less image infrastructure to build and maintain.</Heading>
            <p>
              Image uploads grow into validation rules, thumbnail workers,
              replacement history, and cleanup jobs. Configure those workflows
              in Konifer and share them across your applications.
            </p>
            <p>
              Use one API for avatars, product galleries, and tenant branding,
              with storage and processing policies for each image category.
            </p>
            <Link
              className={styles.textLink}
              to="/docs/start-here/is-konifer-right-for-you"
            >
              See where Konifer fits <span aria-hidden="true">→</span>
            </Link>
          </div>
          <ol className={styles.responsibilityList}>
            {responsibilities.map((responsibility) => (
              <li key={responsibility.number}>
                <span>{responsibility.number}</span>
                <div>
                  <Heading as="h3">{responsibility.title}</Heading>
                  <p>{responsibility.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className={clsx(styles.section, styles.pathSection)}>
          <div className={styles.sectionCopy}>
            <span className={styles.sectionLabel}>Image paths</span>
            <Heading as="h2">Choose image paths that fit your application.</Heading>
            <p>
              Address a profile picture by user, a gallery by product, or an
              individual image by ID. Use resource paths, image IDs, or both.
            </p>
            <div className={styles.pathExamples}>
              <code>/assets/users/123/profile-picture</code>
              <code>/assets/products/sku-123/gallery</code>
              <code>/assets/{"{imageId}"}</code>
              <code>/assets/users/123/images/{"{imageId}"}</code>
            </div>
            <p>
              Group related images to apply policies and delete them together.
              Keep upload and transformation rules in configuration instead of
              repeating them in each caller. This example limits user images to
              15 megapixels and generates profile thumbnails in a dedicated bucket.
            </p>
            <Link
              className={styles.textLink}
              to="/docs/concepts/concepts-path-configuration"
            >
              Read about path configuration <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className={styles.codeColumn}>
            <div className={styles.codeLabel}>konifer.conf</div>
            <HoconCodeBlock
              code={`variant-profiles {
  thumbnail {
    width = 256
    height = 256
    fit = fill
    rotate = auto
    format = webp
  }
}

paths {
  "/users/**" {
    limits {
      max-pixels = 15MP
    }
  }

  "/users/*/profile-picture" {
    object-store {
      bucket = "profile-pictures"
    }
    transform {
      eager-variants = [thumbnail]
    }
  }
}`}
            />
          </div>
        </section>

        <section className={clsx(styles.section, styles.infrastructureSection)}>
          <div className={styles.sectionCopy}>
            <span className={styles.sectionLabel}>Deployment</span>
            <Heading as="h2">
              One service alongside your database and image storage.
            </Heading>
            <p>
              Run Konifer with PostgreSQL and S3-compatible storage or a
              persistent filesystem. Image processing and background variant
              workers run inside Konifer, without a separate message broker or
              worker deployment.
            </p>
            <p>
              Add replicas behind a load balancer using shared PostgreSQL and
              image storage. Your team manages backups, upgrades, and capacity,
              and supplies application authentication and authorization.
            </p>
            <div className={styles.infrastructureLinks}>
              <Link
                className={styles.textLink}
                to="/docs/operate/deployment"
              >
                Deployment guide <span aria-hidden="true">→</span>
              </Link>
              <Link
                className={styles.textLink}
                to="/docs/reference/http-caching"
              >
                HTTP caching <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          <dl className={styles.infrastructureList}>
            {infrastructure.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={clsx(styles.section, styles.pathSection)}>
          <div className={styles.sectionCopy}>
            <span className={styles.sectionLabel}>Vision pipelines</span>
            <Heading as="h2">Reuse images and preprocessing across consumers.</Heading>
            <p>
              Serve display images and raw pixel buffers from the same stored
              source. Define reusable transformation profiles for your application
              and vision workers, and share cached results across requests.
            </p>
            <p>
              Your workers handle tensor construction and model-specific scaling
              and normalization.
            </p>
            <Link
              className={styles.textLink}
              to="/docs/guides/guides-pixels-for-inference"
            >
              Follow the inference guide <span aria-hidden="true">→</span>
            </Link>
          </div>
          <dl className={styles.infrastructureList}>
            <div>
              <dt>Application</dt>
              <dd>A WebP thumbnail for a storefront or reviewer.</dd>
            </div>
            <div>
              <dt>Vision worker</dt>
              <dd>A resized pixel buffer for classification, search, or inspection.</dd>
            </div>
          </dl>
        </section>

        <section className={styles.finalCta}>
          <div>
            <span className={styles.sectionLabel}>Try Konifer</span>
            <Heading as="h2">Try the image lifecycle in 10 minutes.</Heading>
            <p>
              Upload an image, generate a thumbnail, and replace the original
              without changing its application URL. Try it with in-memory
              storage; uploaded images disappear when the container stops.
            </p>
          </div>
          <div className={styles.startPanel}>
            <code>
              docker run -e IN_MEMORY=true -p 8080:8080
              ghcr.io/dmaiken/konifer:latest
            </code>
            <div>
              <Link
                className={clsx("button button--primary", styles.primaryButton)}
                to="/docs/start-here/getting-started"
              >
                Follow the guide
              </Link>
              <Link
                className={styles.darkTextLink}
                to="/docs/operate/deployment"
              >
                Deployment reference <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
