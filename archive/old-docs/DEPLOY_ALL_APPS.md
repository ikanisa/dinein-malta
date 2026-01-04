# 🚀 Deploy All 3 Apps to Cloud Run

## Overview

This guide will help you deploy all three DineIn apps to Google Cloud Run:

1. **dinein-universal** - Client/Vendor/Admin universal app (Vite React)
2. **dinein-admin** - Admin panel (Next.js)
3. **dinein-vendor** - Vendor app (Next.js)

---

## Prerequisites

1. **Authenticate with Google Cloud:**
   ```bash
   gcloud auth login
   ```

2. **Set your project:**
   ```bash
   gcloud config set project easymoai
   ```

---

## Quick Deploy (All 3 Apps)

### Option 1: Use Deployment Scripts (Recommended)

```bash
# Deploy Universal App
cd apps/universal
./deploy-cloud-run.sh

# Deploy Admin App
cd ../admin
./deploy-cloud-run.sh

# Deploy Vendor App
cd ../vendor
./deploy-cloud-run.sh
```

### Option 2: One-Line Commands (Using --source)

```bash
# Universal App
cd apps/universal && gcloud run deploy dinein-universal --source . --platform managed --region europe-west1 --allow-unauthenticated --port 8080 --memory 512Mi --cpu 1

# Admin App
cd apps/admin && gcloud run deploy dinein-admin --source . --platform managed --region europe-west1 --allow-unauthenticated --port 8080 --memory 512Mi --cpu 1

# Vendor App
cd apps/vendor && gcloud run deploy dinein-vendor --source . --platform managed --region europe-west1 --allow-unauthenticated --port 8080 --memory 512Mi --cpu 1
```

---

## Individual App Deployment

### 1. Deploy Universal App (Client/Vendor/Admin)

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

### 2. Deploy Admin App

```bash
cd apps/admin

gcloud run deploy dinein-admin \
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

### 3. Deploy Vendor App

```bash
cd apps/vendor

gcloud run deploy dinein-vendor \
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

---

## Configuration

- **Project ID:** `easymoai`
- **Region:** `europe-west1`
- **Memory:** 512Mi per service
- **CPU:** 1 per service
- **Port:** 8080 (all services)
- **Min Instances:** 0 (scale to zero)
- **Max Instances:** 10 per service

---

## Environment Variables

All apps have Supabase environment variables baked into their Dockerfiles:

- `NEXT_PUBLIC_SUPABASE_URL` / `VITE_SUPABASE_URL`: `https://elhlcdiosomutugpneoc.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY`: (baked into Dockerfile)

---

## After Deployment

### Get Service URLs

```bash
# Universal App
gcloud run services describe dinein-universal --region europe-west1 --format 'value(status.url)'

# Admin App
gcloud run services describe dinein-admin --region europe-west1 --format 'value(status.url)'

# Vendor App
gcloud run services describe dinein-vendor --region europe-west1 --format 'value(status.url)'
```

### List All Services

```bash
gcloud run services list --region europe-west1
```

---

## Update Existing Deployments

To update an existing deployment, simply run the same deploy command again:

```bash
cd apps/universal
gcloud run deploy dinein-universal --source . --platform managed --region europe-west1 --allow-unauthenticated --port 8080 --memory 512Mi --cpu 1
```

Cloud Run will automatically:
- Build a new container image
- Deploy it with zero downtime
- Switch traffic to the new version

---

## Troubleshooting

### Authentication Issues

If you get authentication errors:
```bash
gcloud auth login
```

### Build Errors

If builds fail, check:
1. All dependencies are in package.json
2. Next.js config has `output: 'standalone'` (already configured)
3. Dockerfile is correct (already created)

### Port Issues

Cloud Run automatically sets the `PORT` environment variable. Make sure your apps:
- Universal: Uses `PORT` env var (already configured)
- Admin/Vendor: Next.js standalone mode uses PORT automatically

---

## Cost Optimization

- **Min Instances = 0**: Services scale to zero when not in use (no cost)
- **Memory = 512Mi**: Reasonable for most workloads
- **CPU = 1**: Standard for web apps
- **Max Instances = 10**: Limits maximum cost

---

## Next Steps

1. ✅ Deploy all 3 apps
2. ✅ Get service URLs
3. ✅ Test each app in browser
4. ✅ Configure custom domains (optional)
5. ✅ Set up monitoring/alerts (optional)

