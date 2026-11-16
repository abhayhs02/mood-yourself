output "moods_table_name" {
  description = "Name of the Mood Yourself DynamoDB table"
  value       = aws_dynamodb_table.moods.name
}

output "moods_table_arn" {
  description = "ARN of the Mood Yourself DynamoDB table"
  value       = aws_dynamodb_table.moods.arn
}