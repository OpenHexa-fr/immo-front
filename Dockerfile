FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
# NEXT_PUBLIC_* est inliné par Next.js au moment du build, pas au runtime :
# doit donc être fourni en build arg (ex: http://immo-back:8000 dans docker-compose).
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build
CMD ["npm", "start"]
