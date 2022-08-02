import uuid
from django.core.files.temp import NamedTemporaryFile
from rest_framework import serializers # This is important
from .models import FileUpload
from users.models import User
from botocore.exceptions import ClientError
from urllib.parse import urlparse
import mimetypes
import logging
import numpy as np
from botocore.config import Config
import boto3
import json
import os
import subprocess

from .utility import audio_convert, parselmouth_tools as praat

class StringSerializer(serializers.StringRelatedField):
    def to_internal_value(self, value):
        return value

class PreSignedURLSerializer(serializers.ModelSerializer):

    options = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    questions = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = FileUpload
        fields = ('bucket_key')
    
    def create(self, data):
        f = FileUpload()

        file_id = str(uuid.uuid4())
        object_name = f'{data["user"]}{data.get("question", "")}{data.get("option", "-")}{file_id}'
        content_type = data['content_type']
        
        if content_type == 'audio/mp3':
            file_extension = '.mp3'
        elif content_type == 'audio/wav':
            file_extension = '.wav'
        else:
            file_extension = mimetypes.guess_extension(content_type)

        key = f'experiment-reponse-data/{object_name}{file_extension}'
        
        f.created_by = data["user"]
        f.bucket_key = key
        f.save()
        return f.id
        
    
    def generate_post_url(self, data):
        '''
        Generates a presigned URL for the S3 bucket based on an existing file id.
        '''
        
        # Generate a unique id for the fil
        fileId = data
        file_object = FileUpload.objects.get(id=fileId)
        key = file_object.bucket_key


        s3 = boto3.resource('s3', config=Config(signature_version='s3v4', region_name='us-east-2'))
        try:
            bucket = 'intonation-trainer'

            # Generate a pre-signed URL for the file
            pre_signed_post = s3.meta.client.generate_presigned_post(bucket,
                                                                      key,  
                                                                      ExpiresIn=5000)
            return pre_signed_post
        except ClientError as e:
            logging.error(e)
            return None
        # Generate a presigned URL for the S3 bucket.

        
    def generate_get_url(self, data):
        '''
        Generates a presigned URL for the S3 Item.
        Data contains following fields:
        - fileId: file id
        '''
        # Generate a unique id for the file

        fileId = data
        file_object = FileUpload.objects.get(id=fileId)
        key = file_object.bucket_key

        s3 = boto3.resource('s3', config=Config(signature_version='s3v4', region_name='us-east-2'))
        bucket = 'intonation-trainer'
        s3_client = boto3.client('s3')
        object_acl = s3.ObjectAcl(bucket,key)

        try:
            response = object_acl.put(ACL='public-read')
            endpoint = urlparse(s3.meta.client.meta.endpoint_url)
            public_url = f'{endpoint.scheme}://{bucket}.{endpoint.netloc}/{key}'
            print(key)
            return public_url
        
        except ClientError as e:
            logging.error(e)

class FileUploadSerializer(serializers.ModelSerializer):
    processes = {"pitch": praat.pitch}

    options =  StringSerializer(many=True)
    questions = StringSerializer(many=True)
    response = StringSerializer(many=False)
    created_by = StringSerializer(many=False)

    class Meta:
        model = FileUpload
        fields = ('__all__')
    
    def open_temp_file(self):
        temp_file = NamedTemporaryFile(delete=True)
        self.temp_file = temp_file

    def close_temp_file(self):
        self.temp_file.close()

    def write_temp_file(self, data):
        # change name of file to include .mp3 extension
        
        for chunk in data.chunks():
            self.temp_file.write(chunk)
        

    def process(self, data):
        process = data.get('process', None)
        if process is not None:
            return self.processes[process](self.temp_file.name)
        return {}
  
    def upload(self, data):
        
        self.open_temp_file()
        self.write_temp_file(data['file'])
        try:
            object_name = f'{data["user"]}{data.get("question", "")}{data.get("option", "-")}{os.path.basename(self.temp_file.name)}'
            
        except:
            object_name = os.path.basename(self.temp_file.name)
        content_type = data['content_type']
        
        if content_type == 'audio/mp3':
            file_extension = '.mp3'
        elif content_type == 'audio/wav':
            file_extension = '.wav'
        else:
            file_extension = mimetypes.guess_extension(content_type)
        
        s3 = boto3.resource('s3', config=Config(signature_version='s3v4', region_name='us-east-2'))
        try:
            file = self.temp_file.name
            key = f'experiment-reponse-data/{object_name}{file_extension}'
            bucket = 'intonation-trainer'
            
            response = s3.Bucket(bucket).upload_file(file, key, ExtraArgs={'ACL': 'public-read','ContentType': content_type})
            # pre_signed = s3.meta.client.generate_presigned_url('get_object',
            #                                         Params={'Bucket': bucket,
            #                                                 'Key': key},
            #                                         ExpiresIn=3600)

            pre_signed_post = s3.meta.client.generate_presigned_post(bucket,
                                                                      key,  
                                                                      ExpiresIn=5000)

            endpoint = urlparse(s3.meta.client.meta.endpoint_url)
            public_url = f'{endpoint.scheme}://{bucket}.{endpoint.netloc}/{key}'
            
        
        except ClientError as e:
            self.close_temp_file()
            logging.error(e)
            return False
        processed_data = None
        if data.get('process', None) is not None:
            processed_data = self.process(data, public_url)
        
        self.close_temp_file()
        return { "url": public_url, "key": key, "data": processed_data, "pre_signed_post": json.dumps(pre_signed_post)}
    
    def create(self, user, public_url, key):
        f = FileUpload()
        f.created_by = user
        f.public_url = public_url
        f.bucket_key = key
        f.save()
        return f.id

    def get(self):
        # Get the key from the request
        key = self.request.GET.get('key', None)
        if key is None:
            return False
        # Generate the presigned get url
        s3 = boto3.client('s3', config=Config(signature_version='s3v4', region_name='us-east-2'))
        try:
            presigned_url = s3.generate_presigned_url('get_object',
                                                      Params={'Bucket': 'intonation-trainer',
                                                                'Key': key},
                                                        ExpiresIn=60000)
        except ClientError as e:
            logging.error(e)
            return False
        return presigned_url



class AudioFileSerializer(FileUploadSerializer):

    def decode(self, data):
        audio_data = [ y for y in json.loads(data).values()]
        return audio_data

    def encode(self, data):
        audio_convert.write(self.temp_file.name, 48000, np.asarray(data))

    def upload(self, data):
        self.open_temp_file()
        audio = self.decode(data['file'])
        self.encode(audio)
        
        try:
            object_name = f'{data["user"]}{data.get("question", "")}{data.get("option", "-")}{os.path.basename(self.temp_file.name)}'
        except:
            object_name = os.path.basename(self.temp_file.name)
        
        s3 = boto3.resource('s3', config=Config(signature_version='s3v4', region_name='us-east-2'))
        try:
            file = self.temp_file.name
            key = f'experiment-reponse-data/{object_name}.wav'
            bucket = 'intonation-trainer'
        
            response = s3.Bucket(bucket).upload_file(file, key, ExtraArgs={'ACL': 'public-read', 'ContentType': 'audio/wav'})
            endpoint = urlparse(s3.meta.client.meta.endpoint_url)
            public_url = f'{endpoint.scheme}://{bucket}.{endpoint.netloc}/{key}'
            pre_signed = s3.meta.client.generate_presigned_url('get_object',
                                                    Params={'Bucket': bucket,
                                                            'Key': key},
                                                    ExpiresIn=3600)

        
           
            
        except ClientError as e:
            self.close_temp_file()
            logging.error(e)
            return False
        data = self.process(data)
        self.close_temp_file()
        return { "url": public_url, "key": key, "data": data, pre_signed: pre_signed }
