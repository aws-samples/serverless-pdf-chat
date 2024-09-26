import json

from aws_lambda_powertools import Logger
from botocore.exceptions import ClientError

from backend.src.generate_response.polly_wrapper import PollyWrapper

logger = Logger()
polly_wrapper = PollyWrapper(polly_client=None, s3_resource=None)
bucket_name = "asdf"


def say_it(self, response: str):
    """
    Gets synthesized speech and visemes from Amazon Polly, stores the audio in
    a temporary file, and plays the sound and lip-sync animation.

    When the text is too long for synchronous synthesis, this function displays a
    dialog that asks the user for an Amazon Simple Storage Service (Amazon S3)
    bucket to use for output storage, starts an asynchronous synthesis task, and
    waits for the task to complete.
    """
    audio_stream = None
    visemes = []
    try:
        audio_stream, visemes = polly_wrapper.synthesize(
            response,
            self.engine_var.get(),
            self.voice_choices[self.voice_var.get()],
            "mp3",
            self.language_choices[self.language_var.get()],
            True,
        )
    except ClientError as error:
        if error.response["Error"]["Code"] == "TextLengthExceededException":
            if bucket_name:
                audio_stream, visemes = polly_wrapper.do_synthesis_task(
                    response,
                    self.engine_var.get(),
                    self.voice_choices[self.voice_var.get()],
                    "mp3",
                    bucket_name,
                    self.language_choices[self.language_var.get()],
                    True,
                    self.long_text_wait_callback,
                )

    logger.debug("Visemes: %s.", json.dumps(visemes))

    return audio_stream, visemes
