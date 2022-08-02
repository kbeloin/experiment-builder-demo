
from rest_framework import serializers
from django.core.files.temp import NamedTemporaryFile
from rest_framework import serializers # This is important
from users.models import User
import mimetypes
import logging
import numpy as np
from botocore.config import Config
import boto3
import json
import os
from .utility import audio_convert, parselmouth_tools as praat

class ProcessedAudioSerializer(serializers.Serializer):
    processes = {"pitch": praat.pitch}

    def decode(self, data):
        audio_data = [ y for x, y in json.loads(data).items()]

        return audio_data

    def encode(self, data):
        audio_convert.write(self.temp_file.name, 48000, np.asarray(data))

    def open_temp_file(self):
        temp_file = NamedTemporaryFile(delete=True)
        self.temp_file = temp_file

    def close_temp_file(self):
        self.temp_file.close()

    def write_temp_file(self, data):
        for chunk in data.chunks():
            self.temp_file.write(chunk)

    def get_processed_data(self, data):
        process = data.get('process', None)
        if process is not None:
            return self.processes[process](self.temp_file)
        return "No process specified"
  
    def process(self, data):
        self.open_temp_file()
        if data.get('convert', None) is not None:
            self.encode(self.decode(data["file"]))
        else:
            self.write_temp_file(data["file"])
       
        processed_data = self.get_processed_data(data)
        self.close_temp_file()
        return { processed_data}
    