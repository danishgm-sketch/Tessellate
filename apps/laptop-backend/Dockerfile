FROM node:24.20.0-bookworm-slim
RUN npm install --global pnpm@11.20.0 && mkdir -p /app /data && chown node:node /app /data
WORKDIR /app
COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --chown=node:node apps/api/package.json apps/api/package.json
COPY --chown=node:node apps/laptop-backend/package.json apps/laptop-backend/package.json
COPY --chown=node:node packages/schemas/package.json packages/schemas/package.json
USER node
RUN pnpm --filter @tessellate/laptop-backend... install --frozen-lockfile
COPY --chown=node:node tsconfig.base.json ./
COPY --chown=node:node apps/api/ apps/api/
COPY --chown=node:node apps/laptop-backend/ apps/laptop-backend/
COPY --chown=node:node packages/schemas/ packages/schemas/
WORKDIR /app/apps/laptop-backend
ENV WRANGLER_SEND_METRICS=false CLOUDFLARE_CF_FETCH_ENABLED=false CI=true HOME=/tmp
EXPOSE 8787
CMD ["sh", "start.sh"]
