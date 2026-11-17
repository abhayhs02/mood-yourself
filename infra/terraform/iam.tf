data "aws_caller_identity" "current" {}

data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    sid    = "LambdaAssumeRole"
    effect = "Allow"

    actions = [
      "sts:AssumeRole"
    ]

    principals {
      type = "Service"

      identifiers = [
        "lambda.amazonaws.com"
      ]
    }
  }
}

resource "aws_iam_role" "moods_lambda" {
  name = var.moods_lambda_role_name

  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

resource "aws_iam_role" "image_lambda" {
  name = var.image_lambda_role_name

  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

resource "aws_iam_role_policy_attachment" "moods_lambda_basic_execution" {
  role = aws_iam_role.moods_lambda.name

  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "image_lambda_basic_execution" {
  role = aws_iam_role.image_lambda.name

  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "aws_iam_policy_document" "moods_lambda_access" {
  statement {
    sid    = "MoodTableAccess"
    effect = "Allow"

    actions = [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:Query"
    ]

    resources = [
      aws_dynamodb_table.moods.arn
    ]
  }
}

resource "aws_iam_role_policy" "moods_lambda_access" {
  name = "MoodYourselfDynamoDbAccess"
  role = aws_iam_role.moods_lambda.id

  policy = data.aws_iam_policy_document.moods_lambda_access.json
}

data "aws_iam_policy_document" "image_lambda_access" {
  statement {
    sid    = "MoodTableReadAccess"
    effect = "Allow"

    actions = [
      "dynamodb:GetItem"
    ]

    resources = [
      aws_dynamodb_table.moods.arn
    ]
  }

  statement {
    sid    = "MoodImageObjectAccess"
    effect = "Allow"

    actions = [
      "s3:GetObject",
      "s3:PutObject"
    ]

    resources = [
      "${aws_s3_bucket.mood_images.arn}/users/*"
    ]
  }
}

resource "aws_iam_role_policy" "image_lambda_access" {
  name = "MoodYourselfImageAccess"
  role = aws_iam_role.image_lambda.id

  policy = data.aws_iam_policy_document.image_lambda_access.json
}