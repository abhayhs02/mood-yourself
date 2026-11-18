resource "aws_s3_bucket" "mood_images" {
  bucket = var.mood_images_bucket_name
}

resource "aws_s3_bucket_public_access_block" "mood_images" {
  bucket = aws_s3_bucket.mood_images.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_cors_configuration" "mood_images" {
  bucket = aws_s3_bucket.mood_images.id

  cors_rule {
    allowed_headers = [
      "Content-Type"
    ]

    allowed_methods = [
      "GET",
      "PUT"
    ]

    allowed_origins = [
  var.frontend_dev_origin
]

    expose_headers = [
      "ETag"
    ]

    max_age_seconds = 3000
  }
}