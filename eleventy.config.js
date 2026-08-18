const Image = require("@11ty/eleventy-img");

module.exports = function (eleventyConfig) {
  // Zeilenumbrüche aus dem CMS (\n) als <br> ausgeben – für feste Umbrüche wie im Figma-Design
  eleventyConfig.addFilter("nl2br", (str) =>
    String(str ?? "").replace(/\r?\n/g, "<br>")
  );

  // Responsive Bilder: erzeugt beim Build automatisch WebP + mehrere Größen
  // aus jedem Bild – auch aus späteren CMS-Uploads.
  eleventyConfig.addNunjucksAsyncShortcode("img", async (src, alt, sizes, flagAttr) => {
    const metadata = await Image("src" + src, {
      widths: [480, 800, 1200, 1600, 2000],
      formats: ["webp", "jpeg"],
      outputDir: "_site/assets/optimized/",
      urlPath: "/assets/optimized/",
      filenameFormat: (id, s, width, format) =>
        `${s.split("/").pop().replace(/\.[^.]+$/, "")}-${width}.${format}`,
    });
    const attrs = {
      alt,
      sizes: sizes || "100vw",
      loading: "lazy",
      decoding: "async",
    };
    if (flagAttr) attrs[flagAttr] = "";
    return Image.generateHTML(metadata, attrs);
  });

  // Admin-Bereich nur kopieren, nicht als Seite verarbeiten (sonst landet er in der Sitemap)
  eleventyConfig.ignores.add("src/admin/**");

  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/admin");

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" }
  };
};
