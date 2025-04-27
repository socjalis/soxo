FROM node:lts-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock tsconfig.json tsconfig.build.json nest-cli.json src ./

RUN yarn install --production --frozen-lockfile

RUN yarn build

FROM node:lts-alpine AS production

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3000

CMD ["yarn", "start:prod"]