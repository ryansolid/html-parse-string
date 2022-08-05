# html-parse-string
HTML parse and stringify utils

## Installation

```
npm install html-parse-string
```

## IDom
basic data structure
```
export interface IDom {
  type: string;
  content ? : string;
  voidElement: boolean;
  name: string;
  attrs: { [key: string]: any };
  children: IDom[];
}

```

## parse  
parse html to idom array  
```
const { parse, stringify } = require('html-parse-string');
const t = `<div>this is div</div>`;
console.log(parse(t));
```
get idom array
```
[
  {
    type: "tag",
    name: "div",
    voidElement: false,
    attrs: {},
    children: [
      {
        type: "text",
        content: "this is div",
      },
    ],
  },
];
```
## stringify
stringify idom array to html
```
const { parse, stringify } = require('html-parse-string');
const t = `<div>this is div</div>`;
const ast = parse(t);
console.log(stringify(ast));
```  
get html string
```
<div>this is div</div>
```