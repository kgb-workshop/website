module.exports = function(eleventyConfig) {
  const result = {
    templateFormats: [
      "html",
      "jpg",
      "js",
      "liquid",
      "json",
      "ico", // for favicon
      "css" // css is not yet a valid template extension
    ],
    passthroughFileCopy: true,
    dir: {
      output: "docs"
    }
  };

  return result;
};
