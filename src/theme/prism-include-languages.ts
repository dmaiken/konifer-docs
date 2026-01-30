// src/theme/prism-include-languages.ts
import siteConfig from '@generated/docusaurus.config';
import type * as PrismNamespace from 'prismjs';
// Import your custom grammar definition
import { hoconGrammar } from '../prism/prism.hocon';

export default function prismIncludeLanguages(PrismObject: typeof PrismNamespace): void {
    const {
        themeConfig: {prism},
    } = siteConfig;

    const {additionalLanguages} = prism as { additionalLanguages: string[] };

    // Make Prism global
    globalThis.Prism = PrismObject;

    // 1. Load the standard languages defined in your config
    additionalLanguages.forEach((lang) => {
        // eslint-disable-next-line global-require, import/no-dynamic-require
        require(`prismjs/components/prism-${lang}`);
    });

    // 2. Inject your custom HOCON grammar
    PrismObject.languages.hocon = hoconGrammar;

    // 3. Cleanup: Remove Prism from global scope to keep things clean
    delete globalThis.Prism;
}
