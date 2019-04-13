// Based on package html-parse-stringify2
// Expanded to handle webcomponents

var attrRE, lookup, parseTag, pushCommentNode, pushTextNode, tagRE;

tagRE = /(?:<!--[\S\s]*?-->|<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>)/g;

attrRE = /([^\t\n\f \/><"'=]+)|(['"])(.*?)\2/g;

lookup = {
  area: true,
  base: true,
  br: true,
  col: true,
  embed: true,
  hr: true,
  img: true,
  input: true,
  keygen: true,
  link: true,
  menuitem: true,
  meta: true,
  param: true,
  source: true,
  track: true,
  wbr: true
};

parseTag = function (tag) {
  var i, key, res;
  i = 0;
  key = void 0;
  res = {
    type: 'tag',
    name: '',
    voidElement: false,
    attrs: {},
    children: []
  };
  tag.replace(attrRE, function (match) {
    if (i % 2) {
      key = match;
    } else {
      if (i === 0) {
        if (lookup[match] || tag.charAt(tag.length - 2) === '/') {
          res.voidElement = true;
        }
        res.name = match;
      } else {
        res.attrs[key] = match.replace(/^['"]|['"]$/g, '');
      }
    }
    i++;
  });
  return res;
};

// common logic for pushing a child node onto a list
pushTextNode = function (list, html, start) {
  var content, end;
  // calculate correct end of the content slice in case there's
  // no tag after the text node.
  end = html.indexOf('<', start);
  content = html.slice(start, end === -1 ? void 0 : end);
  if (!/^\s*$/.test(content)) {
    list.push({
      type: 'text',
      content: content
    });
  }
};

pushCommentNode = function (list, tag) {
  var content;
  // calculate correct end of the content slice in case there's
  // no tag after the text node.
  content = tag.replace('<!--', '').replace('-->', '');
  if (!/^\s*$/.test(content)) {
    list.push({
      type: 'comment',
      content: content
    });
  }
};


export function parse(html) {
  var arr, byTag, current, level, result;
  result = [];
  current = void 0;
  level = -1;
  arr = [];
  byTag = {};
  html.replace(tagRE, function (tag, index) {
    var isComment, isOpen, nextChar, parent, start;
    isOpen = tag.charAt(1) !== '/';
    isComment = tag.slice(0, 4) === '<!--';
    start = index + tag.length;
    nextChar = html.charAt(start);
    parent = void 0;
    if (isOpen && !isComment) {
      level++;
      current = parseTag(tag);
      if (!current.voidElement && nextChar && nextChar !== '<') {
        pushTextNode(current.children, html, start);
      }
      byTag[current.tagName] = current;
      // if we're at root, push new base node
      if (level === 0) {
        result.push(current);
      }
      parent = arr[level - 1];
      if (parent) {
        parent.children.push(current);
      }
      arr[level] = current;
    }
    if (isComment) {
      if (level < 0) {
        pushCommentNode(result, tag);
      } else {
        pushCommentNode(arr[level].children, tag);
      }
    }
    if (isComment || !isOpen || current.voidElement) {
      if (!isComment) {
        level--;
      }
      if (nextChar !== '<' && nextChar) {
        // trailing text node
        // if we're at the root, push a base text node. otherwise add as
        // a child to the current node.
        parent = level === -1 ? result : arr[level].children;
        pushTextNode(parent, html, start);
      }
    }
  });
  return result;
};
