import os, json
import boto3
from aws_lambda_powertools import Logger


DOCUMENT_TABLE = os.environ["DOCUMENT_TABLE"]
MEMORY_TABLE = os.environ["MEMORY_TABLE"]
BUCKET = os.environ["BUCKET"]

ddb = boto3.resource("dynamodb")
document_table = ddb.Table(DOCUMENT_TABLE)
memory_table = ddb.Table(MEMORY_TABLE)
s3 = boto3.client("s3")
logger = Logger()


@logger.inject_lambda_context(log_event=True)
def lambda_handler(event, context):
    user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
    document_id = event["pathParameters"]["documentid"]

    response = document_table.get_item(
        Key={"userid": user_id, "documentid": document_id}
    )
    document = response["Item"]
    logger.info({"document": document})
    logger.info("Deleting DDB items")
    with memory_table.batch_writer() as batch:
        for item in document["conversations"]:
            batch.delete_item(Key={"SessionId": item["conversationid"]})

    document_table.delete_item(
        Key={"userid": user_id, "documentid": document_id}
    )

    logger.info("Deleting S3 objects")
    filename = document["filename"]
    objects = [{"Key": f"{user_id}/{filename}/{key}"} for key in [filename, "index.faiss", "index.pkl"]]
    response = s3.delete_objects(
        Bucket=BUCKET,
        Delete={
            "Objects": objects,
            "Quiet": True,
        },
    )
    logger.info({"Response": response})

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
        },
        "body": json.dumps(
            {},
            default=str,
        ),
    }
