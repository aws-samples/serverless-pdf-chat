import os, json
from datetime import datetime
import boto3
import shortuuid
from aws_lambda_powertools import Logger

DOCUMENT_TABLE = os.environ["DOCUMENT_TABLE"]
MEMORY_TABLE = os.environ["MEMORY_TABLE"]


ddb = boto3.resource("dynamodb")
document_table = ddb.Table(DOCUMENT_TABLE)
memory_table = ddb.Table(MEMORY_TABLE)
logger = Logger()


@logger.inject_lambda_context(log_event=True)
def lambda_handler(event, context):
    user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
    document_id = event["pathParameters"]["documentid"]

    response = document_table.get_item(
        Key={"userid": user_id, "documentid": document_id}
    )
    conversations = response["Item"]["conversations"]
    logger.info({"conversations": conversations})

    conversation_id = shortuuid.uuid()
    timestamp = datetime.utcnow()
    timestamp_str = timestamp.strftime("%Y-%m-%dT%H:%M:%S.%fZ")
    conversation = {
        "conversationid": conversation_id,
        "created": timestamp_str,
    }
    conversations.append(conversation)
    logger.info({"conversation_new": conversation})
    document_table.update_item(
        Key={"userid": user_id, "documentid": document_id},
        UpdateExpression="SET conversations = :conversations",
        ExpressionAttributeValues={":conversations": conversations},
    )

    conversation = {"SessionId": conversation_id, "History": []}
    memory_table.put_item(Item=conversation)

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
        },
        "body": json.dumps({"conversationid": conversation_id}),
    }
