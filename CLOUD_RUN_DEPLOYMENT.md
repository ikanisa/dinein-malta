# Cloud Run Deployment Guide
## DineIn Malta - Universal App

This guide covers deploying the DineIn Universal app to Google Cloud Run.

---

## Prerequisites

1. **Google Cloud Project**
   - Create or select a GCP project
   - Enable Cloud Run API
   - Enable Container Registry API

2. **gcloud CLI**
   ```bash
   # Install gcloud CLI
   # https://cloud.google.com/sdk/docs/install
   
   # Authenticate
   gcloud auth login
   
   # Set default project
   gcloud config set project YOUR_PROJECT_ID
   ```

3. **Docker**
   - Docker Desktop or Docker Engine installed
   - Docker authenticated to GCP:
     ```bash
     gcloud auth configure-docker
     ```

---

## Quick Deployment

### Option 1: Automated Script (Recommended)

```bash
cd apps/universal

# Set your GCP project ID
export GCP_PROJECT_ID=your-project-id
export GCP_REGION=us-central1

# Run deployment script
./deploy-cloud-run.sh
```

### Option 2: Manual Deployment

```bash
cd apps/universal

# 1. Build Docker image
docker build -t gcr.io/YOUR_PROJECT_ID/dinein-universal:latest .

# 2. Push to Container Registry
docker push gcr.io/YOUR_PROJECT_ID/dinein-universal:latest

# 3. Deploy to Cloud Run
gcloud run deploy dinein-universal \
  --image gcr.io/YOUR_PROJECT_ID/dinein-universal:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1
```

### Option 3: Cloud Build (CI/CD)

```bash
# Submit build to Cloud Build
gcloud builds submit --config cloudbuild.yaml
```

---

## Configuration

### Environment Variables

The deployment script sets these environment variables automatically:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

**Note:** For production, consider using Secret Manager for sensitive values:

```bash
# Create secrets
gcloud secrets create supabase-anon-key --data-file=supabase-key.txt

# Deploy with secrets
gcloud run deploy dinein-universal \
  --image gcr.io/YOUR_PROJECT_ID/dinein-universal:latest \
  --update-secrets=VITE_SUPABASE_ANON_KEY=supabase-anon-key:latest
```

### Resource Limits

Current configuration:
- **Memory:** 512Mi (minimum recommended)
- **CPU:** 1 (can scale to handle traffic)
- **Min Instances:** 0 (cost-effective, cold starts possible)
- **Max Instances:** 10 (adjust based on traffic)
- **Timeout:** 300 seconds

Adjust as needed:
```bash
gcloud run services update dinein-universal \
  --memory 1Gi \
  --cpu 2 \
  --min-instances 1 \
  --max-instances 100 \
  --region us-central1
```

---

## Custom Domain (Optional)

1. **Map Custom Domain:**
   ```bash
   gcloud run domain-mappings create \
     --service dinein-universal \
     --domain yourdomain.com \
     --region us-central1
   ```

2. **Update DNS:**
   - Add the provided DNS records to your domain
   - Wait for DNS propagation

---

## Monitoring & Logs

### View Logs
```bash
gcloud run services logs read dinein-universal --region us-central1
```

### View Metrics
- Go to Cloud Run Console
- Select your service
- View metrics, logs, and revisions

### Set Up Alerts
1. Go to Cloud Monitoring
2. Create alert policies for:
   - High error rate
   - High latency
   - Resource usage

---

## Updating the Deployment

### Update Code
```bash
cd apps/universal

# Rebuild and redeploy
./deploy-cloud-run.sh
```

### Rollback
```bash
# List revisions
gcloud run revisions list --service dinein-universal --region us-central1

# Rollback to previous revision
gcloud run services update-traffic dinein-universal \
  --to-revisions REVISION_NAME=100 \
  --region us-central1
```

---

## Cost Optimization

1. **Set Min Instances to 0** (already configured)
   - No cost when idle
   - Cold starts on first request

2. **Use Request-based Pricing**
   - Pay only for requests
   - First 2 million requests/month free

3. **Monitor Usage**
   - Set up billing alerts
   - Review Cloud Run metrics regularly

---

## Troubleshooting

### Build Fails
- Check Docker is running: `docker ps`
- Verify Dockerfile syntax
- Check build logs for errors

### Deployment Fails
- Verify gcloud is authenticated: `gcloud auth list`
- Check project permissions
- Verify Cloud Run API is enabled

### App Not Loading
- Check service logs: `gcloud run services logs read`
- Verify environment variables are set
- Check service URL is accessible

### CORS Issues
- Ensure Supabase allows your Cloud Run domain
- Check CORS settings in Supabase Dashboard

---

## Security Considerations

1. **HTTPS:** Cloud Run provides HTTPS automatically
2. **Authentication:** Currently set to `--allow-unauthenticated`
   - For production, consider requiring authentication
3. **Secrets:** Use Secret Manager for sensitive values
4. **Network:** Consider VPC connector for private resources

---

## Next Steps

After deployment:

1. ✅ Test the deployed application
2. ✅ Set up monitoring and alerts
3. ✅ Configure custom domain (optional)
4. ✅ Set up CI/CD pipeline (optional)
5. ✅ Review and optimize costs

---

**Service URL:** Will be displayed after deployment  
**Dashboard:** https://console.cloud.google.com/run

