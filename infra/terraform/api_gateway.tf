resource "aws_apigatewayv2_api" "mood_yourself" {
  name          = var.api_name
  protocol_type = "HTTP"

  cors_configuration {
  allow_headers = [
    "Content-Type",
  ]

  allow_methods = [
    "GET",
    "OPTIONS",
    "POST",
    "PUT",
  ]

  allow_origins = [
    var.frontend_dev_origin,
  ]
}
}