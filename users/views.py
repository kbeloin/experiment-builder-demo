from rest_framework import viewsets
from django.shortcuts import render
from rest_framework.generics import ListAPIView
from .models import User
from .serializers import UserSerializer, ParticipantSerializer
from rest_framework.permissions import IsAdminUser
from rest_framework.decorators import api_view, permission_classes

@permission_classes([IsAdminUser])
class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    queryset = User.objects.all()
@permission_classes([IsAdminUser])
class ParticipantListView(ListAPIView):
    serializer_class = ParticipantSerializer

    def get_queryset(self):
        queryset = User.objects.filter(is_participant=True)
        return queryset
        

