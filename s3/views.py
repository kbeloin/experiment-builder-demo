from enum import Enum
from django.shortcuts import render
from rest_framework.views import APIView
from s3.models import FileUpload
from .parsers import AudioParser
from rest_framework.parsers import JSONParser, FormParser, MultiPartParser
from s3.serializers import FileUploadSerializer, AudioFileSerializer, PreSignedURLSerializer
from rest_framework.response import Response
from rest_framework.decorators import parser_classes
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_400_BAD_REQUEST,
    HTTP_401_UNAUTHORIZED,
)
# get post and get decoratorss
from api.models import Question, Option
from django.views.decorators.http import require_http_methods
# Create your views here.
@parser_classes([JSONParser, AudioParser, FormParser, MultiPartParser])
class UploadFileView(APIView):
    ORIGIN = {'user_response': AudioFileSerializer, 'rich_text': FileUploadSerializer }

    def get(self, request):
        if request.user.is_authenticated == False:
            return Response(status=HTTP_401_UNAUTHORIZED)
        user = request.user
        print(user, ": Downloading file")
        

        key = request.GET.get('key', None)
        serializer = FileUploadSerializer(data=request)
        serializer.is_valid()
        if key is None:
            return Response(status=HTTP_400_BAD_REQUEST)

        presigned_url = serializer.get(key)
        if presigned_url is not None:
            return Response(status=HTTP_200_OK, data=presigned_url)

    def post(self, request):
        if request.user.is_authenticated == False:
            return Response(status=HTTP_401_UNAUTHORIZED)
        user = request.user
        print(user, ": Uploading file")
        data = {}
        data['user'] = user.username
        data['file'] = request.FILES.get('file', None)

        if data['file'] is not None:
            try:
                data['content_type'] = data['file'].content_type
            except:
                data['content_type'] = None
        data.update(request.POST.dict())
        question = data.get('question', None)
        option = data.get('option', None)
        if question is not None:
            data['question'] = f'-Q_{question}-'
        if option is not None:
            data['option'] =  f'-O_{option}-'
        serializer = FileUploadSerializer(data=request)
        serializer.is_valid()

        response_dict = serializer.upload(data)
        if response_dict.get("url", None) is not None:
            
            fileId = serializer.create(user, response_dict["url"], response_dict["key"])
            if question is not None:
                question = Question.objects.get(id=question)
                # add file to question
                question.files.add(fileId)
                question.save()
            if option is not None:
                option = Option.objects.get(id=option)
                # add file to option
                option.files.add(fileId)
                option.save()
            response_dict["fileId"] = fileId
            return Response(status=HTTP_201_CREATED, data=response_dict)
        return Response(status=HTTP_400_BAD_REQUEST)

class PresignedUrlView(APIView):

    def get(self, request):
        # print (request.user.is_authenticated)
        print(request.user, ": Downloading file")
        if request.user.is_authenticated == False:
            return Response(status=HTTP_401_UNAUTHORIZED)
        user = request.user
        print(user, ": Generating presigned url")
        # get file id from query params
        fileId = request.query_params.get('file', None)
        
        serializer = PreSignedURLSerializer(data=request)
        serializer.is_valid()
        if fileId is None:
            return Response(status=HTTP_400_BAD_REQUEST)
        presigned_url = serializer.generate_get_url(fileId)
        if presigned_url is not None:
            return Response(status=HTTP_200_OK, data=presigned_url)
        return Response(status=HTTP_400_BAD_REQUEST)
    
    
    def post(self, request):
        if request.user.is_authenticated == False:
            return Response(status=HTTP_401_UNAUTHORIZED)
        
        data = {}
        data['user'] = request.user
        data['content_type'] = request.POST.get('content_type', None)
        data['question'] = request.FILES.get('file', None)
        data['option'] = request.FILES.get('file', None)
    
        serializer = PreSignedURLSerializer(data=request)
        serializer.is_valid()
        fileId = serializer.create(data)
        if fileId is None:
            return Response(status=HTTP_400_BAD_REQUEST)
        presigned_url = serializer.generate_post_url(fileId)
        print(presigned_url)
        if presigned_url is not None:
            return Response(status=HTTP_200_OK, data={"url": presigned_url, "fileId": fileId, })