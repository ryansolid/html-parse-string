// Based on package html-parse-stringify2
// Expanded to handle webcomponents

var attrRE, lookup, parseTag, pushCommentNode, pushTextNode, tagRE;

tagRE = /(?:<!--[\S\s]*?-->|<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>)/g;

attrRE = /\s([^'"/\s><]+?)[\s/>]|([^\s=]+)=\s?(".*?"|'.*?')/g

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
  const tagMatch = tag.match(/<\/?([^\s]+?)[/\s>]/)
  if (tagMatch) {
    res.name = tagMatch[1]
    if (
      lookup[tagMatch[1].toLowerCase()] ||
      tag.charAt(tag.length - 2) === '/'
    ) {
      res.voidElement = true
    }

    // handle comment tag
    if (res.name.startsWith('!--')) {
      const endIndex = tag.indexOf('-->')
      return {
        type: 'comment',
        comment: endIndex !== -1 ? tag.slice(4, endIndex) : '',
      }
    }
  }
  const reg = new RegExp(attrRE)
  let result = null
  for (;;) {
    result = reg.exec(tag)

    if (result === null) {
      break
    }

    if (!result[0].trim()) {
      continue
    }

    if (result[1]) {
      const attr = result[1].trim()
      let arr = [attr, '']

      if (attr.indexOf('=') > -1) {
        arr = attr.split('=')
      }

      res.attrs[arr[0]] = arr[1]
      reg.lastIndex--
    } else if (result[2]) {
      res.attrs[result[2]] = result[3].trim().substring(1, result[3].length - 1)
    }
  }

  return res
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
