from rest_framework import serializers
from .models import User
from rest_auth.registration.serializers import RegisterSerializer
from allauth.account.adapter import get_adapter
from rest_framework.authtoken.models import Token


class UserSerializer(serializers.ModelSerializer):
    experiments = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'is_participant', 'is_moderator', 'experiments')

class ParticipantSerializer(serializers.ModelSerializer):
    experiments = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    responses = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = User
        fields = ('id','email', 'username', 'experiments', 'responses', 'is_participant')
        
class CustomRegisterSerializer(RegisterSerializer):
    is_participant = serializers.BooleanField()
    is_moderator = serializers.BooleanField()
    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'is_participant', 'is_moderator')


    def get_cleaned_data(self):
        return {
            'username': self.validated_data.get('username', ''),
            'password1': self.validated_data.get('password1', ''),
            'password2': self.validated_data.get('password2', ''),
            'email': self.validated_data.get('email', ''),
            'is_participant': self.validated_data.get('is_participant', ''),
            'is_moderator': self.validated_data.get('is_moderator', '')
        }

    def save(self, request):
        adapter = get_adapter()
        user = adapter.new_user(request)
        self.cleaned_data = self.get_cleaned_data()
        user.is_participant = self.cleaned_data.get('is_participant')
        user.is_moderator = self.cleaned_data.get('is_moderator')
        user.save()
        adapter.save_user(request, user, self)
        return user


class TokenSerializer(serializers.ModelSerializer):
    user_type = serializers.SerializerMethodField()
    experiments = serializers.SerializerMethodField()
    class Meta:
        model = Token
        fields = ('key', 'user', 'user_type', 'experiments')

    def get_user_type(self, obj):
        serializer_data = UserSerializer(
            obj.user
        ).data
        is_participant = serializer_data.get('is_participant')
        is_moderator = serializer_data.get('is_moderator')
        return {
            'is_participant': is_participant,
            'is_moderator': is_moderator
        }

    def get_experiments(self, obj):
        serializer_data = UserSerializer(
            obj.user
        ).data
        experiments = serializer_data.get('experiments')
        return {
            'experiments': experiments,
        }