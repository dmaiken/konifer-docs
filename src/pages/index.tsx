import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

const responseModes = ['content', 'link', 'redirect', 'download', 'info'];

const selectionModes = [
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
    title: 'Infrastructure under your control',
    body: 'Choose where Konifer runs, where originals and variants are stored, and how content reaches clients through direct responses, object-store links, redirects, or a CDN.',
  },
];

const formats = ['JPEG', 'PNG', 'WebP', 'AVIF', 'JPEG XL', 'HEIC', 'GIF'];

function CodeWindow(): ReactNode {
  return (
    <figure className={styles.codeFigure}>
      <div className={styles.codeWindow} aria-label="A stable Konifer asset path">
        <div className={styles.windowBar}>
          <span />
          <span />
          <span />
        </div>
        <pre>
          <code>
            <span className={styles.codeComment}>
              # Store an image where your app already knows it belongs
            </span>
            {'\n'}
            <span className={styles.codeVerb}>POST</span> /assets/users/123/profile-picture
            {'\n\n'}
            <span className={styles.codeComment}>
              # Read the current image from the same stable path
            </span>
            {'\n'}
            <span className={styles.codeVerb}>GET </span>
            /assets/users/123/profile-picture/-/content
            {'\n\n'}
            <span className={styles.codeComment}># Request a reusable transformed variant</span>
            {'\n'}
            <span className={styles.codeVerb}>GET </span>
            /assets/users/123/profile-picture/-/content?profile=thumbnail
          </code>
        </pre>
      </div>
      <figcaption>Replace the image later. Your application keeps the same URL.</figcaption>
    </figure>
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
              <span className={styles.eyebrow}>Self-hosted image infrastructure</span>
              <Heading as="h1">Image infrastructure for paths your app already knows.</Heading>
              <p className={styles.heroLead}>
                Store, transform, and deliver images at URLs like{' '}
                <code>/assets/users/123/profile-picture</code>—without persisting opaque media IDs
                in your application.
              </p>
              <div className={styles.heroActions}>
                <Link
                  className={clsx('button button--primary', styles.primaryButton)}
                  to="/docs/start-here/getting-started"
                >
                  Get started
                </Link>
                <Link className={clsx('button button--secondary', styles.secondaryButton)} to="/docs">
                  Read the docs
                </Link>
              </div>
            </div>
            <div className={styles.heroVisual}>
              <CodeWindow />
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionKicker}>Why Konifer</span>
            <Heading as="h2">One image lifecycle, shaped around your application</Heading>
            <p>
              Konifer brings storage, transformation, replacement, and delivery behind an API
              that follows the domain model your product already has.
            </p>
          </div>
          <div className={styles.capabilityGrid}>
            {capabilities.map((capability) => (
              <CapabilityCard key={capability.title} {...capability} />
            ))}
          </div>
        </section>

        <section className={clsx(styles.section, styles.pathSection)}>
          <div className={styles.apiCopy}>
            <span className={styles.sectionKicker}>Stable paths</span>
            <Heading as="h2">Replace an image without changing its URL</Heading>
            <p>
              Post a new asset to the same path and the default request resolves to the newest
              entry. Your app can replace an avatar or publish a new hero image without updating
              the URL it already knows.
            </p>
            <p>
              Select a specific entry when you need history, then choose whether Konifer returns
              content, a link, a redirect, a download, or structured information.
            </p>
            <Link to="/docs/concepts/Assets/concepts-fetching-assets">Explore asset selection</Link>
          </div>
          <div className={styles.pathPanel}>
            <div className={styles.stablePath}>
              <span>Stable application path</span>
              <code>/assets/products/sku-123/hero</code>
            </div>
            <div className={styles.replacementFlow}>
              <div>
                <small>Initial upload</small>
                <code>POST</code>
              </div>
              <span aria-hidden="true">→</span>
              <div>
                <small>Replacement</small>
                <code>POST</code>
              </div>
              <span aria-hidden="true">→</span>
              <div className={styles.flowResult}>
                <small>Default GET</small>
                <strong>newest asset</strong>
              </div>
            </div>
            <div className={styles.selectorPanel}>
              <div>
                <span className={styles.selectorLabel}>Asset selection</span>
                <div className={styles.selectorGrid}>
                  {selectionModes.map((mode) => (
                    <span key={mode.selector}>
                      <strong>/-/{mode.selector}</strong>
                      <small>{mode.label}</small>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className={styles.selectorLabel}>Response mode</span>
                <div className={styles.responseList}>
                  {responseModes.map((mode) => (
                    <code key={mode}>/-/{mode}</code>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.transformLayout}>
            <div>
              <span className={styles.sectionKicker}>Reusable variants</span>
              <Heading as="h2">Transform once, reuse the result</Heading>
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
            <div className={styles.transformPanel}>
              <span className={styles.panelLabel}>Request</span>
              <code>/assets/products/sku-123/hero/-/content?profile=social-card</code>
              <div className={styles.transformArrow} aria-hidden="true">
                ↓
              </div>
              <div className={styles.variantResult}>
                <span>Generated once</span>
                <strong>1200 × 630 WebP</strong>
                <small>Stored and reused on later requests</small>
              </div>
            </div>
          </div>
        </section>

        <section className={clsx(styles.section, styles.configSection)}>
          <div>
            <span className={styles.sectionKicker}>Policy by path</span>
            <Heading as="h2">Configure behavior where images belong</Heading>
            <p>
              Configure behavior by path pattern, then let inheritance do the work. Public avatars,
              private user content, CMS images, and generated media can share one service while
              using different storage buckets, upload rulesets, eager variants, preprocessing,
              redirect strategies, caching, and LQIP behavior.
            </p>
            <Link to="/docs/concepts/concepts-path-configuration">Read Path Configuration</Link>
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

        <section className={clsx(styles.section, styles.rulesSection)}>
          <div className={styles.rulesCopy}>
            <span className={styles.sectionKicker}>Content-aware upload rules</span>
            <Heading as="h2">Reject the wrong image before it becomes an asset</Heading>
            <p>
              Evaluate uploads with zero-shot image classification before they are stored. Define
              reusable rules, attach them to path patterns, and give each area of your product its
              own visual content policy.
            </p>
            <Link to="/docs/concepts/concepts-upload-rules">Explore Upload Rules</Link>
          </div>
          <pre className={styles.rulesCode}>
            <code>{`rule-definitions {
  "product-photo" {
    prompts = [
      "a clean catalog image of a product",
      "a product photo on a plain background"
    ]
    threshold = 0.66
  }
}

paths {
  "/catalog/products/**" {
    upload-ruleset {
      default = reject
      accept-rules = [ { rule = "product-photo" } ]
    }
  }
}`}</code>
          </pre>
        </section>

        <section className={clsx(styles.section, styles.finalCta)}>
          <div>
            <span className={styles.sectionKicker}>Try Konifer</span>
            <Heading as="h2">Run your first image workflow locally</Heading>
            <p>
              Start Konifer, upload an image to an application-shaped path, and request a cached
              variant in a few steps.
            </p>
          </div>
          <div className={styles.finalActions}>
            <Link
              className={clsx('button button--primary', styles.ctaPrimaryButton)}
              to="/docs/start-here/getting-started"
            >
              Get started
            </Link>
            <Link
              className={clsx('button button--secondary', styles.ctaSecondaryButton)}
              to="/docs/operate/deployment"
            >
              Deployment guide
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}
