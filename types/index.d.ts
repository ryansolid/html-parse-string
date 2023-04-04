export interface IDom {
  type: string;
  content ? : string;
  voidElement: boolean;
  name: string;
  attrs: { type: 'attr' | 'directive', name: string, value: string}[];
  children: IDom[];
}

export declare function parse(html: string): IDom[];
export declare function stringify(doc: IDom[]): string;