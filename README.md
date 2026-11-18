# Mood Yourself

A small full-stack serverless application built as a hands-on learning project for understanding modern application development using:

- React
- Vite
- Tailwind CSS
- AWS API Gateway
- AWS Lambda
- Python
- DynamoDB
- Amazon S3
- IAM
- Terraform
- Git / GitHub
- GitHub Actions
- OAuth / OIDC authentication

Mood Yourself is intentionally a small application.

The goal is not to build a complicated product. The goal is to understand the complete lifecycle of a real cloud application from:

Frontend → API → Backend → Database → Object Storage → Infrastructure as Code → CI/CD → Authentication

---

# Project Purpose

Mood Yourself is a daily journal application where a user can select a date and record:

- a short mood/reflection
- an optional mood image

The application displays seven days at a time in a weekly calendar.

Users can navigate between weeks and create or update entries for:

- past dates
- today
- future dates

Each logical journal entry belongs to one user and one date.

Example:

```text
User: abhay-test-user

2026-11-01
├── Mood: Relaxed
└── Image: users/abhay-test-user/2026-11-01/...

2026-11-02
├── Mood: Productive
└── Image: users/abhay-test-user/2026-11-02/...

2026-11-03
├── Mood: Learning AWS
└── Image: users/abhay-test-user/2026-11-03/...
```

---

# Why This Project Exists

This project is primarily a learning environment.

The larger goal is to understand how a real React + AWS application works without learning AWS services independently and without context.

Instead of studying:

```text
React
Lambda
API Gateway
DynamoDB
S3
IAM
Terraform
CI/CD
```

as unrelated technologies, Mood Yourself connects them together through one real application.

The learning model is:

```text
Build something
      ↓
Understand why it works
      ↓
Understand each technology involved
      ↓
Automate it
      ↓
Secure it
```

---

# High-Level Architecture

```text
                       User
                         │
                         ▼
                 React + Vite
                         │
                  services/api.js
                         │
                         ▼
                  API Gateway
                    HTTP API
                  /             \
                 /               \
                ▼                 ▼
        Moods API Lambda     Image API Lambda
             │                  /       \
             │                 /         \
             ▼                ▼           ▼
          DynamoDB        DynamoDB        S3
             │                              │
             │                              │
             └──────── imageKey ────────────┘
```

The core application flow is:

```text
React
  ↓
API Gateway
  ↓
Lambda
  ↓
AWS services
```

React never communicates directly with DynamoDB.

---

# Technology Stack

## Frontend

- React
- Vite
- JavaScript
- Tailwind CSS
- Lucide React
- Native Fetch API

## Backend

- Python
- AWS Lambda
- boto3

## API

- Amazon API Gateway
- HTTP API v2

## Database

- Amazon DynamoDB

## Object Storage

- Amazon S3

## Security

- AWS IAM
- Private S3 bucket
- S3 Block Public Access
- Presigned URLs
- OAuth / OIDC authentication planned

## Infrastructure

- Terraform
- HashiCorp AWS Provider

## Source Control

- Git
- GitHub

## CI/CD

Planned:

- GitHub Actions
- GitHub OIDC
- Automated Lambda deployment
- Terraform validation / plan / apply workflow

---

# Current Architecture

```text
Browser
   │
   ▼
React
   │
   │ HTTPS
   ▼
API Gateway
   │
   ├──────────────────────┐
   ▼                      ▼
Moods Lambda          Image Lambda
   │                  │         │
   ▼                  ▼         ▼
DynamoDB           DynamoDB     S3
```

---

# Repository Structure

```text
mood-yourself/
│
├── frontend/
│   └── MoodYourself/
│       │
│       ├── public/
│       │
│       ├── src/
│       │   │
│       │   ├── components/
│       │   │   └── LoginComponent.jsx
│       │   │
│       │   ├── pages/
│       │   │   └── MoodInputScreen.jsx
│       │   │
│       │   ├── services/
│       │   │   └── api.js
│       │   │
│       │   ├── App.jsx
│       │   ├── main.jsx
│       │   └── index.css
│       │
│       ├── .env.example
│       ├── package.json
│       ├── vite.config.js
│       └── index.html
│
├── backend/
│   │
│   ├── moods-api/
│   │   ├── lambda_function.py
│   │   └── requirements.txt
│   │
│   └── image-api/
│       ├── lambda_function.py
│       └── requirements.txt
│
├── infra/
│   └── terraform/
│       ├── versions.tf
│       ├── providers.tf
│       ├── variables.tf
│       ├── dynamodb.tf
│       ├── s3.tf
│       ├── iam.tf
│       ├── lambda.tf
│       ├── api_gateway.tf
│       ├── outputs.tf
│       └── .terraform.lock.hcl
│
├── .gitignore
└── README.md
```

---

# Frontend Architecture

The frontend intentionally remains small.

```text
main.jsx
   │
   ▼
App.jsx
   │
   ├── LoginComponent.jsx
   │
   └── MoodInputScreen.jsx
             │
             ▼
       services/api.js
             │
             ▼
        API Gateway
```

`main.jsx` starts React.

`App.jsx` currently manages the application's temporary authentication state.

`LoginComponent.jsx` represents the login experience.

`MoodInputScreen.jsx` contains the weekly calendar and mood editor.

`services/api.js` is the boundary between the frontend and backend.

---

# Why `services/api.js` Exists

The React UI should not need to understand:

- Lambda names
- DynamoDB
- boto3
- IAM
- AWS regions
- Lambda handlers

The screen calls functions such as:

```javascript
getWeekMoods(...)
saveMood(...)
requestImageUpload(...)
uploadImageToS3(...)
```

The service layer translates those operations into HTTP requests.

Architecture:

```text
MoodInputScreen.jsx
        │
        ▼
   services/api.js
        │
        ▼
      fetch()
        │
        ▼
   API Gateway
```

---

# Mood Data Flow

When the application loads a week:

```text
React
  │
  │ GET /moods
  ▼
API Gateway
  │
  ▼
MoodYourself-MoodsApi
  │
  │ DynamoDB Query
  ▼
MoodYourself table
  │
  ▼
Lambda response
  │
  ▼
React state
  │
  ▼
Weekly calendar
```

---

# Saving a Mood

The frontend sends:

```json
{
  "mood": "Feeling productive today",
  "moodDate": "2026-11-03",
  "imageKey": null
}
```

The request follows:

```text
React
  ↓
PUT /moods
  ↓
API Gateway
  ↓
MoodYourself-MoodsApi
  ↓
DynamoDB PutItem
```

---

# DynamoDB

## Table

```text
MoodYourself
```

## Partition Key

```text
userId
```

Type:

```text
String
```

## Sort Key

```text
moodDate
```

Type:

```text
String
```

Together:

```text
userId + moodDate
```

uniquely identify a daily mood entry.

Example:

```text
abhay-test-user + 2026-11-03
```

---

# DynamoDB Item Example

```json
{
  "userId": "abhay-test-user",
  "moodDate": "2026-11-03",
  "mood": "Learning AWS serverless architecture",
  "imageKey": "users/abhay-test-user/2026-11-03/mood-image-abcd1234.jpg",
  "updatedAt": "2026-11-03T08:30:00+00:00"
}
```

DynamoDB does not require us to predefine `mood`, `imageKey`, or `updatedAt` as table columns.

Only attributes participating in keys/indexes needed to be defined when creating the table.

---

# Creating vs Updating a Mood

Suppose DynamoDB already contains:

```text
userId:
abhay-test-user

moodDate:
2026-11-03
```

Saving another mood for the same date writes against the same key.

Therefore:

```text
BEFORE

abhay-test-user
2026-11-03
"Feeling good"


       PUT /moods


AFTER

abhay-test-user
2026-11-03
"Feeling great"
```

A second row is not created for the same:

```text
userId + moodDate
```

---

# API Gateway

API:

```text
MoodYourselfApi
```

Protocol:

```text
HTTP API
```

Current routes:

```text
GET  /moods

PUT  /moods

POST /moods/image-upload

GET  /moods/image
```

---

# API Route Architecture

```text
GET /moods
      │
      ▼
Moods integration
      │
      ▼
MoodYourself-MoodsApi


PUT /moods
      │
      ▼
Moods integration
      │
      ▼
MoodYourself-MoodsApi


POST /moods/image-upload
      │
      ▼
Image integration
      │
      ▼
MoodYourself-ImageApi


GET /moods/image
      │
      ▼
Image integration
      │
      ▼
MoodYourself-ImageApi
```

The current manually created API Gateway environment contains separate integrations per route even when routes invoke the same Lambda. Terraform has adopted those existing resources rather than silently redesigning them during migration.

---

# Moods Lambda

AWS function:

```text
MoodYourself-MoodsApi
```

Repository:

```text
backend/moods-api/
```

Handler:

```text
lambda_function.lambda_handler
```

Runtime:

```text
Python 3.14
```

Responsibilities:

```text
GET /moods
→ retrieve moods between startDate and endDate

PUT /moods
→ create/update a mood
```

Environment variable:

```text
MOODS_TABLE=MoodYourself
```

Temporary development user:

```text
abhay-test-user
```

This hardcoded identity will be removed when real authentication is implemented.

---

# Image Lambda

AWS function:

```text
MoodYourself-ImageApi
```

Repository:

```text
backend/image-api/
```

Handler:

```text
lambda_function.lambda_handler
```

Runtime:

```text
Python 3.14
```

Responsibilities:

```text
POST /moods/image-upload

GET /moods/image
```

The Image Lambda generates temporary S3 access URLs.

Environment variables include:

```text
MOOD_IMAGES_BUCKET

MOODS_TABLE
```

---

# Why Images Are Stored in S3

DynamoDB stores structured application data.

S3 stores binary objects.

We intentionally do NOT store the actual image binary inside DynamoDB.

Instead:

```text
DynamoDB

imageKey:
users/abhay-test-user/2026-11-03/photo.jpg
```

references:

```text
S3

actual JPEG / PNG / WebP binary object
```

This separates:

```text
Structured data
→ DynamoDB

Object/file storage
→ S3
```

---

# Image Upload Flow

The browser does not send the entire image through Lambda.

Instead:

```text
React
  │
  │ POST /moods/image-upload
  ▼
API Gateway
  │
  ▼
Image Lambda
  │
  │ generate_presigned_url()
  ▼
Presigned PUT URL
  │
  ▼
React
  │
  │ PUT image binary
  ▼
S3
```

After upload, React stores the returned:

```text
imageKey
```

alongside the mood entry through:

```text
PUT /moods
```

---

# Why Presigned URLs Are Used

The S3 bucket remains private.

```text
Block Public Access = ON
```

The browser receives temporary permission to interact with one specific object through a signed URL.

This avoids:

```text
Public S3 bucket
```

and avoids putting:

```text
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```

inside the frontend.

---

# Image Object Structure

Objects use a structure similar to:

```text
users/
└── abhay-test-user/
    └── 2026-11-03/
        └── mood-image-abc123.jpg
```

This provides logical separation by:

```text
user
  ↓
date
  ↓
image
```

---

# Supported Image Types

The frontend and backend currently accept:

```text
JPEG
PNG
WEBP
```

Frontend maximum:

```text
5 MB
```

---

# S3 Security Model

The image bucket remains private.

```text
S3
├── Block Public ACLs       ON
├── Block Public Policy     ON
├── Ignore Public ACLs      ON
└── Restrict Public Buckets ON
```

Private-image access is designed around temporary signed URLs.

---

# Local Development Port

Mood Yourself uses a dedicated Vite development port:

```text
http://localhost:5176
```

This avoids conflicts with other projects that may already use:

```text
5173
5174
```

Vite is configured with a fixed port and should use:

```text
5176
```

for local development.

---

# CORS

Both API Gateway and S3 need CORS because the browser communicates directly with both.

Development origin:

```text
http://localhost:5176
```

## API Gateway

Allows the frontend to call:

```text
GET
PUT
POST
OPTIONS
```

as required by the application's API.

## S3

Allows browser interaction required for private object upload/retrieval patterns.

Terraform is now the source of truth for these CORS settings.

---

# IAM

IAM follows the principle of least privilege.

The Mood Lambda has permissions required to work with the mood table.

Examples:

```text
dynamodb:GetItem
dynamodb:PutItem
dynamodb:Query
```

The Image Lambda has permissions required for:

```text
s3:GetObject
s3:PutObject
dynamodb:GetItem
```

The Lambdas also use:

```text
AWSLambdaBasicExecutionRole
```

for basic Lambda logging/execution capabilities.

API Gateway receives resource-based permission to invoke the Lambda functions.

---

# Terraform

Infrastructure is managed under:

```text
infra/terraform/
```

Terraform converts infrastructure setup from:

```text
AWS Console
→ manually create resources
→ manually remember configuration
```

into:

```text
Terraform code
→ terraform plan
→ review
→ terraform apply
```

---

# Terraform Files

```text
infra/terraform/
│
├── versions.tf
├── providers.tf
├── variables.tf
├── dynamodb.tf
├── s3.tf
├── iam.tf
├── lambda.tf
├── api_gateway.tf
├── outputs.tf
└── .terraform.lock.hcl
```

## `versions.tf`

Defines Terraform and provider requirements.

## `providers.tf`

Configures the AWS provider.

## `variables.tf`

Contains configurable values such as:

```text
AWS region
S3 bucket name
Lambda role names
frontend development origin
```

## `dynamodb.tf`

Defines the MoodYourself DynamoDB table.

## `s3.tf`

Defines:

```text
image bucket
public-access blocking
CORS
```

## `iam.tf`

Defines:

```text
Lambda execution roles
trust policies
DynamoDB permissions
S3 permissions
basic execution policy attachments
```

## `lambda.tf`

Defines Lambda infrastructure/configuration including:

```text
function names
runtime
handler
memory
timeout
environment variables
execution role
```

Lambda application source remains under:

```text
backend/
```

## `api_gateway.tf`

Defines:

```text
HTTP API
CORS
$default stage
Lambda integrations
routes
Lambda invoke permissions
```

## `outputs.tf`

Exposes useful infrastructure values.

---

# Terraform Region

Current AWS development region:

```text
ap-southeast-2
```

AWS Region:

```text
Asia Pacific (Sydney)
```

---

# Terraform Migration

The AWS infrastructure was originally created manually through the AWS Console.

Terraform was introduced afterward.

Therefore existing resources were adopted using:

```text
terraform import
```

rather than recreated.

The migration followed:

```text
Manual AWS resource
        ↓
Terraform configuration
        ↓
terraform import
        ↓
Terraform state
        ↓
terraform plan
        ↓
resolve drift
        ↓
zero-change plan
```

This teaches an important real-world Terraform scenario:

> Infrastructure as Code is often introduced after a proof of concept already exists.

---

# Terraform State

Terraform state connects:

```text
Terraform resource address
        ↓
actual AWS resource
```

For example:

```text
aws_dynamodb_table.moods
```

corresponds to:

```text
MoodYourself
```

Terraform state must not be committed as normal application source.

Ignored files include:

```text
*.tfstate
*.tfstate.*
*.tfplan
.terraform/
```

The provider lock file:

```text
.terraform.lock.hcl
```

is intended to support reproducible provider selection.

---

# Terraform Workflow

Typical workflow:

```bash
terraform fmt
terraform validate
terraform plan
terraform apply
```

Preferred review flow:

```bash
terraform plan -out=tfplan
terraform apply tfplan
```

This ensures the reviewed plan is the plan being applied.

---

# Terraform Safety Rule

Before applying infrastructure:

```text
Unknown resource create     → STOP
Unknown resource destroy    → STOP
Unexpected replacement      → STOP
Known intentional update    → REVIEW
```

A successful infrastructure migration should ultimately reach:

```text
terraform plan

No changes.
Your infrastructure matches the configuration.
```

---

# AWS CloudShell

Because the corporate development machine does not currently permit local AWS CLI installation without administrator access, AWS CloudShell is used as an authenticated Terraform execution environment.

Current workflow:

```text
Laptop / VS Code
      │
      │ edit
      ▼
Git
      │
      │ push
      ▼
GitHub
      │
      │ pull
      ▼
AWS CloudShell
      │
      │ Terraform
      ▼
AWS
```

CloudShell is not the source of truth.

The Git repository is the source of truth.

Infrastructure code should be edited in the repository rather than maintained independently in CloudShell.

---

# Running the Frontend

Navigate to:

```bash
cd frontend/MoodYourself
```

Install packages:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Application:

```text
http://localhost:5176
```

---

# Frontend Environment Configuration

Create:

```text
frontend/MoodYourself/.env.local
```

Example:

```text
VITE_API_URL=<API_GATEWAY_INVOKE_URL>
```

Do not append:

```text
/moods
```

The frontend service layer adds route paths.

Do not place secrets inside `VITE_` variables.

Values exposed through Vite are available to browser-side JavaScript.

---

# Git Ignore Rules

The repository should ignore at minimum:

```gitignore
# Environment
.env
.env.local
.env.*.local

# Node
node_modules/
dist/

# Python
__pycache__/
*.pyc
*.pyo
.venv/
venv/

# Lambda packages
*.zip

# Terraform
.terraform/
*.tfstate
*.tfstate.*
*.tfplan
crash.log
crash.*.log

# Logs
*.log

# IDE / OS
.vscode/
.idea/
.DS_Store
```

Never commit:

```text
AWS keys
AWS secrets
OAuth client secrets
presigned S3 URLs
Terraform state
real sensitive user data
```

---

# Authentication Status

Authentication is not yet production-ready.

The current learning implementation uses a temporary/mock frontend login and a temporary backend identity:

```text
abhay-test-user
```

This allows us to learn the application architecture independently before adding identity complexity.

The intended authentication flow is:

```text
User
  ↓
Google login
  ↓
Amazon Cognito
  ↓
OAuth / OIDC
  ↓
JWT
  ↓
React
  ↓
API Gateway authentication
  ↓
Lambda
  ↓
authenticated user identity
```

Eventually:

```python
user_id = "abhay-test-user"
```

will be removed.

The backend will determine the user from validated identity claims.

---

# Planned Private Image Retrieval

The S3 bucket will remain private.

Display flow:

```text
React
  ↓
authenticated API request
  ↓
Image Lambda
  ↓
IAM
  ↓
generate temporary presigned GET URL
  ↓
React
  ↓
<img src="temporary-url">
  ↓
private S3 object
```

S3 does not need to become publicly readable.

---

# Development Status

## Working

```text
React frontend                         ✅
Tailwind UI                            ✅
Weekly calendar                        ✅
Past-date editing                      ✅
Current-date editing                   ✅
Future-date editing                    ✅

Frontend API service layer             ✅

API Gateway HTTP API                   ✅

Python Lambda backend                  ✅

GET mood data                          ✅
Create/update mood data                ✅

DynamoDB persistence                   ✅

Private S3 bucket                      ✅
Image upload authorization             ✅
Presigned image upload                 ✅
imageKey persistence                   ✅

IAM roles and policies                 ✅

Terraform                              ✅
Existing-resource import               ✅
Infrastructure drift management        ✅

Git / GitHub repository workflow       ✅
```

## Still Planned / Learning

```text
Production authentication              ⏳
Google federation / Cognito             ⏳
JWT API authorization                   ⏳

Complete authenticated image access     ⏳

Backend automated tests                 ⏳
Frontend automated tests                ⏳

GitHub Actions CI                       ⏳
GitHub → AWS OIDC                       ⏳
Automated Lambda deployment             ⏳
Terraform automated plan/apply          ⏳

Frontend cloud hosting                  ⏳
Production domain                       ⏳
Production CORS                         ⏳
```

---

# What Can You Learn Through This Mini Project?

This project is divided into phases so each architectural concept can be understood independently before introducing the next layer.

---

## Phase 1 — Build the Application Manually

**Goal:** Understand how the complete application works before automating it.

One-line description:

> Build the complete React → API Gateway → Lambda → DynamoDB/S3 application manually so every cloud component can be understood individually.

### Phase 1A — React Frontend

Learn:

```text
React components
React state
props
useEffect
forms
file inputs
weekly calendar logic
loading state
error handling
service-layer separation
Tailwind CSS
Vite
environment variables
```

Key architecture:

```text
App.jsx
├── LoginComponent.jsx
└── MoodInputScreen.jsx
          ↓
      services/api.js
```

---

## Phase 1B — AWS Lambda

**Goal:** Understand serverless backend execution.

One-line description:

> Learn how Python code becomes an event-driven AWS backend without managing an application server.

Learn:

```text
lambda_handler(event, context)
Lambda runtime
Python
boto3
environment variables
CloudWatch logs
IAM execution roles
structured responses
Lambda errors
```

You also learn an important debugging path:

```text
React reports HTTP 500
      ↓
API Gateway
      ↓
Lambda
      ↓
CloudWatch
      ↓
actual Python exception
```

---

## Phase 1C — DynamoDB

**Goal:** Understand serverless NoSQL persistence.

One-line description:

> Store one user/date journal entry using a DynamoDB partition key and sort key.

Learn:

```text
NoSQL
Item
Attribute
Partition Key
Sort Key
Query
GetItem
PutItem
boto3
record overwrite behavior
```

Data model:

```text
Partition Key:
userId

Sort Key:
moodDate
```

---

## Phase 1D — API Gateway

**Goal:** Understand how a browser reaches Lambda through HTTP.

One-line description:

> Expose Lambda functionality as clean HTTP routes consumed by the React frontend.

Learn:

```text
HTTP
GET
PUT
POST
JSON
request body
query parameters
HTTP status codes
API routes
Lambda proxy integrations
CORS
```

Routes:

```text
GET  /moods
PUT  /moods

POST /moods/image-upload
GET  /moods/image
```

---

## Phase 1E — S3 and Presigned URLs

**Goal:** Understand private object storage.

One-line description:

> Store image binaries privately in S3 while storing only their stable object keys in DynamoDB.

Learn:

```text
S3 buckets
S3 objects
object keys
private buckets
Block Public Access
PutObject
GetObject
presigned URLs
S3 CORS
browser direct upload
```

Architecture:

```text
DynamoDB
→ mood metadata

S3
→ actual image
```

---

## Phase 1F — IAM and Least Privilege

**Goal:** Understand AWS permissions.

One-line description:

> Give each Lambda only the AWS permissions necessary for its responsibilities.

Learn:

```text
IAM role
execution role
trust policy
identity-based policy
resource-based Lambda permission
least privilege
service principal
ARN
```

This explains the difference between:

```text
User authentication
```

and:

```text
AWS service authorization
```

---

# Phase 2 — Production Engineering

Phase 1 proves the application works.

Phase 2 asks:

> How do we reliably manage and deliver this application as engineers rather than manually through AWS Console?

---

## Phase 2 — Part 1: Terraform / Infrastructure as Code

**Status: Completed**

One-line description:

> Convert manually created AWS infrastructure into declarative Terraform configuration and bring existing resources under Terraform state.

Learn:

```text
Infrastructure as Code
HCL
provider
resource
variable
local
output
state
terraform init
terraform fmt
terraform validate
terraform plan
terraform apply
terraform import
drift detection
provider lock file
```

Infrastructure covered includes:

```text
DynamoDB
S3
S3 Public Access Block
S3 CORS
IAM
Lambda configuration
API Gateway
API Gateway CORS
API Gateway stage
API integrations
API routes
Lambda invoke permissions
```

Major lesson:

```text
Configuration
      ↕
Terraform State
      ↕
Actual AWS Infrastructure
```

---

## Phase 2 — Part 2A: Continuous Integration

**Status: Planned**

One-line description:

> Automatically validate React, Python, and Terraform whenever code is pushed or a pull request is opened.

Planned workflow:

```text
Git Push / Pull Request
          ↓
     GitHub Actions
      /     |      \
     /      |       \
Frontend  Backend  Terraform
```

Frontend checks:

```text
npm ci
npm run build
```

Backend checks:

```text
Python compile
Ruff
pytest
```

Terraform checks:

```text
terraform fmt -check
terraform validate
```

Major lesson:

> CI should discover broken code before it reaches AWS.

---

## Phase 2 — Part 2B: GitHub to AWS Authentication with OIDC

**Status: Planned**

One-line description:

> Allow GitHub Actions to obtain temporary AWS credentials without storing permanent AWS access keys in GitHub.

Architecture:

```text
GitHub Actions
      ↓
OIDC identity token
      ↓
AWS IAM trust policy
      ↓
GitHub deployment role
      ↓
temporary AWS credentials
```

Learn:

```text
OIDC
IAM federation
trust policies
temporary credentials
GitHub workflow identity
AWS role assumption
```

No permanent:

```text
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```

should be stored in the repository.

---

## Phase 2 — Part 2C: Lambda Continuous Deployment

**Status: Planned**

One-line description:

> Automatically deploy changed Python Lambda source after validated changes reach the deployment branch.

Target workflow:

```text
backend/**
   ↓
git push
   ↓
GitHub Actions
   ↓
CI passes
   ↓
create Lambda ZIP
   ↓
OIDC → AWS
   ↓
aws lambda update-function-code
   ↓
Lambda deployed
```

Terraform continues to own Lambda configuration.

GitHub Actions owns Lambda source deployment.

---

## Phase 2 — Part 2D: Terraform CI/CD

**Status: Planned**

One-line description:

> Automatically validate and plan infrastructure changes and apply only reviewed/approved Terraform changes to AWS.

Target flow:

```text
infra/terraform/**
       ↓
Pull Request
       ↓
terraform fmt
       ↓
terraform validate
       ↓
terraform plan
       ↓
review
       ↓
approved apply
       ↓
AWS
```

Major lesson:

```text
Terraform
= What infrastructure should exist?

GitHub Actions
= When and how infrastructure automation runs?
```

---

## Phase 2 — Part 2E: End-to-End Delivery

**Status: Planned**

One-line description:

> Prove that both application-code changes and infrastructure changes can move from Git to AWS without manual Console deployment.

Application-code test:

```text
change lambda_function.py
      ↓
git commit
      ↓
git push
      ↓
GitHub Actions
      ↓
AWS Lambda automatically updated
```

Infrastructure test:

```text
change Terraform configuration
      ↓
git commit
      ↓
Pull Request
      ↓
terraform plan
      ↓
review
      ↓
apply
      ↓
AWS infrastructure updated
```

---

# Phase 3 — Authentication and Authorization

**Status: Planned**

One-line description:

> Replace temporary mock identity with real OAuth/OIDC authentication and enforce identity on the backend.

Target architecture:

```text
User
 ↓
Google
 ↓
Amazon Cognito
 ↓
OAuth / OIDC
 ↓
JWT
 ↓
React
 ↓
API Gateway
 ↓
Lambda
 ↓
user-specific DynamoDB / S3 data
```

Learn:

```text
authentication
authorization
OAuth 2.0
OIDC
JWT
identity claims
Cognito
federated identity
API authorization
```

---

# Phase 4 — Production Readiness

**Status: Future**

One-line description:

> Turn the learning application into a deployable environment with production hosting, monitoring, testing, and security controls.

Topics may include:

```text
frontend hosting
CloudFront
production S3 frontend bucket
custom domain
HTTPS
CloudWatch monitoring
log retention
alarms
multiple environments
dev / test / prod
Secrets Manager
backup
security controls
automated testing
```

---

# The Most Important Concepts Learned

## Frontend vs Backend

```text
React
= interaction and presentation

Lambda
= business/backend logic
```

## API

```text
API Gateway
= HTTP boundary between frontend and backend
```

## Database

```text
DynamoDB
= persistent structured application data
```

## Files

```text
S3
= persistent object/file storage
```

## Permissions

```text
IAM
= what AWS identities/services may do
```

## User Identity

```text
OAuth / Cognito
= who the application user is
```

## Infrastructure

```text
Terraform
= what cloud infrastructure should exist
```

## Automation

```text
GitHub Actions
= when/how automated checks and deployments run
```

## Source Control

```text
Git / GitHub
= versioned source of truth
```

---

# End-to-End Mental Model

The entire project can ultimately be remembered as:

```text
                         USER
                          │
                          ▼
                   Authentication
                          │
                          ▼
                       React
                          │
                          ▼
                  services/api.js
                          │
                          ▼
                    API Gateway
                          │
               ┌──────────┴──────────┐
               │                     │
               ▼                     ▼
          Moods Lambda          Image Lambda
               │                 │        │
               ▼                 ▼        ▼
           DynamoDB           DynamoDB    S3


Infrastructure:
Terraform


Source Control:
Git + GitHub


Automation:
GitHub Actions


GitHub → AWS Authentication:
OIDC
```

---

# Core Engineering Principle

The main purpose of Mood Yourself is to learn that a modern application is not simply:

```text
React + Python
```

It is a set of clearly separated responsibilities:

```text
React
→ User experience

services/api.js
→ Frontend/backend contract

API Gateway
→ HTTP interface

Lambda
→ Application logic

DynamoDB
→ Structured persistence

S3
→ Object persistence

IAM
→ AWS authorization

Cognito / OIDC
→ User identity

Terraform
→ Infrastructure definition

Git
→ Source history

GitHub Actions
→ Build/test/deployment automation
```

Understanding how these pieces interact is the primary learning outcome of this project.

---

# Current Development Principle

Mood Yourself intentionally follows this progression:

```text
MANUAL
Understand how it works

        ↓

INFRASTRUCTURE AS CODE
Make it reproducible

        ↓

CI/CD
Make it automatically testable and deployable

        ↓

AUTHENTICATION
Make it user-aware and secure

        ↓

PRODUCTION READINESS
Make it operationally reliable
```

The objective is not merely to finish Mood Yourself.

The objective is to understand the full lifecycle of building and delivering a React + AWS serverless application.