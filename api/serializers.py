# todo/serializers.py
# pylint: disable=no-member
from asyncio import constants
from time import time
from tokenize import String
from rest_framework import serializers # This is important
from .models import CompletedExperiment, Module, Question, CompletedModule, Option, UserResponse, Experiment, CompletedExperiment
from users.models import Participant, User
from s3.models import FileUpload, EmbeddedFile
import json

class StringSerializer(serializers.StringRelatedField):
    def to_internal_value(self, value):
        return value

class OptionSerializer(serializers.RelatedField):
    class Meta:
        model = Option
        fields = ['id', 'title', 'value']

    def to_representation(self, obj: Option):
        values = obj.value
        
        return {'id': obj.id, 'title': obj.title, **values }

    def get_queryset(self):
        return super().get_queryset()


class QuestionSerializer(serializers.ModelSerializer):
    options =  OptionSerializer(many=True)
    target = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ('id', 'question', 'order', 'options', 'target', 'target_type', 'config', 'files')


class ModuleSerializer(serializers.ModelSerializer):
    '''Creates a module.'''
    questions = serializers.SerializerMethodField()
    moderator = StringSerializer(many=False)

    class Meta:
        model = Module
        fields = ('__all__')

    def get_questions(self, obj):
        questions = QuestionSerializer(obj.questions.all(), many=True).data
        return questions

    def create(self, request):
        '''Creates a module.'''
        data = request.data

        module = Module()
        moderator = User.objects.get(username=data['moderator'])
        module.moderator = moderator
        module.title = data['title']
        module.instructions = json.loads(data['instructions'])
        module.config = data["config"]
        module.save()
        if len(data['files']) != 0:
            files = FileUpload.objects.filter(id__in=data['files'])
            [module.files.add(f) for f in files]
            module.save()
        # Check for embedded files
        # embedded files must be created and saved to module
        if len(data['embeds']) != 0:
            # create embedded file for each url in data['embeds']
            # save embedded file to module
            # check if embedded file already exists by url otherwise create new
            embeds = [embed for embed, created in [EmbeddedFile.objects.get_or_create(public_url=url) for url in data['embeds']]]
            # save embedded files
            [embed.save() for embed in embeds]
            [module.embeds.add(e) for e in embeds]
            module.save()

        order = 1
        for q in data['questions']:
            newQ = Question()
            newQ.question = q['title']
            newQ.order = order
            newQ.target_type = q['target']
            newQ.config = q['config']
            newQ.save()
            if len(q['files']) != 0:
                files = FileUpload.objects.filter(id__in=q['files'])
                for f in files:
                    newQ.files.add(f)
                newQ.save()
            if len(q['embeds']) != 0:
                # create embedded file for each url in data['embeds']
                # save embedded file to module
                # check if embedded file already exists by url otherwise create new
                embeds = [embed for embed, created in [EmbeddedFile.objects.get_or_create(public_url=url) for url in data['embeds']]]
                # save embedded files
                [embed.save() for embed in embeds]
                [newQ.embeds.add(e) for e in embeds]
                newQ.save()
                
            for k, c in q['options'].items():
                
                option, target = (c['value'], c['target'])
                newO = Option()
                newO.title = json.loads(option)['title']
                newO.value = json.loads(option)
                newO.save()
                newQ.options.add(newO)
                if target:
                    newQ.target.add(newO)
            newQ.module = module
            newQ.save()
            order += 1
        return {"id": module.id, "title": module.title}

    
    
class ModuleListSerializer(serializers.ModelSerializer):
        '''Gets module list a module.'''
        
        moderator = StringSerializer(many=False)

        class Meta:
            model = Module
            fields = ('__all__')



class CompletedModuleSerializer(serializers.ModelSerializer):
    participant = serializers.PrimaryKeyRelatedField(many=False, read_only=True)
    responses = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    progress = serializers.SerializerMethodField()
    
    class Meta:
        model = CompletedModule
        fields = ('__all__')

    def get_progress(self, obj):
        # A completed module is completed if all questions are completed
        # A question is completed if there exists at least one response for each option

        targets = [q.target.all() for q in obj.module.questions.all()]
        # get id for each target
        total_targets = set([t.id for t in targets[0]])
        responses = set([r.option.id for r in obj.responses.all()])
        
        # check if all targets are in responses
        is_completed = total_targets.issubset(responses)

        return {"total_targets": total_targets, "responses": responses, "is_completed": is_completed}

    def get_responses(self, obj):
        module = obj.module
        return [q.responses.all() for q in module.questions.all()]

    def create(self, request):
        data = request.data
        module = Module.objects.get(id=data['mdlId'])
        participant = User.objects.get(id=request.user.id)
        submitted_experiment = data.get('expId', None)
        
        if request.data.get('userMdlId', None) is not None:
            completed_mdl = CompletedModule.objects.get(id=request.data.get('userMdlId'))
        else:
            completed_mdl = CompletedModule()
            completed_mdl.module = module
            completed_mdl.participant = participant
            completed_mdl.save()
        if submitted_experiment is not None:
            experiment = CompletedExperiment.objects.get(id=submitted_experiment)
            completed_mdl.submitted_experiment = experiment
            completed_mdl.save()
        completed_mdl.save()

        
        responses = data.get('responses', None)
        timestamps = data.get('timestamps', None)
        if responses is not None:
            questions = [q for q in module.questions.all()]
            for key, value in data['responses'].items():
                for attempt in value:
                    if attempt is not None:
                        for optionId, response in attempt.items():
                            if timestamps is not None:
                                response_time = timestamps.get(optionId, 0)
                            newR = UserResponse()
                            newR.save()
                            newR.response = response
                            newR.response_time = response_time
                            newR.option = Option.objects.get(id=optionId)      
                            newR.save()          
                            newR.question = Question.objects.get(id=key)
                            newR.save()
                            completed_mdl.responses.add(newR)
            

            if data.get('files', []) != []:
                for file in data['files']:
                    existingFile = FileUpload.objects.get(id=file['id'])
                    existingOption = Option.objects.get(id=file['option'])
                    existingOption.files.add(existingFile)
                    newR.files.add(existingFile)
            
            answered_correct_count = 0

            result = answered_correct_count / len(questions) * 100
            completed_mdl.result = result
            
            completed_mdl.save()
        return completed_mdl
        

class CompletedExperimentSerializer(serializers.ModelSerializer):
    participant = StringSerializer(many=False)
    experiment = serializers.PrimaryKeyRelatedField(read_only=True)
    experiment_name = serializers.SerializerMethodField()
    current_module = serializers.SerializerMethodField()
    completed = serializers.SerializerMethodField()

    class Meta:
        model = CompletedExperiment
        fields = ('current_module', 'completed', 'experiment', 'experiment_name', 'participant', 'id')

    def get_experiment_name(self, obj):
        return obj.experiment.title

    def get_current_module(self, obj):
        # get module map from experiment config
        # module map is two dimensional array of [moduleOrder + 1, moduleId]
        module_map = obj.experiment.config['module_map']
        # get most recent completed module
        # get count of completed modules for submitted experiment by module id
        completed_modules = CompletedModule.objects.filter(participant=obj.participant, submitted_experiment=obj)
        completed_module_counts = {}
        for completed_module in completed_modules:
            if completed_module.module.id in completed_module_counts:
                completed_module_counts[completed_module.module.id] += 1
            else:
                completed_module_counts[completed_module.module.id] = 1
        # compare count to number of attempts allowed for the experiment by module id
        # if count is less than number of attempts allowed, return module id
        # if count is equal to number of attempts allowed, return next module id
        # if count is greater than number of attempts allowed, return None

        completed_module = CompletedModule.objects.filter(participant=obj.participant, submitted_experiment=obj.id).order_by('-id').first()
        
        if completed_module is None:
            #print user id
            print(obj.participant.username)
            print('no completed module')
            return module_map[0]
        else:
            # check if there are user responses related to the completed module
            user_responses = UserResponse.objects.filter(completed_module=completed_module)
            module_id = completed_module.module.id
            module_index = [i for i, x in enumerate(module_map) if x[1] == module_id][0]
            # if there are no user responses, return the value in module map whose second value matches the completed module's module id
            
            if user_responses.count() == 0:
                print(obj.participant.username)
                print('no user responses')
                return module_map[module_index]
            else:
                # compare the user responses (and associated option ids) to options expected in each question in the related module
                response_option_id = set([r.option.id for r in user_responses])
                module_questions = Question.objects.filter(module=completed_module.module)
                module_options = set([q.options.all() for q in module_questions])
                # flatten the list of options
                module_options = [item.id for sublist in module_options for item in sublist]
                # if the difference between the two sets is empty, module is complete
                if response_option_id.difference(module_options) == set():
                    print('module complete')
                    # check if there are any more modules in the experiment
                    if module_index == len(module_map) - 1:
                        print('returning none')
                        return None
                    else:
                        # get the next module id in the module map
                        print('returning next module')
                        return module_map[module_index + 1]
                else:
                    # if there are differences, return the value in module map whose second value matches the completed module's module id
                    # completed module is incomplete and should be removed from comlpated experiement relation
                    completed_module.delete()

                    return module_map[module_index]
    
    def get_completed(self, obj):
        # get module map from experiment config
        # module map is two dimensional array of [moduleOrder + 1, moduleId]
        module_map = obj.experiment.config['module_map']
        # get all completed modules for submitted experiment
        completed_modules = CompletedModule.objects.filter(participant=obj.participant, submitted_experiment=obj)
        # module is complete if the number of completed modules for submitted experiment is equal to the number of modules in the experiment
        # completed modules are completed if the number of user responses for the completed module is equal to the number of options in the related questions
        #  check that all completed modules for submitted experiment have user responses
        
        completed_modules_with_responses = set()
        for completed_module in completed_modules:
            user_responses = UserResponse.objects.filter(completed_module=completed_module)
            if user_responses.count() > 0:
                completed_modules_with_responses.add(completed_module.module.id)
        # if the number of unique completed modules for submitted experiment is equal to the number of modules in the experiment, return true
        # get module ids from module map and compare to completed module ids
        # if completed module ids are equal to module ids, return true
        # if completed module ids are not equal to module ids, return false
        if len(completed_modules_with_responses) == len(module_map):
            return True
        else:
            return False
        

    def check_create(self, request):
        expId = request.query_params.get('experiment', None)
        experiment = Experiment.objects.get(id=expId)
        user = request.user
        submitted = CompletedExperiment.objects.filter(participant__id=user.id)

       
        if user.id not in experiment.participants.values_list(flat=True):
            print("Participant does not have access to experiment.")
            if user.is_staff | user.is_moderator | user.is_superuser:
                return True
            return False
        if not submitted:
            print("No experiment created for user yet.")
            return True
        return request.user
    
    def check_active(self, request):
        expId = request.query_params.get('experiment', None)
        experiment = Experiment.objects.get(id=expId)
        user = request.user
        submitted = CompletedExperiment.objects.filter(participant__id=user.id)
       
        if user.id not in experiment.participants.values_list(flat=True):
            print("Participant does not have access to experiment.")
            if user.is_staff | user.is_moderator | user.is_superuser:
                print("Participant is staff.")
                return True
            return False
        if not submitted:
            print("No experiment created for user yet.")
            return True
        return request.user
        
    def create(self, request):
        data = request.data

        experiment = Experiment.objects.get(id=data['expId'])
        participant = User.objects.get(id=request.user.id)

        completed_exp = CompletedExperiment()
        completed_exp.experiment = experiment
        completed_exp.participant = participant
        completed_exp.save()
        return completed_exp

class ExperiementSerializer(serializers.ModelSerializer):
    modules =  serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    participants = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Experiment
        fields = ('id', 'title', 'participants', 'modules', 'options', 'config', 'instructions', 'order', "valid_date")

    def get_modules(self, obj):
        modules = ModuleSerializer(obj.modules.all(), many=True).data
        return modules

    def add_participant(self, request):
        print('add participant')
        data = request.data

        experiment = Experiment.objects.get(id=data['expId'])
        participant = User.objects.get(id=data['usrId'])

        if participant not in experiment.participants:
            experiment.participants.add(participant)
            experiment.save()
        
        return experiment.participants

    def create(self, request):
        data = request.data

        experiment = Experiment()
        moderator = User.objects.get(username=data['username'])
        
        experiment.moderator = moderator
        experiment.title = data['title']
        experiment.instructions = json.loads(data['instructions'])
        experiment.config = data.get('config', {})
        experiment.options = data.get('options', {})

        modules = data.get('modules', None)
        
        participants = data.get('participants', None)

        if modules is not None:
            experiment.save()
            experiment.config['module_map']=list(enumerate(modules, start=1))
            experiment.modules.add(*Module.objects.filter(id__in=modules))
            experiment.save()

        if participants is not None:
            experiment.save()
            experiment.participants.add(*User.objects.filter(id__in=participants))
            experiment.save()
        
        experiment.save()
        return experiment

class UserResponseSerializer(serializers.ModelSerializer):
    module = serializers.SerializerMethodField()
    user = serializers.SerializerMethodField()
    completed_module = serializers.SerializerMethodField()
    completed_experiment = serializers.SerializerMethodField()

    class Meta:
        model = UserResponse
        fields = ('id', 'module', 'response', 'user', 'response_time', 'completed_module', 'completed_experiment')

    def get_module(self, obj):
        module = obj.completed_module.module.title
        return module

    def get_user(self, obj):
        user = obj.completed_module.participant.username
        return user

    def get_completed_module(self, obj):
        completed_module = obj.completed_module.id
        return completed_module

    def get_completed_experiment(self, obj):
        completed_experiment = obj.completed_module.submitted_experiment.id
        return completed_experiment
    

    
        

        
        
