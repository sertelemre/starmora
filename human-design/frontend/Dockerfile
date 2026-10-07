FROM node:22-alpine AS build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
COPY backend/internal/app/reading.go backend/internal/app/reading_themes.go backend/internal/app/reading_en.go backend/internal/app/reading_en_themes.go backend/internal/app/errors.en.json /app/backend/internal/app/
RUN npm run build && npm run check:seo
FROM nginx:stable-alpine
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/dist /usr/share/nginx/html
COPY --from=build /app/frontend/dist/csp-header.conf /etc/nginx/starmora-csp.conf
RUN chmod -R a+rX /usr/share/nginx/html && rm /usr/share/nginx/html/csp-header.conf
EXPOSE 80
