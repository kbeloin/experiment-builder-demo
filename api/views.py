from django.forms import model_to_dict
from django.shortcuts import render
from rest_framework import viewsets          # add this    # add this
from .models import CompletedExperiment, Experiment, Module, CompletedModule, UserResponse   
from .serializers import CompletedExperimentSerializer, ModuleSerializer, ModuleListSerializer, CompletedModuleSerializer, ExperiementSerializer, UserResponseSerializer
from django.views import View
from django.http import HttpResponse, HttpResponseNotFound
from rest_framework.generics import ListAPIView, CreateAPIView
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_204_NO_CONTENT,
    HTTP_400_BAD_REQUEST
)
from rest_framework.response import Response
from rest_framework.decorators import action

import os
    # Add this CBV
class Assets(View):

    def get(self, _request, filename):
        path = os.path.join(os.path.dirname(__file__), 'static', filename)

        if os.path.isfile(path):
            with open(path, 'rb') as file:
                return HttpResponse(file.read(), content_type='application/javascript')
        else:
            return HttpResponseNotFound()

class ExperimentViewSet(viewsets.ModelViewSet):
    serializer_class = ExperiementSerializer

    def get_queryset(self):
        queryset = Experiment.objects.all()
        
        user = self.request.user
        if user is not None:
            if user.is_staff | user.is_superuser | user.is_moderator:
                # Return all if moderator or staff
                return queryset
            queryset = queryset.filter(participants__id=user.id).distinct()
        return queryset

    def create(self, request):
        serializer = ExperiementSerializer(data=request.data)
        if serializer.is_valid():
            experiment = serializer.create(request)
            if experiment:
                return Response(status=HTTP_201_CREATED, data=experiment.title)
        return Response(status=HTTP_400_BAD_REQUEST)

    @action(methods=['get'], detail=True)
    def responses(self, request, pk=None):
        experiment = self.get_object()
        print(experiment)
        user_responses = UserResponse.objects.filter(completed_module__submitted_experiment__experiment=experiment)
        serializer = UserResponseSerializer(user_responses, many=True)
        return Response(serializer.data)

class ExperimentListView(ListAPIView):
    serializer_class = ExperiementSerializer

    def get_queryset(self):
        queryset = Experiment.objects.all()
        username = self.request.query_params.get('username', None)
        if username is not None:
            queryset = queryset.filter(participant__username=username).distinct()
        return queryset


class ModuleViewSet(viewsets.ModelViewSet):
    serializer_class = ModuleSerializer
    queryset = Module.objects.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return ModuleListSerializer
        elif self.action == 'retrieve':
            return ModuleSerializer
        return None
    
    def list(self, request, *args, **kwargs):
        print(self.action)
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        print(self.action)
        return super().retrieve(request, *args, **kwargs)

    def create(self, request):
        serializer = ModuleSerializer(data=request.data)
        if serializer.is_valid():
            module = serializer.create(request)
            if module:
                return Response(status=HTTP_201_CREATED, data=module["title"])
        return Response(status=HTTP_400_BAD_REQUEST)


class CompletedModuleListView(ListAPIView):
    serializer_class = CompletedModuleSerializer

    def get_queryset(self):
        
        queryset = CompletedModule.objects.all()
        username = self.request.query_params.get('username', None)
        expId = self.request.query_params.get('experiment', None)
        all = self.request.query_params.get('all', None)
        is_moderator = self.request.user.is_moderator
        if expId is not None:
            print("expId: ", expId)
            queryset = queryset.filter(submitted_experiment__id=expId)
            print(len(queryset))
        if is_moderator and all == 'true':
            print("returning all")
            return queryset.all()
        if username is not None:
            queryset = queryset.filter(participant__username=username)
            return queryset.all()
       
class CompletedModuleCreateView(CreateAPIView):
    serializer_class = CompletedModuleSerializer
    queryset = CompletedModule.objects.all()

    def post(self, request):
        print(request.user)
        serializer = CompletedModuleSerializer(data=request.data)
        serializer.is_valid()
        completed_mdl = serializer.create(request)
        if completed_mdl:
            return Response(status=HTTP_201_CREATED, data=model_to_dict(completed_mdl))
        return Response(status=HTTP_400_BAD_REQUEST)

    # define get method to check if user has already completed the module
    def get(self, request):
        print(request.user)
        serializer = CompletedModuleSerializer(data=request.data)
        serializer.is_valid()
        print(request.data)
        completed_mdl = serializer.create(request)
        print(completed_mdl)
        if completed_mdl:
            return Response(status=HTTP_201_CREATED, data=model_to_dict(completed_mdl))
        return Response(status=HTTP_400_BAD_REQUEST)

class CompletedExperimentListView(ListAPIView):
    serializer_class = CompletedExperimentSerializer

    def get_queryset(self):
        queryset = CompletedExperiment.objects.all()
        
        user = self.request.user
        expId = self.request.query_params.get('experiment', None)
        all = self.request.query_params.get('all', None)
        is_moderator = self.request.user.is_moderator

        if user is not None and all != 'true':
            print("Subsectiom of completed experiments")
            queryset = queryset.filter(participant__id=user.id)
            if expId is not None:
                queryset = queryset.filter(experiment__id=expId)
                return queryset
        elif user is not None and all == 'true' and is_moderator:
            print("All completed experiments")
            queryset = queryset.all()
            return queryset

class CompletedExperimentCreateView(CreateAPIView):
    serializer_class = CompletedExperimentSerializer
    
    def get_queryset(self):
        queryset = CompletedExperiment.objects.all()
        
        user = self.request.user
        all = self.request.query_params.get('all', None)

        if user is not None:
            if (user.is_staff | user.is_superuser | user.is_moderator) and all == 'true':
                # Return all if moderator or staff
                return queryset
            queryset = queryset.filter(participants__id=user.id)
            return queryset
        

    def post(self, request):
        serializer = CompletedExperimentSerializer(data=request.data)
        serializer.is_valid()
        
        completed_exp = serializer.create(request)
        if completed_exp:
            return Response(status=HTTP_201_CREATED, data=model_to_dict(completed_exp))
        return Response(status=HTTP_400_BAD_REQUEST)


class UserResponseListView(viewsets.ModelViewSet):
    serializer_class = UserResponseSerializer

    def get_queryset(self):
        expId = self.request.query_params.get('experiment', None)
        experiment = Experiment.objects.get(id=expId)
        modules = experiment.modules.all()
        # Get all completed modules for each module
        completed_modules = CompletedModule.objects.filter(module__in=modules)
        queryset = UserResponse.objects.filter(completed_module__in=completed_modules)
        return queryset

    def get(self, request):
        queryset = self.get_queryset()
        serializer = UserResponseSerializer(queryset, many=True)
        return Response(serializer.data)

# class for feedback view; should allow for feedback to be created and updated

# class FeedbackViewSet(viewsets.ModelViewSet):
#     serializer_class = FeedbackSerializer
#     queryset = Feedback.objects.all()

#     def get_serializer_class(self):
#         if self.action == 'list':
#             return FeedbackListSerializer
#         elif self.action == 'retrieve':
#             return FeedbackSerializer
#         return None

#     def list(self, request, *args, **kwargs):

#         return super().list(request, *args, **kwargs)
        
#     def retrieve(self, request, *args, **kwargs):

#         return super().retrieve(request, *args, **kwargs)

#     def create(self, request):
#         serializer = FeedbackSerializer(data=request.data)
#         if serializer.is_valid():
#             feedback = serializer.create(request)
#             if feedback:
#                 return Response(status=HTTP_201_CREATED, data=feedback["title"])
#         return Response(status=HTTP_400_BAD_REQUEST)

#     def update(self, request, *args, **kwargs):
#         serializer = FeedbackSerializer(data=request.data)
#         if serializer.is_valid():
#             feedback = serializer.update(request)
#             if feedback:
#                 return Response(status=HTTP_204_NO_CONTENT, data=feedback["title"])
#         return Response(status=HTTP_400_BAD_REQUEST)

#     def destroy(self, request, *args, **kwargs):
#         return super().destroy(request, *args, **kwargs)