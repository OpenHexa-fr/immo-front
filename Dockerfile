# Build multi-stage : l'image finale ne contient que la sortie `standalone`
# (voir next.config.js), pas tout node_modules — image plus légère et
# démarrage par `node server.js` plutôt que le CLI `next start`, ce qui
# réduit le cold start (hébergement scale-to-zero).
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* est inliné par Next.js au moment du build, pas au runtime :
# doit donc être fourni en build arg (ex: http://immo-back:8000 dans docker-compose).
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Pas de dossier public/ dans ce repo à ce jour ; en ajouter un nécessitera
# d'ajouter ici `COPY --from=builder /app/public ./public`.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
