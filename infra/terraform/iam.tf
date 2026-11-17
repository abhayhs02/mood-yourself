data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
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

