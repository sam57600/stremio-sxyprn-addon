const { addonBuilder } = require("stremio-addon-sdk");
const axios = require("axios");
const cheerio = require("cheerio");
const http = require("http");

// SITE FICTIF — ÉDUCATIF
const BASE_URL = "https://www.sxyprn.com";

const manifest = {
  id: "org.educational.sxyprn",
  version: "1.0.0",
  name: "sxyprn Educational Addon",
  description: "Educational example of a Stremio addon with HTML parsing",
  resources: ["catalog", "meta", "stream"],
  types: ["movie"],
  catalogs: [
    {
      type: "movie",
      id: "sxyprn_latest",
      name: "sxyprn – Latest Videos"
    }
  ]
};

const builder = new addonBuilder(manifest);

/**
 * CATALOG
 * Simule un scraping HTML d’une page listant des vidéos
 */
builder.defineCatalogHandler(async () => {
  const res = await axios.get(BASE_URL);
  const $ = cheerio.load(res.data);

  const metas = [];

  $(".video-item").each((_, el) => {
    const link = $(el).find("a").attr("href");
    const title = $(el).find(".title").text();
    const poster = $(el).find("img").attr("src");

    if (link) {
      metas.push({
        id: link,
        type: "movie",
        name: title || "Educational Video",
        poster
      });
    }
  });

  return { metas };
});

/**
 * META
 * Récupère les infos d’une vidéo individuelle
 */
builder.defineMetaHandler(async ({ id }) => {
  const res = await axios.get(BASE_URL + id);
  const $ = cheerio.load(res.data);

  return {
    meta: {
      id,
      type: "movie",
      name: $("h1").first().text() || "Educational Video",
      poster: $("video").attr("poster")
    }
  };
});

/**
 * STREAM
 * Extrait des URLs vidéo directes depuis le HTML
 */
builder.defineStreamHandler(async ({ id }) => {
  const res = await axios.get(BASE_URL + id);
  const $ = cheerio.load(res.data);

  const streams = [];

  $("video source").each((_, el) => {
    const src = $(el).attr("src");
    const type = $(el).attr("type");

    if (src) {
      streams.push({
        title: type || "Direct Video",
        url: src
      });
    }
  });

  return { streams };
});

/**
 * SERVEUR HTTP (Render / local)
 */
http
  .createServer(builder.getInterface())
  .listen(process.env.PORT || 7000, () => {
    console.log("Educational addon running");
  });
