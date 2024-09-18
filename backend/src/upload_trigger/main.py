import json
import os
import urllib
from datetime import datetime

import boto3
import PyPDF2
import shortuuid
from aws_lambda_powertools import Logger

DOCUMENT_TABLE = os.environ["DOCUMENT_TABLE"]
MEMORY_TABLE = os.environ["MEMORY_TABLE"]
QUEUE = os.environ["QUEUE"]
BUCKET = os.environ["BUCKET"]


ddb = boto3.resource("dynamodb")
document_table = ddb.Table(DOCUMENT_TABLE)
memory_table = ddb.Table(MEMORY_TABLE)
sqs = boto3.client("sqs")
s3 = boto3.client("s3")
logger = Logger()


@logger.inject_lambda_context(log_event=True)
def lambda_handler(event, context):
    try:
        logger.info("tyring to process event")
        key = urllib.parse.unquote_plus(event["Records"][0]["s3"]["object"]["key"])
        split = key.split("/")
        user_id = split[0]
        file_name = split[1]

        document_id = shortuuid.uuid()

        logger.info("trying to download file")
        s3.download_file(BUCKET, key, f"/tmp/{file_name}")

        with open(f"/tmp/{file_name}", "rb") as f:
            reader = PyPDF2.PdfReader(f)
            pages = str(len(reader.pages))

        conversation_id = shortuuid.uuid()

        timestamp = datetime.utcnow()
        timestamp_str = timestamp.strftime("%Y-%m-%dT%H:%M:%S.%fZ")

        document = {
            "userid": user_id,
            "documentid": document_id,
            "filename": file_name,
            "created": timestamp_str,
            "pages": pages,
            "filesize": str(event["Records"][0]["s3"]["object"]["size"]),
            "docstatus": "UPLOADED",
            "conversations": [],
        }

        conversation = {"conversationid": conversation_id, "created": timestamp_str}
        document["conversations"].append(conversation)

        logger.info("trying to save document to table")
        document_table.put_item(Item=document)

        conversation = {"SessionId": conversation_id, "History": []}
        logger.info("trying to save conversation to memory table")
        memory_table.put_item(Item=conversation)

        message = {
            "documentid": document_id,
            "key": key,
            "user": user_id,
        }
        logger.info("trying to send message to sqs")
        sqs.send_message(QueueUrl=QUEUE, MessageBody=json.dumps(message))
    except Exception as e:
        logger.error(f"error {e}")
        raise e  # Re-raise the exception after logging
