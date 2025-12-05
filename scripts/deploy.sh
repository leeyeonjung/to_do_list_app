#!/bin/bash
set -e

ENV=$1
echo "🚀 Deploying environment: $ENV"

echo "📦 Loading Docker images..."
docker load < backend.tar.gz
docker load < frontend.tar.gz

echo "🚀 Applying docker-compose..."
docker compose up -d

echo "🎉 Deployment complete!"
docker compose ps
