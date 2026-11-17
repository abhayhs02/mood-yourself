def lambda_handler(event, context):
    return {
        "statusCode": 501,
        "body": "Bootstrap Lambda only. Application code is deployed separately."
    }