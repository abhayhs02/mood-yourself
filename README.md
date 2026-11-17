# Mood Yourself

Mood Yourself is a small learning application built to understand end-to-end application delivery using React and AWS serverless services.

## Architecture

Frontend:
- React
- Vite
- Tailwind CSS

Backend:
- Python AWS Lambda
- Amazon API Gateway HTTP API

Data:
- Amazon DynamoDB for mood entries
- Amazon S3 for mood images

Infrastructure:
- Terraform

Authentication:
- Mock authentication currently
- Google/Cognito integration planned

## Repository Structure

```text
frontend/
  MoodYourself/

backend/
  moods-api/
  image-api/

infra/
  terraform/

## Current API

```text
GET /moods
PUT /moods
POST /moods/image-upload
GET /moods/image
