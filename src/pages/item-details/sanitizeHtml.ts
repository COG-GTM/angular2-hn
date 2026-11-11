const allowedTags = new Set('a abbr b blockquote br code dd del div dl dt em h1 h2 h3 h4 h5 h6 hr i img ins kbd li ol p pre q s small span strong sub sup table tbody td th thead tr u ul'.split(' '));
const allowedAttributes = new Set('alt class colspan height rowspan target title width'.split(' '));

export function sanitizeHtml(html: string): string {
  const template = document.createElement('template');
  template.innerHTML = html;
  function clean(parent: DocumentFragment | Element) {
    for (const node of Array.from(parent.children)) {
      const tag = node.tagName.toLowerCase();
      if (['script', 'style', 'template'].includes(tag)) { node.remove(); continue; }
      clean(node);
      if (!allowedTags.has(tag)) { node.replaceWith(...node.childNodes); continue; }
      for (const attribute of Array.from(node.attributes)) {
        const name = attribute.name.toLowerCase();
        if (name === 'href' || name === 'src' || name === 'cite') {
          const value = Array.from(attribute.value).filter(character => character.charCodeAt(0) > 32).join('');
          if (/^(javascript|vbscript|data):/i.test(value)) node.setAttribute(name, `unsafe:${attribute.value}`);
        } else if (!allowedAttributes.has(name)) node.removeAttribute(name);
      }
      if (tag === 'a' && node.hasAttribute('target')) node.setAttribute('rel', 'noopener noreferrer');
    }
  }
  clean(template.content);
  return template.innerHTML;
}
