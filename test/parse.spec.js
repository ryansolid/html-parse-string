import { parse } from "../src";

describe("parse", () => {
  test("Simple div", () => {
    const html = "<div asd=23 qwe=\"1243423\"></div>";
    const result = parse(html);
    expect(result).toEqual([
      {
        type: "tag",
        name: "div",
        attrs: [
          { name: "asd", value: "23", type: 'attr' },
          { name: "qwe", value: "1243423", type: 'attr' }
        ],
        children: [],
        voidElement: false
      }
    ]);
  });

  test("With dynamic content", () => {
    const html = "<div qwe=#23#>###</div>";
    const result = parse(html);
    expect(result).toEqual([
      {
        type: "tag",
        name: "div",
        attrs: [
          { name: "qwe", value: "#23#", type: 'attr' }
        ],
        children: [
          { type: "text", content: "###" }
        ],
        voidElement: false
      }
    ]);
  });

  test("With use effect", () => {
    const html = "<div use:#1#=#2#>#3#</div>";
    const result = parse(html);
    expect(result).toEqual([
      {
        type: "tag",
        name: "div",
        attrs: [
          { name: "use:#1#", value: "#2#", type: 'directive' }
        ],
        children: [
          { type: "text", content: "#3#" }
        ],
        voidElement: false
      }
    ]);
  });
});