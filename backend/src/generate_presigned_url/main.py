import os, json
import boto3
from botocore.config import Config
import shortuuid
from aws_lambda_powertools import Logger


BUCKET = os.environ["BUCKET"]
REGION = os.environ["REGION"]


s3 = boto3.client(
    "s3",
    endpoint_url=f"https://s3.{REGION}.amazonaws.com",
    config=Config(
        s3={"addressing_style": "virtual"}, region_name=REGION, signature_version="s3v4"
    ),
)
logger = Logger()


def s3_key_exists(bucket, key):
    try:
        s3.head_object(Bucket=bucket, Key=key)
        return True
    except:
        return False


@logger.inject_lambda_context(log_event=True)
def lambda_handler(event, context):
    user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
    file_name_full = event["queryStringParameters"]["file_name"]
    file_name = file_name_full.split(".pdf")[0]

    exists = s3_key_exists(BUCKET, f"{user_id}/{file_name_full}/{file_name_full}")

    logger.info(
        {
            "user_id": user_id,
            "file_name_full": file_name_full,
            "file_name": file_name,
            "exists": exists,
        }
    )

    if exists:
        suffix = shortuuid.ShortUUID().random(length=4)
        key = f"{user_id}/{file_name}-{suffix}.pdf/{file_name}-{suffix}.pdf"
    else:
        key = f"{user_id}/{file_name}.pdf/{file_name}.pdf"

    presigned_url = s3.generate_presigned_url(
        ClientMethod="put_object",
        Params={
            "Bucket": BUCKET,
            "Key": key,
            "ContentType": "application/pdf",
        },
        ExpiresIn=300,
        HttpMethod="PUT",
    )

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
        },
        "body": json.dumps({"presignedurl": presigned_url}),
    }
