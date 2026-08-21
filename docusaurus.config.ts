import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkKoniferVersion from './plugins/remark-konifer-version';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const latestReleaseUrl = 'https://api.github.com/repos/dmaiken/konifer/releases/latest';

type GitHubRelease = {
  tag_name?: unknown;
};

async function fetchLatestKoniferVersion(): Promise<string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2026-03-10',
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(latestReleaseUrl, {
    headers,
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    throw new Error(
      `Unable to fetch the latest Konifer release from GitHub: ${response.status} ${response.statusText}`,
    );
  }

  const release = (await response.json()) as GitHubRelease;
  if (typeof release.tag_name !== 'string') {
    throw new Error('The latest Konifer release did not contain a tag name.');
  }

  const match = /^v?(\d+\.\d+\.\d+)$/.exec(release.tag_name);
  if (!match) {
    throw new Error(`The latest Konifer release tag is not a stable semantic version: ${release.tag_name}`);
  }

  // Konifer's Git tags include "v", while its container tags do not.
  return match[1];
}

const buildConfig = (koniferVersion: string): Config => ({
  title: 'Konifer',
  tagline: 'Image storage, transformation, and delivery',
  favicon: 'img/favicon.png',
  trailingSlash: false,

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  url: 'https://konifer.io',
  baseUrl: '/',

  // GitHub pages deployment config.
  organizationName: 'dmaiken13',
  projectName: 'Konifer',

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  onDuplicateRoutes: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          routeBasePath: 'docs',
          sidebarPath: './sidebars.ts',
          remarkPlugins: [[remarkKoniferVersion, {version: koniferVersion}]],
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: ['@docusaurus/theme-mermaid'],

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'throw',
      onBrokenMarkdownImages: 'throw',
    },
  },

  plugins: [
    [
      './plugins/guarded-gtag/index.cjs',
      {
        trackingID: 'G-888P26DBCE',
        anonymizeIP: true,
      },
    ],
  ],

  themeConfig: {
    mermaid: {
      theme: {
        light: 'neutral',
        dark: 'dark',
      },
    },
    algolia: {
      appId: 'LR90ZF2B4S',
      apiKey: '5963eb82452e74cb8eef210aadc73c1c',
      indexName: 'Konifer Documentation',
      contextualSearch: true,
      searchPagePath: 'search',
      insights: false,
    },
    image: 'img/konifer-small.png',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Konifer',
      logo: {
        alt: 'Konifer Logo',
        src: 'img/konifer-small.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          to: '/docs/start-here/getting-started',
          label: 'Getting Started',
          position: 'left',
        },
        {
          href: 'https://github.com/dmaiken/konifer',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `Copyright © ${new Date().getFullYear()} Daniel Aiken. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: [
        'http',
        'json',
        'bash'
      ],
    },
  } satisfies Preset.ThemeConfig,
});

export default async function createConfig(): Promise<Config> {
  return buildConfig(await fetchLatestKoniferVersion());
}
