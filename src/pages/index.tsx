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
    title: "Ingest",
    body: "Accept multipart uploads or fetch remote images from an explicit domain allowlist.",
  },
  {
    number: "02",
    title: "Validate",
    body: "Enforce byte, dimension, pixel, content-type, and optional content-classification rules.",
  },
  {
    number: "03",
    title: "Persist",
    body: "Keep image content, metadata, path history, and generated variants under one API.",
  },
  {
    number: "04",
    title: "Maintain",
    body: "Replace assets at stable paths, update metadata, and address individual entries when needed.",
  },
  {
    number: "05",
    title: "Retire",
    body: "Delete one image, a complete path, or an application subtree with recursive operations.",
  },
];

const infrastructure = [
  {
    label: "Binary content",
    value: "S3-compatible object storage or a filesystem",
  },
  {
    label: "Asset records",
    value: "PostgreSQL for paths, metadata, and variant state",
  },
  {
    label: "Delivery",
    value: "Links, redirects, direct responses, and the CDN you choose",
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
            # Store at an application-owned path
          </span>
          {"\n"}
          <span className={styles.codeVerb}>POST</span>{" "}
          /assets/users/123/profile-picture
          {"\n\n"}
          <span className={styles.codeComment}>
            # Read information or get a delivery link
          </span>
          {"\n"}
          <span className={styles.codeVerb}>GET </span>{" "}
          /assets/users/123/profile-picture/-/info
          {"\n"}
          <span className={styles.codeVerb}>GET </span>{" "}
          /assets/users/123/profile-picture/-/redirect
          {"\n\n"}
          <span className={styles.codeComment}>
            # Remove the user&apos;s complete image subtree
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
      description="Konifer is a self-hosted backend service for ingesting, validating, storing, and managing application-owned images."
    >
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <Heading as="h1">Image management for backend teams.</Heading>
            <p className={styles.heroLead}>
              Konifer handles ingestion, validation, storage, metadata,
              replacement, and deletion for every image your application owns.
              Address images with paths your backend already understands, then
              serve them through the delivery layer you choose.
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
            <span className={styles.sectionLabel}>Domain-aligned API</span>
            <Heading as="h2">Make the image path part of your model.</Heading>
            <p>
              A profile picture belongs to a user. A listing photo belongs to a
              listing. Konifer lets your backend encode that relationship
              directly instead of managing another <code>imageId</code>. Want to use
              an <code>imageId</code>? That's fine too.
            </p>
            <div className={styles.pathExamples}>
              <code>/assets/users/123/profile-picture</code>
              <code>/assets/listings/ca-90210/gallery</code>
              <code>/assets/claims/456/evidence</code>
              <code>/assets/358e0754-0c12-4541-891a-3e135c3b49c5</code>
            </div>
            <p>
              Path configuration applies storage, validation, preprocessing, and
              delivery policy to the same hierarchy. Broader rules are
              inherited; the most specific rule wins.
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
            <span className={styles.sectionLabel}>Lifecycle management</span>
            <Heading as="h2">
              One service owns image state from upload to deletion.
            </Heading>
            <p>
              Image handling often grows into separate upload endpoints, bucket
              conventions, validation jobs, and cleanup scripts. Konifer brings
              those responsibilities behind one consistent API and policy model.
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
            <span className={styles.sectionLabel}>Infrastructure neutral</span>
            <Heading as="h2">
              Own image management. Keep your storage and CDN.
            </Heading>
            <p>
              Konifer manages assets and serves links to them. It can return
              image content when useful, but it does not need to replace the
              edge delivery system that already works for your application.
            </p>
            <p>
              Run it with a filesystem or any S3-compatible object store. Put
              the CDN you already operate in front, use redirects to object
              storage, or combine both approaches by path.
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
            <span className={styles.sectionLabel}>Start locally</span>
            <Heading as="h2">Try the complete API with one container.</Heading>
            <p>
              In-memory mode is built for local evaluation. Add PostgreSQL and
              durable storage when you deploy.
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
