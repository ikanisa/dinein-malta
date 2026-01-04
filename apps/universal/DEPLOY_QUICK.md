# Quick Cloud Run Deployment

## Prerequisites Check

1. **Set your GCP Project ID:**
   ```bash
   export GCP_PROJECT_ID=your-project-id
   gcloud config set project $GCP_PROJECT_ID
   ```

2. **Enable Required APIs:**
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

3. **Authenticate Docker:**
   ```bash
   gcloud auth configure-docker
   ```

## Deploy

```bash
cd apps/universal
./deploy-cloud-run.sh
```

## Or Deploy Manually

```bash
cd apps/universal

# Build
docker build -t gcr.io/YOUR_PROJECT_ID/dinein-universal:latest .

# Push
docker push gcr.io/YOUR_PROJECT_ID/dinein-universal:latest

# Deploy
gcloud run deploy dinein-universal \
  --image gcr.io/YOUR_PROJECT_ID/dinein-universal:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --set-env-vars "VITE_SUPABASE_URL=https://elhlcdiosomutugpneoc.supabase.co" \
  --set-env-vars "VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaGxjZGlvc29tdXR1Z3BuZW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MDU3NTMsImV4cCI6MjA3NDQ4MTc1M30.d92ZJG5E_9r7bOlRLBXRI6gcB_7ERVbL-Elp7fk4avY"
```

