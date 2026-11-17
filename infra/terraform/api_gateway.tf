resource "aws_apigatewayv2_api" "mood_yourself" {
  name          = var.api_name
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = [
      var.frontend_dev_origin
    ]

    allow_methods = [
      "GET",
      "PUT",
      "POST",
      "OPTIONS"
    ]

    allow_headers = [
      "Content-Type"
    ]
  }
}