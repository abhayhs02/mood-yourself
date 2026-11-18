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

resource "aws_apigatewayv2_stage" "default" {
  api_id = aws_apigatewayv2_api.mood_yourself.id

  name        = "$default"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "get_moods" {
  api_id = aws_apigatewayv2_api.mood_yourself.id

  integration_type       = "AWS_PROXY"
  integration_method     = "POST"
  integration_uri        = aws_lambda_function.moods_api.arn
  payload_format_version = "2.0"
  timeout_milliseconds   = 30000
}

resource "aws_apigatewayv2_integration" "put_moods" {
  api_id = aws_apigatewayv2_api.mood_yourself.id

  integration_type       = "AWS_PROXY"
  integration_method     = "POST"
  integration_uri        = aws_lambda_function.moods_api.arn
  payload_format_version = "2.0"
  timeout_milliseconds   = 30000
}

resource "aws_apigatewayv2_integration" "get_image" {
  api_id = aws_apigatewayv2_api.mood_yourself.id

  integration_type       = "AWS_PROXY"
  integration_method     = "POST"
  integration_uri        = aws_lambda_function.image_api.arn
  payload_format_version = "2.0"
  timeout_milliseconds   = 30000
}

resource "aws_apigatewayv2_integration" "post_image_upload" {
  api_id = aws_apigatewayv2_api.mood_yourself.id

  integration_type       = "AWS_PROXY"
  integration_method     = "POST"
  integration_uri        = aws_lambda_function.image_api.arn
  payload_format_version = "2.0"
  timeout_milliseconds   = 30000
}

resource "aws_apigatewayv2_route" "get_moods" {
  api_id = aws_apigatewayv2_api.mood_yourself.id

  route_key = "GET /moods"

  target = "integrations/${aws_apigatewayv2_integration.moods_api.id}"
}

resource "aws_apigatewayv2_route" "put_moods" {
  api_id = aws_apigatewayv2_api.mood_yourself.id

  route_key = "PUT /moods"

  target = "integrations/${aws_apigatewayv2_integration.moods_api.id}"
}

resource "aws_apigatewayv2_route" "post_image_upload" {
  api_id = aws_apigatewayv2_api.mood_yourself.id

  route_key = "POST /moods/image-upload"

  target = "integrations/${aws_apigatewayv2_integration.image_api.id}"
}

resource "aws_apigatewayv2_route" "get_image" {
  api_id = aws_apigatewayv2_api.mood_yourself.id

  route_key = "GET /moods/image"

  target = "integrations/${aws_apigatewayv2_integration.image_api.id}"
}

resource "aws_lambda_permission" "api_gateway_moods" {
  statement_id  = "AllowApiGatewayInvokeMoods"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.moods_api.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.mood_yourself.execution_arn}/*/*"
}

resource "aws_lambda_permission" "api_gateway_image" {
  statement_id  = "AllowApiGatewayInvokeImage"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.image_api.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.mood_yourself.execution_arn}/*/*"
}