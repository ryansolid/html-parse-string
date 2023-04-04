// Based on package html-parse-stringify2
// Expanded to handle webcomponents

/**
 * @param {import('../types/index').IDom['attrs']} attrs 
 * @returns {string}
 */
function attrString(attrs) {
  const buff = [];
  for (const attr of attrs) {
    buff.push(attr.name + '="' + attr.value.replace(/"/g, '&quot;') + '"');
  }
  if (!buff.length) {
    return '';
  }
  return ' ' + buff.join(' ');
};

/**
 * @param {string} buff 
 * @param {import('../types/index').IDom} doc 
 * @returns {string}
 */
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

/**
 * @param {import('../types/index').IDom[]} doc 
 * @returns {string}
 */
export function stringify(doc) {
  return doc.reduce(function (token, rootEl) {
    return token + stringifier('', rootEl);
  }, '');
};