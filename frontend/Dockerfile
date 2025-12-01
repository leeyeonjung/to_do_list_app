FROM node:18-alpine AS builder

WORKDIR /app

# API URL 전달 (React 환경변수)
ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# npm 설치
COPY package*.json ./
RUN npm install

# 소스 복사 및 빌드
COPY . .

# React 빌드
RUN echo "Using API URL: $REACT_APP_API_URL"
RUN npm run build

# -------------------------
# 2) Production (Nginx)
# -------------------------
FROM nginx:alpine

# 빌드 결과 복사
COPY --from=builder /app/build /usr/share/nginx/html

# Nginx 설정 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]