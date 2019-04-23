export interface IDom {
  type: string;
  content ? : string;
  voidElement: boolean;
  name: string;
  attrs: {};
  children: IDom[];
}

export declare function parse(html: string): Array<any>;
export declare function stringify(doc: IDom): string;