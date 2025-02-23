echo off
setlocal

:: Set your variables
set PROJECT_ID=neuroinfuse
set REGION=us-central1
set REPOSITORY=neuroinfuse
set IMAGE_NAME=neuroinfuse-service

:: Deploy to Vertex AI
gcloud ai endpoints create ^
    --region=%REGION% ^
    --display-name=neuroinfuse-endpoint

:: Deploy the model
gcloud ai models upload ^
    --region=%REGION% ^
    --display-name=neuroinfuse-model ^
    --container-image-uri=%REGION%-docker.pkg.dev/%PROJECT_ID%/%REPOSITORY%/%IMAGE_NAME% ^
    --artifact-uri=gs://%PROJECT_ID%-model-artifacts ^
    --container-predict-route=/api/infuse ^
    --container-health-route=/health

echo Deployment complete!
pause
