// Based on package html-parse-stringify2
// Expanded to handle webcomponents

const tagRE = /(?:<!--[\S\s]*?-->|<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>)/g;

// See https://regexr.com/6p8p0
const attrRE = /(?:\s(?<boolean>[^/\s><=]+?)(?=[\s/>]))|(?:(?<name>\S+?)(?:\s*=\s*(?:(['"])(?<value1>[\s\S]*?)\3|(?<value2>[^\s>]+))))/g
//                   ^ capture group 1: boolean attribute name (attributes without values)
//                                                         ^ capture group 2: non-boolean attribue name
//                                                                                         ^ capture group 4: non-boolean attribue value with quotes
//                                                                                                               ^ capture group 5: non-boolean attribue value without quotes
// TODO
//  - "/" values in the middle of the HTML tag (they don't self-close the element, but skipped)
//  - What other cases?


const lookup = {
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

function parseTag(/**@type {string}*/tag) {
  let i = 0;
  const res = {
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
  const matches = tag.matchAll(reg)
  const matchesArray = Array.from(matches)

  // for (const match of matches) {
  // for (const match of matchesArray) {
  for (let i = 0, l = matchesArray.length; i < l; i += 1) {
    const match = matchesArray[i]

    // TODO named groups method not working yet, groups is undefined in tests (maybe not out in Node.js yet)
    // const groups = match.groups
    // res.attrs[groups.boolean || groups.name] = groups.value1 || groups.value2 || ""

    res.attrs[match[1] || match[2]] = match[4] || match[5] || ''
  }

  return res
};

// common logic for pushing a child node onto a list
function pushTextNode(list, html, start) {
  // calculate correct end of the content slice in case there's
  // no tag after the text node.
  const end = html.indexOf('<', start);
  const content = html.slice(start, end === -1 ? void 0 : end);
  if (!/^\s*$/.test(content)) {
    list.push({
      type: 'text',
      content: content
    });
  }
};

function pushCommentNode(list, tag) {
  // calculate correct end of the content slice in case there's
  // no tag after the text node.
  const content = tag.replace('<!--', '').replace('-->', '');
  if (!/^\s*$/.test(content)) {
    list.push({
      type: 'comment',
      content: content
    });
  }
};


export function parse(html) {
  const result = [];
  let current = void 0;
  let level = -1;
  const arr = [];
  const byTag = {};
  html.replace(tagRE, (tag, index) => {
    const isOpen = tag.charAt(1) !== '/';
    const isComment = tag.slice(0, 4) === '<!--';
    const start = index + tag.length;
    const nextChar = html.charAt(start);
    let parent = void 0;
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
