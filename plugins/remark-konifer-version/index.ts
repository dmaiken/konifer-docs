type MarkdownNode = {
  type?: string;
  value?: string;
  children?: MarkdownNode[];
};

type Options = {
  version: string;
  clientVersion: string;
};

const versionToken = '{{koniferVersion}}';
const clientVersionToken = '{{koniferClientVersion}}';

export default function remarkKoniferVersion({version, clientVersion}: Options) {
  return (tree: MarkdownNode): void => {
    function replaceVersionToken(node: MarkdownNode): void {
      if ((node.type === 'code' || node.type === 'inlineCode') && node.value) {
        node.value = node.value
          .replaceAll(versionToken, version)
          .replaceAll(clientVersionToken, clientVersion);
      }

      node.children?.forEach(replaceVersionToken);
    }

    replaceVersionToken(tree);
  };
}
