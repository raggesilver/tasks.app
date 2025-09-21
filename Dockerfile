FROM oven/bun:1-alpine AS base
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=bun,target=/root/.bun bun install --production --frozen-lockfile --ignore-scripts

FROM base AS build
RUN --mount=type=cache,id=bun,target=/root/.bun bun install --frozen-lockfile --ignore-scripts
RUN bun run build --preset=bun

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/.output /app/.output

EXPOSE 3000
CMD [ "bun", ".output/server/index.mjs" ]
