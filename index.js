const { addonBuilder } = require("stremio-addon-sdk");
const axios = require("axios");
const cheerio = require("cheerio");
const http = require("http");

/**
 * SITE FICTIF — À BUT PÉDAGOGIQUE
 * Remplacer XXXXX par n’importe quel site HTML public
 */
const BASE_URL = "https://www.sxyprn.com";

/**
 * MANIFEST STREMIO
 */
const manifest = {
  id: "org.generic.html.addon",
  version: "1.0.0",
  name: "Generic HTML Video Addon",
  description: "Educational generic addon using HTML scraping",
  resources: ["catalog", "meta", "stream"],
  types: ["movie"],
  catalogs: [
    {
      type: "movie",
      id: "generic_latest",
      name: "Generic Website Videos"
    }
  ]
};

const builder = new addonBuilder(manifest);

/**
 * =========================
 * CATALOG HANDLER
 * =========================
 * Suppose une page listant des vidéos
 */
builder.defineCatalogHandler(async () => {
  const res = await axios.get(BASE_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  const $ = cheerio.load(res.data);
  const metas = [];

  /**
   * STRUCTURE HTML ATTENDUE (EXEMPLE) :
   * <div class="video-item">
   *   <a href="/video/123" title="Titre">
   *     <img src="poster.jpg">
   *   </a>
   * </div>
   */
  $(".video-item").each((_, el) => {
    const link = $(el).find("a").attr("href");
    const title = $(el).find("a").attr("title");
    const poster = $(el).find("img").attr("src");

    if (link) {
      metas.push({
        id: link,
        type: "movie",
        name: title || "Untitled video",
        poster
      });
    }
  });

  return { metas };
});

/**
 * =========================
 * META HANDLER
 * =========================
 * Suppose une page vidéo individuelle
 */
builder.defineMetaHandler(async ({ id }) => {
  const res = await axios.get(BASE_URL + id, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  const $ = cheerio.load(res.data);

  /**
   * STRUCTURE HTML ATTENDUE :
   * <h1>Titre</h1>
   * <video poster="poster.jpg">
   */
  return {
    meta: {
      id,
      type: "movie",
      name: $("h1").first().text() || "Untitled video",
      poster: $("video").attr("poster")
    }
  };
});

/**
 * =========================
 * STREAM HANDLER
 * =========================
 * Suppose des URLs vidéo directes
 */
builder.defineStreamHandler(async ({ id }) => {
  const res = await axios.get(BASE_URL + id, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  const $ = cheerio.load(res.data);
  const streams = [];

  /**
   * STRUCTURE HTML ATTENDUE :
   * <video>
   *   <source src="video.mp4" type="video/mp4">
   * </video>
   */
  $("video source").each((_, el) => {
    const src = $(el).attr("src");
    const type = $(el).attr("type");

    if (src) {
      streams.push({
        title: type || "Video stream",
        url: src
      });
    }
  });

  return { streams };
});

/**
 * =========================
 * HTTP SERVER (RENDER OK)
 * =========================
 */
const port = process.env.PORT || 7000;

http.createServer(builder.getInterface()).listen(port, () => {
  console.log("Generic educational addon running on port " + port);
});
