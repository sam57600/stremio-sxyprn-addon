const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");

const builder = new addonBuilder({
  id: "org.sxyprn.addon",
  version: "1.0.0",
  name: "SXYPRN Test",
  description: "Addon Stremio avec catalogue et vidéo test",
  resources: ["catalog", "meta", "stream"],
  types: ["movie"],
  catalogs: [
    {
      type: "movie",
      id: "test_catalog",
      name: "Catalogue Test"
    }
  ]
});

// Catalogue
builder.defineCatalogHandler(async () => {
  return {
    metas: [
      {
        id: "test_video_1",
        type: "movie",
        name: "Vidéo Test",
        poster: "https://www.w3schools.com/html/pic_trulli.jpg"
      }
    ]
  };
});

// Meta
builder.defineMetaHandler(async ({ id }) => {
  return {
    meta: {
      id,
      type: "movie",
      name: "Vidéo Test",
      poster: "https://www.w3schools.com/html/pic_trulli.jpg",
      description: "Ceci est une vidéo de test pour Stremio"
    }
  };
});

// Stream
builder.defineStreamHandler(async ({ id }) => {
  return {
    streams: [
      {
        title: "Vidéo Test",
        url: "https://www.w3schools.com/html/mov_bbb.mp4"
      }
    ]
  };
});

// Serveur compatible Render
serveHTTP(builder.getInterface(), {
  port: process.env.PORT || 7000
});
