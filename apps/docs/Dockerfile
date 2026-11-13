# Dokploy가 main을 받아 이 파일로 빌드한다. build context는 저장소 루트다: docker build -f apps/docs/Dockerfile .
# Node 25부터 corepack이 빠져 npm으로 pnpm을 설치한다.

FROM node:26-slim AS build
RUN npm install --global pnpm@12.18.0
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@tide-design/docs

FROM nginx:1.30-alpine
COPY --from=build /repo/apps/docs/storybook-static /usr/share/nginx/html
COPY apps/docs/nginx.conf /etc/nginx/conf.d/default.conf
