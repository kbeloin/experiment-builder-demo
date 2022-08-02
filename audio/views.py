from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_400_BAD_REQUEST,
    HTTP_401_UNAUTHORIZED,
)
from .serializers import ProcessedAudioSerializer
import mimetypes

# Create your views here.

class ProcessedAudioView(APIView):

    def post(self, request):
        if request.user.is_authenticated == False:
            return Response(status=HTTP_401_UNAUTHORIZED)
        data = {}
        data['file'] = request.FILES.get('file', None)
        data.update(request.POST.dict())
        # guess the file type
        
        
        
        serializer = ProcessedAudioSerializer(data=data)
        if serializer.is_valid():
            processed_data = serializer.process(data)
            return Response(processed_data, status=HTTP_200_OK)
        print(serializer.errors)
        return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)