FROM node:24-alpine AS build

WORKDIR /app
RUN npm install --global pnpm@11.19.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN CI=true pnpm install --frozen-lockfile

COPY index.html tsconfig.json ./
COPY src ./src
COPY public ./public
RUN pnpm build

FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
