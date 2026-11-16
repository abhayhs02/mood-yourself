import json
import os
from datetime import datetime, timezone

import boto3
from boto3.dynamodb.conditions import Key


dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["MOODS_TABLE"])


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
            "message": "Request received",
            "requestId": context.aws_request_id,
            "method": method,
            "path": path
        })
    )

    # Temporary until authentication is implemented.
    user_id = "abhay-test-user"

    if method == "GET" and path == "/moods":
        return get_moods(
            event,
            user_id
        )

    if method == "PUT" and path == "/moods":
        return save_mood(
            event,
            user_id
        )

    return build_response(
        404,
        {
            "message": "Route not found"
        }
    )


def get_moods(event, user_id):
    params = (
        event.get("queryStringParameters")
        or {}
    )

    start_date = str(
        params.get("startDate", "")
    ).strip()

    end_date = str(
        params.get("endDate", "")
    ).strip()

    if not start_date or not end_date:
        return build_response(
            400,
            {
                "message": (
                    "startDate and endDate are required"
                )
            }
        )

    result = table.query(
        KeyConditionExpression=(
            Key("userId").eq(user_id)
            & Key("moodDate").between(
                start_date,
                end_date
            )
        )
    )

    items = result.get(
        "Items",
        []
    )

    print(
        json.dumps({
            "message": "Moods loaded",
            "userId": user_id,
            "startDate": start_date,
            "endDate": end_date,
            "itemCount": len(items)
        })
    )

    return build_response(
        200,
        {
            "items": items
        }
    )


def save_mood(event, user_id):
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

    mood = str(
        body.get("mood", "")
    ).strip()

    mood_date = str(
        body.get("moodDate", "")
    ).strip()

    image_key = body.get(
        "imageKey"
    )

    if not mood:
        return build_response(
            400,
            {
                "message": "Mood is required"
            }
        )

    if not mood_date:
        return build_response(
            400,
            {
                "message": "moodDate is required"
            }
        )

    if len(mood) > 200:
        return build_response(
            400,
            {
                "message": (
                    "Mood cannot exceed 200 characters"
                )
            }
        )

    item = {
        "userId": user_id,
        "moodDate": mood_date,
        "mood": mood,
        "updatedAt": datetime.now(
            timezone.utc
        ).isoformat()
    }

    if image_key:
        image_key = str(
            image_key
        ).strip()

        expected_prefix = (
            f"users/{user_id}/"
            f"{mood_date}/"
        )

        if not image_key.startswith(
            expected_prefix
        ):
            return build_response(
                400,
                {
                    "message": (
                        "Invalid imageKey"
                    )
                }
            )

        item["imageKey"] = (
            image_key
        )

    table.put_item(
        Item=item
    )

    print(
        json.dumps({
            "message": "Mood saved",
            "userId": user_id,
            "moodDate": mood_date,
            "hasImage": bool(
                item.get("imageKey")
            )
        })
    )

    return build_response(
        200,
        {
            "message": (
                "Mood saved successfully"
            ),
            "item": item
        }
    )
