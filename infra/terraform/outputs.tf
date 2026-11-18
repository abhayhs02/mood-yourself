output "moods_table_name" {
  description = "Name of the Mood Yourself DynamoDB table"
  value       = aws_dynamodb_table.moods.name
}

output "moods_table_arn" {
  description = "ARN of the Mood Yourself DynamoDB table"
  value       = aws_dynamodb_table.moods.arn
}

output "mood_images_bucket_name" {
  description = "Name of the private Mood Yourself image bucket"
  value       = aws_s3_bucket.mood_images.id
}

output "mood_images_bucket_arn" {
  description = "ARN of the private Mood Yourself image bucket"
  value       = aws_s3_bucket.mood_images.arn
}

output "moods_lambda_name" {
  description = "Name of the moods API Lambda"
  value       = aws_lambda_function.moods_api.function_name
}

output "image_lambda_name" {
  description = "Name of the image API Lambda"
  value       = aws_lambda_function.image_api.function_name
}

output "api_endpoint" {
  description = "Invoke endpoint for the Mood Yourself HTTP API"
  value       = aws_apigatewayv2_api.mood_yourself.api_endpoint
}

output "github_lambda_deploy_role_arn" {
  description = "IAM role assumed by GitHub Actions for Lambda code deployment"
  value       = aws_iam_role.github_lambda_deploy.arn
}