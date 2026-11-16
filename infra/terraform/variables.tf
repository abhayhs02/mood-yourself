variable "aws_region" {
  description = "AWS region containing the Mood Yourself resources"
  type        = string
  default     = "ap-southeast-2"
}

variable "moods_table_name" {
  description = "DynamoDB table containing Mood Yourself mood entries"
  type        = string
  default     = "MoodYourself"
}