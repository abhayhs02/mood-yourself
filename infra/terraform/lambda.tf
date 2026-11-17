resource "aws_lambda_function" "moods_api" {
  function_name = var.moods_lambda_name

  role = aws_iam_role.moods_lambda.arn

  runtime = "python3.14"
  handler = "lambda_function.lambda_handler"

  architectures = [
    "x86_64"
  ]

  memory_size = 128
  timeout     = 3

  environment {
    variables = {
      MOODS_TABLE = aws_dynamodb_table.moods.name
    }
  }

  lifecycle {
    ignore_changes = [
      filename,
      source_code_hash
    ]
  }
}

resource "aws_lambda_function" "image_api" {
  function_name = var.image_lambda_name

  role = aws_iam_role.image_lambda.arn

  runtime = "python3.14"
  handler = "lambda_function.lambda_handler"

  architectures = [
    "x86_64"
  ]

  memory_size = 128
  timeout     = 3

  environment {
    variables = {
      MOODS_TABLE        = aws_dynamodb_table.moods.name
      MOOD_IMAGES_BUCKET = aws_s3_bucket.mood_images.id
    }
  }

  lifecycle {
    ignore_changes = [
      filename,
      source_code_hash
    ]
  }
}