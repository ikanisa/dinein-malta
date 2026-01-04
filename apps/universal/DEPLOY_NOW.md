# Deploy to Cloud Run - Instructions

## Option 1: Using Cloud Build (No Docker Required) ⭐ Recommended

Cloud Build will build and deploy everything in the cloud - no need for local Docker!

```bash
cd apps/universal

# Deploy using Cloud Build
gcloud builds submit --tag gcr.io/easymoai/dinein-universal:latest

# Deploy to Cloud Run
gcloud run deploy dinein-universal \
  --image gcr.io/easymoai/dinein-universal:latest \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1
```

## Option 2: Start Docker and Use Script

1. **Start Docker Desktop** (if installed)

2. **Run deployment script:**
   ```bash
   cd apps/universal
   ./deploy-cloud-run.sh
   ```

## Option 3: Manual Docker Build

1. **Start Docker Desktop**

2. **Build and deploy:**
   ```bash
   cd apps/universal
   
   # Build
   docker build -t gcr.io/easymoai/dinein-universal:latest .
   
   # Push
   docker push gcr.io/easymoai/dinein-universal:latest
   
   # Deploy
   gcloud run deploy dinein-universal \
     --image gcr.io/easymoai/dinein-universal:latest \
     --platform managed \
     --region europe-west1 \
     --allow-unauthenticated \
     --port 8080 \
     --memory 512Mi
   ```

---

## Quick Deploy (One Command)

```bash
cd apps/universal && gcloud builds submit --tag gcr.io/easymoai/dinein-universal:latest && gcloud run deploy dinein-universal --image gcr.io/easymoai/dinein-universal:latest --platform managed --region europe-west1 --allow-unauthenticated --port 8080 --memory 512Mi
```

---

## After Deployment

The service URL will be displayed. You can also get it with:

```bash
gcloud run services describe dinein-universal --region europe-west1 --format 'value(status.url)'
```

---

**Note:** The Supabase environment variables are already baked into the Dockerfile, so they'll be included in the build automatically.

