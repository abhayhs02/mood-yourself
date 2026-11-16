resource "aws_dynamodb_table" "moods" {
  name         = var.moods_table_name
  billing_mode = "PAY_PER_REQUEST"

  hash_key  = "userId"
  range_key = "moodDate"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "moodDate"
    type = "S"
  }
}