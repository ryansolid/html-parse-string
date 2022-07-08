// Based on package html-parse-stringify2
// Expanded to handle webcomponents

function attrString(attrs) {
  const buff = [];
  for (const key in attrs) {
    buff.push(key + '="' + attrs[key].replace(/"/g, '&quot;') + '"');
  }
  if (!buff.length) {
    return '';
  }
  return ' ' + buff.join(' ');
};

function stringifier(buff, doc) {
  switch (doc.type) {
    case 'text':
      return buff + doc.content;
    case 'tag':
      buff += '<' + doc.name + (doc.attrs ? attrString(doc.attrs) : '') + (doc.voidElement ? '/>' : '>');
      if (doc.voidElement) {
        return buff;
      }
      return buff + doc.children.reduce(stringifier, '') + '</' + doc.name + '>';
    case 'comment':
      return buff += '<!--' + doc.content + '-->';
  }
};

export function stringify(doc) {
  return doc.reduce(function (token, rootEl) {
    return token + stringifier('', rootEl);
  }, '');
};