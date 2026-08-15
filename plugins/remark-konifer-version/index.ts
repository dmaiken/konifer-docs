type MarkdownNode = {
  type?: string;
  value?: string;
  children?: MarkdownNode[];
};

type Options = {
  version: string;
};

const versionToken = '{{koniferVersion}}';

export default function remarkKoniferVersion({version}: Options) {
  return (tree: MarkdownNode): void => {
    function replaceVersionToken(node: MarkdownNode): void {
      if ((node.type === 'code' || node.type === 'inlineCode') && node.value) {
        node.value = node.value.replaceAll(versionToken, version);
      }

      node.children?.forEach(replaceVersionToken);
    }

    replaceVersionToken(tree);
  };
}
