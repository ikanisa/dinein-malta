# 🚀 Deploy to Cloud Run - Quick Guide

## Step 1: Authenticate with Google Cloud

```bash
gcloud auth login
```

This will open a browser window for you to authenticate.

---

## Step 2: Deploy (Choose One Method)

### Method 1: Automatic Build & Deploy (Recommended) ⭐

This uses Cloud Build automatically - no Docker needed locally!

```bash
cd apps/universal

gcloud run deploy dinein-universal \
  --source . \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10
```

### Method 2: Using Deployment Script

```bash
cd apps/universal
./deploy-cloud-run.sh
```

### Method 3: Manual Build & Deploy

```bash
cd apps/universal

# Build with Cloud Build
gcloud builds submit --tag gcr.io/easymoai/dinein-universal:latest

# Deploy to Cloud Run
gcloud run deploy dinein-universal \
  --image gcr.io/easymoai/dinein-universal:latest \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi
```

---

## Configuration

- **Project ID:** `easymoai`
- **Region:** `europe-west1`
- **Service Name:** `dinein-universal`
- **Memory:** 512Mi
- **CPU:** 1
- **Port:** 8080

---

## Environment Variables

The Supabase URL and anon key are already baked into the Dockerfile build, so they're included automatically.

---

## After Deployment

The service URL will be displayed. You can also get it with:

```bash
gcloud run services describe dinein-universal \
  --region europe-west1 \
  --format 'value(status.url)'
```

---

## Quick One-Liner (After Auth)

```bash
cd apps/universal && gcloud run deploy dinein-universal --source . --platform managed --region europe-west1 --allow-unauthenticated --port 8080 --memory 512Mi --cpu 1
```

