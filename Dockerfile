# Putzbetrieb: Produktions-Image (Node-Server mit SQLite)
# Bauen:   docker build -t reinigungsmanager .
# Starten: siehe docker-compose.yml (mit https über Caddy)

FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:24-slim
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    RESCH_DB=/data/resch.db \
    BODY_SIZE_LIMIT=26214400 \
    TZ=Europe/Berlin
WORKDIR /app
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY scripts/backup.mjs ./scripts/backup.mjs
# Datenbank-Ordner gehört dem unprivilegierten Benutzer „node“
RUN mkdir /data && chown node:node /data
USER node
VOLUME /data
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/session').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "build"]
