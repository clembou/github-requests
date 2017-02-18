import React from 'react';
import marked from 'marked';

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false
});

const MarkdownBlock = props => <div dangerouslySetInnerHTML={{ __html: marked(props.body) }} />;

export default MarkdownBlock;
