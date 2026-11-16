# Mood Yourself Moods API

AWS Lambda function:

MoodYourself-MoodsApi

Handler:

lambda_function.lambda_handler

Runtime:

Python 3.14

Required environment variables:

- MOODS_TABLE=MoodYourself

API routes:

- GET /moods
- PUT /moods

DynamoDB permissions:

- dynamodb:Query
- dynamodb:GetItem
- dynamodb:PutItem

Notes:

- userId is temporarily hardcoded as abhay-test-user.
- Authentication will replace the temporary user ID later.
- AWS infrastructure is manually configured during Phase 1.