import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

const transformParams = [
  'w=1200',
  'h=630',
  'fit=crop',
  'blur=10',
  'format=webp',
  'q=82',
  'r=auto',
];

const responseModes = [
  'content',
  'link',
  'redirect',
  'download',
  'info',
];

const orderingModes = [
  {
    selector: 'new',
    label: 'Most recently created',
  },
  {
    selector: 'modified',
    label: 'Most recently modified',
  },
  {
    selector: 'entry/42',
    label: 'Absolute asset reference',
  },
];

const capabilities = [
  {
    title: 'Application-shaped asset paths',
    body: 'Use URLs that match your product model, such as users, organizations, listings, posts, and documents. Konifer does not force your app to persist opaque media IDs just to render an asset later.',
  },
  {
    title: 'One API for storage and delivery',
    body: 'Store originals, attach metadata, request the newest asset at a path, address a specific entry, or fetch generated variants through the same HTTP surface.',
  },
  {
    title: 'Transformations without vendor lock-in',
    body: 'Resize, crop, rotate, blur, pad, strip metadata, manage color space, and convert formats on demand or through named variant profiles.',
  },
  {
    title: 'CDN-aware by design',
    body: 'Serve bytes directly, return object-store links, issue redirects, use Cache-Control and ETags, and protect public transformation URLs with HMAC signing.',
  },
];

const formats = ['JPEG', 'PNG', 'WebP', 'AVIF', 'JPEG XL', 'HEIC', 'GIF'];

function CodeWindow(): ReactNode {
  return (
    <div className={styles.codeWindow} aria-label="Konifer API examples">
      <div className={styles.windowBar}>
        <span />
        <span />
        <span />
      </div>
      <pre>
        <code>
          <span className={styles.codeComment}># Store where the asset belongs</span>
          {'\n'}
          <span className={styles.codeVerb}>POST</span> /assets/users/123/profile-picture
          {'\n\n'}
          <span className={styles.codeComment}># Fetch a transformed image</span>
          {'\n'}
          <span className={styles.codeVerb}>GET </span> /assets/users/123/profile-picture/-/content?w=256&amp;format=webp
          {'\n\n'}
          <span className={styles.codeComment}># Fetch a transformed image using a defined transformation</span>
          {'\n'}
          <span className={styles.codeVerb}>GET </span> /assets/users/123/profile-picture/-/content?profile=thumbnail
          {'\n\n'}
          <span className={styles.codeComment}># Ask for asset information, links, or redirects instead</span>
          {'\n'}
          <span className={styles.codeVerb}>GET </span> /assets/users/123/profile-picture/-/info
        </code>
      </pre>
    </div>
  );
}

function CapabilityCard({
  title,
  body,
}: {
  title: string;
  body: string;
}): ReactNode {
  return (
    <article className={styles.capabilityCard}>
      <Heading as="h3">{title}</Heading>
      <p>{body}</p>
    </article>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Self-hosted image storage, transformation, and delivery"
      description="Konifer is a self-hosted image storage, transformation, and delivery API with application-shaped paths, CDN-friendly responses, and modern format support."
    >
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <div className={styles.brandLine}>
                <img src="/img/konifer-small.png" alt="" className={styles.logoMark} />
                <span>Konifer</span>
              </div>
              <Heading as="h1">Self-hosted image infrastructure that fits your API.</Heading>
              <p className={styles.heroLead}>
                Konifer stores original images, generates and caches transformed variants, and
                returns content, links, redirects, downloads, or information from URLs that follow
                your application&apos;s domain model.
              </p>
              <div className={styles.heroActions}>
                <Link className={clsx('button button--primary', styles.primaryButton)} to="/docs/getting-started">
                  Get started
                </Link>
                <Link className={clsx('button button--secondary', styles.secondaryButton)} to="/docs">
                  Read the docs
                </Link>
              </div>
            </div>
            <div className={styles.heroVisual}>
              <CodeWindow />
              <div className={styles.pipeline} aria-label="Konifer delivery pipeline">
                <span>Your app</span>
                <span>Konifer API</span>
                <span>Object store</span>
                <span>CDN</span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Heading as="h2">Why teams use it</Heading>
            <p>
              Konifer is for products that want Cloudinary- or Imgix-style capabilities while
              keeping control over storage, routing, processing, and delivery behavior.
            </p>
          </div>
          <div className={styles.capabilityGrid}>
            {capabilities.map((capability) => (
              <CapabilityCard key={capability.title} {...capability} />
            ))}
          </div>
        </section>

        <section className={clsx(styles.section, styles.apiSection)}>
          <div className={styles.apiCopy}>
            <Heading as="h2">An API philosophy built around integration</Heading>
            <p>
              Most media services become a separate source of truth. Konifer is designed so your
              existing application state can construct useful asset URLs directly.
            </p>
            <p>
              Query selectors live behind the <code>/-/</code> separator, keeping product paths
              separate from delivery instructions.
            </p>
          </div>
          <div className={styles.selectorPanel}>
            <div>
              <span className={styles.selectorLabel}>Ordering</span>
              <div className={styles.selectorGrid}>
                {orderingModes.map((mode) => (
                  <span key={mode.selector}>
                    <strong>/-/{mode.selector}</strong>
                    <small>{mode.label}</small>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className={styles.selectorLabel}>Return format</span>
              <div className={styles.selectorGrid}>
                {responseModes.map((mode) => (
                  <span key={mode}>
                    <strong>/-/{mode}</strong>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={clsx(styles.section, styles.stackSection)}>
          <div className={styles.stackCopy}>
            <Heading as="h2">Treat a path like a domain primitive</Heading>
            <p>
              Because <code>new</code> is the default ordering selector, fetching a path behaves
              like reading the top of a stack. Post a new asset to the same path and your app can
              hot swap an avatar, publish a new hero image, or keep simple version history without
              changing the URL it already knows.
            </p>
            <Link to="/docs/Concepts/Assets/concepts-fetching-assets">Explore query selectors</Link>
          </div>
          <div className={styles.stackExample}>
            <span>POST /assets/products/sku-123/hero</span>
            <span>POST /assets/products/sku-123/hero</span>
            <span>GET&nbsp; /assets/products/sku-123/hero</span>
            <strong>returns the newest asset by default</strong>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.transformLayout}>
            <div>
              <Heading as="h2">Transform once, cache for the next request</Heading>
              <p>
                Request image variants on demand or define named profiles for common outputs.
                Generated variants are stored and reused, so expensive work does not repeat for
                every viewer.
              </p>
              <div className={styles.formatList}>
                {formats.map((format) => (
                  <span key={format}>{format}</span>
                ))}
              </div>
            </div>
            <div className={styles.paramPanel}>
              {transformParams.map((param) => (
                <span key={param}>{param}</span>
              ))}
            </div>
          </div>
        </section>

        <section className={clsx(styles.section, styles.configSection)}>
          <div>
            <Heading as="h2">Path Configuration is where the flexibility compounds</Heading>
            <p>
              Configure behavior by path pattern, then let inheritance do the work. Public avatars,
              private user content, CMS images, and generated media can share one service while
              using different storage buckets, validation rules, eager variants, preprocessing,
              redirect strategies, caching, and LQIP behavior.
            </p>
            <Link to="/docs/Concepts/concepts-path-configuration">Read Path Configuration</Link>
          </div>
          <pre className={styles.configCode}>
            <code>{`paths {
  "/public/avatars/**" {
    transform { eager-variants = [ small, medium, large ] }
    return-format.redirect.strategy = template
    cache-control.max-age = 31536000
  }
  "/users/*/profile-picture" {
    bucket = "profile-pictures"
    allowed-content-types = [ "image/jpeg" ]
  }
}`}</code>
          </pre>
        </section>

        <section className={clsx(styles.section, styles.futureSection)}>
          <div>
            <Heading as="h2">Built as the beginning of a media engine</Heading>
            <p>
              Konifer is image-focused today. The longer-term direction is broader: a self-hosted
              engine for media assets such as PDFs, audio, text, and eventually video, with the
              same path-based integration model.
            </p>
          </div>
          <Link className={clsx('button button--primary', styles.primaryButton)} to="/docs/getting-started">
            Run Konifer locally
          </Link>
        </section>
      </main>
    </Layout>
  );
}
