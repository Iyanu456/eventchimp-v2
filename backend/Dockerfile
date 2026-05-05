FROM node:20-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@10.33.3 --activate

WORKDIR /app

FROM base AS deps

COPY package.json pnpm-lock.yaml tsconfig.json ./
RUN pnpm install --frozen-lockfile

FROM deps AS build

COPY src ./src
RUN pnpm build

FROM base AS prod-deps

COPY package.json pnpm-lock.yaml tsconfig.json ./
RUN pnpm install --prod --frozen-lockfile

FROM node:20-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

EXPOSE 4000

USER node

CMD ["node", "dist/server.js"]
