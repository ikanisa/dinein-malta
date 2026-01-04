# Local Docker Deployment Guide

Since Docker is now running, you can use local Docker builds for faster development cycles.

## Quick Local Build & Deploy

```bash
cd apps/universal

# Build locally with Docker
docker build -t gcr.io/easymoai/dinein-universal:latest .

# Push to Container Registry
docker push gcr.io/easymoai/dinein-universal:latest

# Deploy to Cloud Run
gcloud run deploy dinein-universal \
  --image gcr.io/easymoai/dinein-universal:latest \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi
```

## Test Locally First

Before deploying, you can test the Docker image locally:

```bash
# Build the image
docker build -t dinein-universal:local .

# Run locally on port 8080
docker run -p 8080:8080 dinein-universal:local

# Test in browser: http://localhost:8080
```

## One-Command Deploy

Use the deployment script:

```bash
cd apps/universal
./deploy-cloud-run.sh
```

## Benefits of Local Docker

1. **Faster iterations** - Test builds locally before pushing
2. **Offline development** - Build without Cloud Build quota
3. **Debugging** - Easier to debug build issues locally
4. **Cost savings** - Avoid Cloud Build minutes for testing

---

**Current Deployment Status:** ✅ Live at https://dinein-universal-423260854848.europe-west1.run.app

