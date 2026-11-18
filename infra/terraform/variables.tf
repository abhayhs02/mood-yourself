variable "aws_region" {
  description = "AWS region containing Mood Yourself resources"
  type        = string
  default     = "ap-southeast-2"
}

variable "moods_table_name" {
  description = "DynamoDB table containing Mood Yourself entries"
  type        = string
  default     = "MoodYourself"
}

variable "mood_images_bucket_name" {
  description = "Private S3 bucket containing Mood Yourself images"
  type        = string
}

variable "moods_lambda_name" {
  description = "Name of the moods API Lambda function"
  type        = string
  default     = "MoodYourself-MoodsApi"
}

variable "image_lambda_name" {
  description = "Name of the image API Lambda function"
  type        = string
  default     = "MoodYourself-ImageApi"
}

variable "api_name" {
  description = "Name of the Mood Yourself HTTP API"
  type        = string
  default     = "MoodYourselfApi"
}

variable "frontend_dev_origin" {
  description = "Local React development origin allowed by CORS"
  type        = string
  default     = "http://localhost:5176"
}

variable "moods_lambda_role_name" {
  description = "Execution role name for the moods Lambda"
  type        = string
}

variable "image_lambda_role_name" {
  description = "Execution role name for the image Lambda"
  type        = string
}

variable "github_repository" {
  description = "GitHub repository allowed to deploy Lambda code"
  type        = string
  default     = "abhayhs02/mood-yourself"
}

variable "github_lambda_deploy_role_name" {
  description = "IAM role assumed by GitHub Actions for Lambda deployment"
  type        = string
  default     = "GitHubActionsLambdaDeployRole"
}