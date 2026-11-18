data "aws_iam_policy_document" "github_lambda_assume_role" {
  statement {
    effect = "Allow"

    actions = [
      "sts:AssumeRoleWithWebIdentity"
    ]

    principals {
      type = "Federated"

      identifiers = [
        aws_iam_openid_connect_provider.github.arn
      ]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"

      values = [
        "sts.amazonaws.com"
      ]
    }

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"

      values = [
        "repo:${var.github_repository}:ref:refs/heads/main"
      ]
    }
  }
}

resource "aws_iam_role" "github_lambda_deploy" {
  name = var.github_lambda_deploy_role_name

  assume_role_policy = data.aws_iam_policy_document.github_lambda_assume_role.json
}

data "aws_iam_policy_document" "github_lambda_deploy" {
  statement {
    effect = "Allow"

    actions = [
      "lambda:UpdateFunctionCode"
    ]

    resources = [
      aws_lambda_function.moods_api.arn,
      aws_lambda_function.image_api.arn
    ]
  }
}


resource "aws_iam_role_policy" "github_lambda_deploy" {
  name = "MoodYourselfLambdaCodeDeploy"

  role = aws_iam_role.github_lambda_deploy.id

  policy = data.aws_iam_policy_document.github_lambda_deploy.json
}