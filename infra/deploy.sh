#!/bin/bash
# deploy.sh
# Deploy backend to Google Cloud Run

set -e

PROJECT_ID="${GCP_PROJECT_ID:-your-gcp-project-id}"
SERVICE_NAME="live-accent-coach-backend"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "🚀 Deploying Live Accent Coach to Cloud Run..."
echo "Project: $PROJECT_ID"
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"

# Build Docker image
echo "📦 Building Docker image..."
docker build -t ${IMAGE_NAME}:latest .

# Push to Container Registry
echo "📤 Pushing image to Container Registry..."
docker push ${IMAGE_NAME}:latest

# Deploy to Cloud Run
echo "🌐 Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME}:latest \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --set-env-vars GCP_PROJECT_ID=${PROJECT_ID} \
  --memory 2Gi \
  --timeout 3600 \
  --max-instances 100

echo "✅ Deployment complete!"
echo "Service URL: https://${SERVICE_NAME}-xxxxxxx.${REGION}.run.app"
