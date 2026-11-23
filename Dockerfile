FROM node:22-alpine AS api-build
WORKDIR /build/yama-server
COPY yama-server/package.json yama-server/package-lock.json ./
RUN npm ci
COPY yama-server/ ./
RUN npm run build

FROM node:22-alpine AS frontend-build
WORKDIR /build/react-webpack-boilerplate
COPY react-webpack-boilerplate/package.json react-webpack-boilerplate/package-lock.json ./
RUN npm ci
COPY react-webpack-boilerplate/ ./
ARG YANDEX_MAPS_API_URL=https://api-maps.yandex.ru/v3/
ARG YANDEX_MAPS_API_KEY
ARG YANDEX_MAPS_LANGUAGE=ru_RU
ENV YANDEX_MAPS_API_URL=$YANDEX_MAPS_API_URL
ENV YANDEX_MAPS_API_KEY=$YANDEX_MAPS_API_KEY
ENV YANDEX_MAPS_LANGUAGE=$YANDEX_MAPS_LANGUAGE
RUN npm run build:prod

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY yama-server/package.json yama-server/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=api-build /build/yama-server/dist ./dist
COPY --from=frontend-build /build/react-webpack-boilerplate/build ./public
COPY docker/init-db.js ./init-db.js
COPY docker/start.sh ./start.sh
RUN chmod 0555 ./start.sh && chown -R node:node /app
USER node
EXPOSE 4000
CMD ["./start.sh"]
