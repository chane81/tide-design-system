# 문서 사이트(Storybook 정적 빌드)를 nginx로 서빙한다(spec 문서 앱 「배포」: Dockerfile(pnpm build → nginx)).
# Dokploy가 main을 받아 이 파일로 빌드한다. build context는 저장소 루트다:
#   docker build -f apps/docs/Dockerfile .
# 저장소와 같은 Node 26, pnpm 12.18.0을 쓴다. Node 25부터 corepack이 Node에 들어 있지 않아 npm으로 pnpm을 설치한다.

FROM node:26-slim AS build
RUN npm install --global pnpm@12.18.0
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile
# docs의 build는 turbo `^build`로 foundation·icons·components를 먼저 빌드한다.
RUN pnpm turbo run build --filter=@tide-design/docs

FROM nginx:1.30-alpine
COPY --from=build /repo/apps/docs/storybook-static /usr/share/nginx/html
# 이미지 기본 default.conf에 Cache-Control만 더한 설정(apps/docs/nginx.conf, 티켓 44).
COPY apps/docs/nginx.conf /etc/nginx/conf.d/default.conf
