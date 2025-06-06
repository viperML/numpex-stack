FROM node:20

WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Better caching
COPY . .
RUN pnpm run build

ENV NODE_ENV=production
EXPOSE 8080
ENV PORT=8080
ENV HOST=0.0.0.0

CMD ["node", "dist/server/entry.mjs"]