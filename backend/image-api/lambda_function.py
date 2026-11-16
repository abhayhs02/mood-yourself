import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

import boto3


s3 = boto3.client("s3")
dynamodb = boto3.resource("dynamodb")

bucket_name = os.environ["MOOD_IMAGES_BUCKET"]
table = dynamodb.Table(os.environ["MOODS_TABLE"])


ALLOWED_CONTENT_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


def build_response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json"
        },
        "body": json.dumps(body)
    }


def lambda_handler(event, context):
    method = (
        event.get("requestContext", {})
        .get("http", {})
        .get("method")
    )

    path = event.get("rawPath", "")

    print(
        json.dumps({
            "message": "Image request received",
            "requestId": context.aws_request_id,
            "method": method,
            "path": path
        })
    )

    # Temporary identity until Cognito/Google login is integrated.
    user_id = "abhay-test-user"

    if method == "POST" and path == "/moods/image-upload":
        return create_upload_url(
            event,
            user_id
        )

    if method == "GET" and path == "/moods/image":
        return create_view_url(
            event,
            user_id
        )

    return build_response(
        404,
        {
            "message": "Route not found"
        }
    )


def create_upload_url(event, user_id):
    try:
        body = json.loads(
            event.get("body") or "{}"
        )
    except json.JSONDecodeError:
        return build_response(
            400,
            {
                "message": "Invalid JSON body"
            }
        )

    mood_date = str(
        body.get("moodDate", "")
    ).strip()

    content_type = str(
        body.get("contentType", "")
    ).strip()

    file_name = str(
        body.get("fileName", "")
    ).strip()

    if not mood_date:
        return build_response(
            400,
            {
                "message": "moodDate is required"
            }
        )

    if not is_valid_date(mood_date):
        return build_response(
            400,
            {
                "message": (
                    "moodDate must use YYYY-MM-DD"
                )
            }
        )

    if content_type not in ALLOWED_CONTENT_TYPES:
        return build_response(
            400,
            {
                "message": (
                    "Only JPEG, PNG, and WebP "
                    "images are allowed"
                )
            }
        )

    extension = ALLOWED_CONTENT_TYPES[
        content_type
    ]

    safe_name = sanitize_file_name(
        Path(file_name).stem
    )

    unique_suffix = uuid4().hex[:12]

    object_key = (
        f"users/{user_id}/"
        f"{mood_date}/"
        f"{safe_name}-{unique_suffix}"
        f"{extension}"
    )

    upload_url = s3.generate_presigned_url(
        ClientMethod="put_object",
        Params={
            "Bucket": bucket_name,
            "Key": object_key,
            "ContentType": content_type
        },
        ExpiresIn=300
    )

    print(
        json.dumps({
            "message": "Upload URL generated",
            "userId": user_id,
            "moodDate": mood_date,
            "objectKey": object_key
        })
    )

    return build_response(
        200,
        {
            "uploadUrl": upload_url,
            "imageKey": object_key,
            "expiresIn": 300
        }
    )


def create_view_url(event, user_id):
    params = (
        event.get("queryStringParameters")
        or {}
    )

    mood_date = str(
        params.get("moodDate", "")
    ).strip()

    if not mood_date:
        return build_response(
            400,
            {
                "message": "moodDate is required"
            }
        )

    result = table.get_item(
        Key={
            "userId": user_id,
            "moodDate": mood_date
        }
    )

    item = result.get("Item")

    if not item:
        return build_response(
            404,
            {
                "message": (
                    "Mood entry was not found"
                )
            }
        )

    image_key = item.get("imageKey")

    if not image_key:
        return build_response(
            404,
            {
                "message": (
                    "No image exists for this mood"
                )
            }
        )

    expected_prefix = (
        f"users/{user_id}/"
    )

    if not image_key.startswith(
        expected_prefix
    ):
        return build_response(
            403,
            {
                "message": (
                    "Image access denied"
                )
            }
        )

    view_url = s3.generate_presigned_url(
        ClientMethod="get_object",
        Params={
            "Bucket": bucket_name,
            "Key": image_key
        },
        ExpiresIn=300
    )

    return build_response(
        200,
        {
            "imageUrl": view_url,
            "imageKey": image_key,
            "expiresIn": 300
        }
    )


def sanitize_file_name(file_name):
    cleaned = re.sub(
        r"[^a-zA-Z0-9_-]+",
        "-",
        file_name
    )

    cleaned = cleaned.strip("-_")

    return cleaned[:60] or "mood-image"


def is_valid_date(value):
    try:
        datetime.strptime(
            value,
            "%Y-%m-%d"
        )

        return True
    except ValueError:
        return False