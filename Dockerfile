FROM node:19-alpine as builder
WORKDIR /app

# This overrides the parameters during the build time.
# You have to do this as passing env variables alone (or via .env file) is not enough.
ARG NEXT_PUBLIC_RPC=https://rpc-osmosis.blockapsis.com
ARG NEXT_PUBLIC_REST=https://lcd-osmosis.blockapsis.com
ARG NEXT_PUBLIC_NETWORK=mainnet
ARG NEXT_PUBLIC_GQL=https://rpc-osmosis.blockapsis.com

COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN apk --update add patch
RUN patch next.config.js next-config.patch
RUN yarn build

FROM node:19-alpine as runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package.json .
COPY --from=builder /app/yarn.lock .
COPY --from=builder /app/next.config.js .
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]

# Labels
# https://github.com/opencontainers/image-spec/blob/main/annotations.md
LABEL org.opencontainers.image.title="mars-fe"
LABEL org.opencontainers.image.description="Mars Protocol Osmosis Outpost Frontend"
LABEL org.opencontainers.image.authors="andrey.arapov@nixaid.com"
LABEL org.opencontainers.image.source=https://github.com/mars-protocol/interface
