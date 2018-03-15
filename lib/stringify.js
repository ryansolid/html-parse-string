// Based on package html-parse-stringify2
// Expanded to handle webcomponents

var attrString, stringify;

attrString = function (attrs) {
  var buff, key;
  buff = [];
  for (key in attrs) {
    buff.push(key + '="' + attrs[key] + '"');
  }
  if (!buff.length) {
    return '';
  }
  return ' ' + buff.join(' ');
};

stringify = function (buff, doc) {
  switch (doc.type) {
    case 'text':
      return buff + doc.content;
    case 'tag':
      buff += '<' + doc.name + (doc.attrs ? attrString(doc.attrs) : '') + (doc.voidElement ? '/>' : '>');
      if (doc.voidElement) {
        return buff;
      }
      return buff + doc.children.reduce(stringify, '') + '</' + doc.name + '>';
    case 'comment':
      return buff += '<!--' + doc.content + '-->';
  }
};

module.exports = function (doc) {
  return doc.reduce(function (token, rootEl) {
    return token + stringify('', rootEl);
  }, '');
};