"""Initialize only the configured local bucket; never use as a production migration."""

import time

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError, ConnectionClosedError, EndpointConnectionError

from atlasiq.config import get_settings


def main() -> None:
    settings = get_settings()
    client = boto3.client(
        "s3",
        endpoint_url=settings.s3_endpoint_url,
        aws_access_key_id=settings.s3_access_key_id.get_secret_value(),
        aws_secret_access_key=settings.s3_secret_access_key.get_secret_value(),
        region_name=settings.aws_region,
        config=Config(connect_timeout=2, read_timeout=3, retries={"total_max_attempts": 1}),
    )
    try:
        for attempt in range(30):
            try:
                client.list_buckets()
                break
            except (EndpointConnectionError, ConnectionClosedError):
                if attempt == 29:
                    raise RuntimeError("Object storage did not become available") from None
                time.sleep(2)
        try:
            client.head_bucket(Bucket=settings.s3_bucket)
        except ClientError as exc:
            if exc.response["ResponseMetadata"]["HTTPStatusCode"] != 404:
                raise
            client.create_bucket(Bucket=settings.s3_bucket)
        # Empty policy means anonymous access is denied. This is local admin bootstrap.
        try:
            client.delete_bucket_policy(Bucket=settings.s3_bucket)
        except ClientError as exc:
            if exc.response["Error"]["Code"] != "NoSuchBucketPolicy":
                raise
        print("Private development bucket initialized")
    finally:
        client.close()


if __name__ == "__main__":
    main()
