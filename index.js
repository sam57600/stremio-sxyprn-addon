const { addonBuilder } = require("stremio-addon-sdk");
const axios = require("axios");
const cheerio = require("cheerio");

const BASE = "https://www.sxyprn.com";

const manifest = {
  id: "org.sxyprn.addon",
  version: "1.0.0",
  name: "SXYPRN",
  description: "Browse and watch videos from sxyprn.com",
  resources: ["catalog", "meta", "stream"],
  types: ["movie"],
  catalogs: [
    {
      type: "movie",
      id: "sxyprn_latest",
      name: "SXYPRN – Latest"
    }
  ]
};

const builder = new addonBuilder(manifest);

builder.defineCatalogHandler(async () => {
  const res = await axios.get(BASE);
  const $ = cheerio.load(res.data);
  const metas = [];

  $(".video-item").each((_, el) => {
    const a = $(el).find("a");
    const href = a.attr("href");
    const title = a.attr("title");
    const poster = $(el).find("img").attr("data-src") || $(el).find("img").attr("src");

    if (href) {
      metas.push({
        id: href,
        type: "movie",
        name: title || "Video",
        poster
      });
    }
  });

  return { metas };
});

builder.defineMetaHandler(async ({ id }) => {
  const res = await axios.get(BASE + id);
  const $ = cheerio.load(res.data);

  return {
    meta: {
      id,
      type: "movie",
      name: $("h1").first().text().trim() || "Video",
      poster: $("video").attr("poster")
    }
  };
});

builder.defineStreamHandler(async ({ id }) => {
  const res = await axios.get(BASE + id);
  const $ = cheerio.load(res.data);
  const streams = [];

  $("video source").each((_, el) => {
    const src = $(el).attr("src");
    const type = $(el).attr("type");
    if (src) {
      streams.push({
        title: type || "Video",
        url: src
      });
    }
  });

  return { streams };
});

require("http")
  .createServer(builder.getInterface())
  .listen(7000, () => {
    console.log("Addon SXYPRN running at http://localhost:7000/manifest.json");
  });