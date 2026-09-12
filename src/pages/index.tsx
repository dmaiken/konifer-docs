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
    body: "Upload images as multipart requests or fetch them from domains you allow.",
  },
  {
    number: "02",
    title: "Validate",
    body: "Set limits on file size, dimensions, and pixel count. Restrict content types or add content-classification rules.",
  },
  {
    number: "03",
    title: "Store",
    body: "Store originals and generated variants with metadata and a history of uploads at each path.",
  },
  {
    number: "04",
    title: "Update",
    body: "Upload a replacement at the same path and retrieve earlier entries by ID. Edit metadata without uploading another image.",
  },
  {
    number: "05",
    title: "Delete",
    body: "Delete a single entry, the images at a path, or a path and its children.",
  },
];

const infrastructure = [
  {
    label: "Image files",
    value: "S3-compatible object storage or a filesystem",
  },
  {
    label: "Asset records",
    value: "PostgreSQL for paths, metadata, and variant state",
  },
  {
    label: "Delivery",
    value: "Image links, redirects, or image content, with optional CDN delivery",
  },
];

function ApiExample(): ReactNode {
  return (
    <div
      className={styles.apiExample}
      aria-label="Example Konifer asset API requests"
    >
      <div className={styles.codeLabel}>Asset API</div>
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
            # Get metadata or an image link
          </span>
          {"\n"}
          <span className={styles.codeVerb}>GET </span>{" "}
          /assets/users/123/profile-picture/-/info
          {"\n"}
          <span className={styles.codeVerb}>GET </span>{" "}
          /assets/users/123/profile-picture/-/link
          {"\n\n"}
          <span className={styles.codeComment}>
            # Delete the images under this user&apos;s path
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
      title="Backend image management"
      description="Use Konifer to upload, validate, and manage images through a self-hosted API. Organize images by application path and choose your storage and CDN."
    >
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <Heading as="h1">Image management for backend teams.</Heading>
            <p className={styles.heroLead}>
              Use Konifer to upload, validate, and manage images through a
              self-hosted API. Organize them by user or listing, replace a photo
              at the same URL, and choose how you store and serve it.
            </p>
            <div className={styles.heroActions}>
              <Link
                className={clsx("button button--primary", styles.primaryButton)}
                to="/docs/start-here/getting-started"
              >
                Get started
              </Link>
              <Link className={styles.textLink} to="/docs">
                Read the overview <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          <ApiExample />
        </section>

        <section className={clsx(styles.section, styles.pathSection)}>
          <div className={styles.sectionCopy}>
            <span className={styles.sectionLabel}>Image paths</span>
            <Heading as="h2">Organize images around your application.</Heading>
            <p>
              Choose paths that match your application, such as a user&apos;s
              profile picture or a listing&apos;s gallery. You can use an{" "}
              <code>imageId</code> as the path if you prefer.
            </p>
            <div className={styles.pathExamples}>
              <code>/assets/users/123/profile-picture</code>
              <code>/assets/listings/ca-90210/gallery</code>
              <code>/assets/claims/456/evidence</code>
              <code>/assets/358e0754-0c12-4541-891a-3e135c3b49c5</code>
            </div>
            <p>
              Configure storage, validation, preprocessing, and delivery by path.
              Set shared defaults on a parent path and override individual
              settings on more specific paths. In this example, you cap user
              uploads at 20 MB and 15 megapixels, then restrict profile pictures
              to JPEG and PNG in a dedicated bucket.
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
              code={`paths {
  "/users/**" {
    limits {
      max-bytes = 20MB
      max-pixels = 15MP
    }
  }

  "/users/*/profile-picture" {
    bucket = "profile-pictures"
    allowed-content-types = [
      "image/jpeg",
      "image/png"
    ]
  }
}`}
            />
          </div>
        </section>

        <section className={clsx(styles.section, styles.lifecycleSection)}>
          <div className={styles.sectionCopy}>
            <span className={styles.sectionLabel}>Asset operations</span>
            <Heading as="h2">
              Manage images from upload to deletion.
            </Heading>
            <p>
              Use the asset API to manage uploads and their metadata. You can
              keep earlier profile pictures after a replacement, retrieve a
              specific entry, or delete a user&apos;s images in one request.
            </p>
            <Link
              className={styles.textLink}
              to="/docs/concepts/Assets/concepts-assets"
            >
              Explore the asset model <span aria-hidden="true">→</span>
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

        <section className={clsx(styles.section, styles.infrastructureSection)}>
          <div className={styles.sectionCopy}>
            <span className={styles.sectionLabel}>Storage and delivery</span>
            <Heading as="h2">
              Choose your storage and CDN.
            </Heading>
            <p>
              Store image files on a filesystem or in S3-compatible object
              storage, and keep asset records in PostgreSQL.
            </p>
            <p>
              Serve images through your CDN, redirect requests to object
              storage, or return image content from the API. Configure delivery
              for each path to suit your application.
            </p>
            <div className={styles.infrastructureLinks}>
              <Link
                className={styles.textLink}
                to="/docs/reference/reference-variant-storage"
              >
                Storage architecture <span aria-hidden="true">→</span>
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

        <section className={styles.finalCta}>
          <div>
            <span className={styles.sectionLabel}>Try Konifer</span>
            <Heading as="h2">Run Konifer in one container.</Heading>
            <p>
              Use in-memory mode to try the API on your machine. Add PostgreSQL
              and persistent image storage for deployment.
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
