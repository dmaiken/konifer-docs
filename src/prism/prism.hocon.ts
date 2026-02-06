export const hoconGrammar = {
    comment: { pattern: /(\/\/|#).*/, greedy: true },
    property: [
        /(?:[\w\-]|[^:\+. \[\]{}=\"$\s\r\n]+)/,
        /"(?:\\. |[^"\r\n]*)"/
    ].map(r => ({
        pattern: new RegExp(r.source + '(?=\\s*(?:[\\.:= {]|\\+=))'),
        lookbehind: true,
        greedy: true,
    })),
    string: [
        { pattern: /"""[\s\S]*?"""/, greedy: true },
        { pattern: /(^|[^\\\\])"(?:\\. |[^"\\\r\n])*"/, lookbehind: true, greedy: true },
    ],
    punctuation: /[\${}\[\],]/,
    operator: /[:=]/,
    keyword: {
        pattern: /(?:^|\s)include(?=\s)/,
        lookbehind: true,
        greedy: true,
    },
    function: {
        pattern: /(?:^|\s)(file|url|classpath|required)(?=\()/,
        greedy: true,
    },
};
