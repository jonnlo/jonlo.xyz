import Markdoc from '@markdoc/markdoc';

export function renderNowText(source) {
  const document = Markdoc.parse(source);
  const errors = Markdoc.validate(document);
  if (errors.some(({ error }) => error.level === 'critical' || error.level === 'error')) {
    throw new Error('Invalid rich text in a Now activity. Check its formatting in Keystatic.');
  }
  return Markdoc.renderers.html(Markdoc.transform(document, {
    nodes: { document: { render: 'div' } },
  }));
}
