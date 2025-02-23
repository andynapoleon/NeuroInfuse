@echo off
setlocal

:: Set your project ID here
set PROJECT_ID=neuroinfuse
set REGION=us-central1
set REPOSITORY=neuroinfuse
set IMAGE_NAME=neuroinfuse-service

:: Login to Google Cloud (if not already logged in)
gcloud auth login

:: Configure Docker authentication
gcloud auth configure-docker %REGION%-docker.pkg.dev

:: Set the project
gcloud config set project %PROJECT_ID%

:: Enable required services
gcloud services enable artifactregistry.googleapis.com
gcloud services enable aiplatform.googleapis.com
gcloud services enable compute.googleapis.com

:: Create Artifact Registry repository
gcloud artifacts repositories create %REPOSITORY% --repository-format=docker --location=%REGION%

:: Build and push the container
gcloud builds submit --tag %REGION%-docker.pkg.dev/%PROJECT_ID%/%REPOSITORY%/%IMAGE_NAME%

echo Setup complete!
echo Your container image is available at: %REGION%-docker.pkg.dev/%PROJECT_ID%/%REPOSITORY%/%IMAGE_NAME%

pause
