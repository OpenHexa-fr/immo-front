/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image de prod bien plus légère (pas tout node_modules) et démarrage par
  // `node server.js` au lieu du CLI `next start` — réduit le cold start sur
  // Azure Container Apps (min-replicas 0). Voir Dockerfile.
  output: "standalone",
};

module.exports = nextConfig;
