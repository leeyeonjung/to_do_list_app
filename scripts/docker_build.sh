#!/bin/bash
set -e

ENV=$1

echo "🔨 Building Docker images for ENV=$ENV"

mkdir -p images

echo "📦 Building Backend Image..."
docker build -t todolist_backend:$ENV ../backend
docker save todolist_backend:$ENV | gzip > images/backend.tar.gz

echo "📦 Building Frontend Image..."
docker build -t todolist_frontend:$ENV ../frontend
docker save todolist_frontend:$ENV | gzip > images/frontend.tar.gz

echo "✅ Docker Images Exported to deploy/images/"
