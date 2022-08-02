# Generated by Django 3.1 on 2022-04-04 03:58

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0022_auto_20220301_0530'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('s3', '0004_auto_20220219_2235'),
    ]

    operations = [
        migrations.CreateModel(
            name='EmbeddedFile',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('public_url', models.URLField(null=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('experiments', models.ManyToManyField(blank=True, related_name='embedded_files', to='api.Experiment')),
                ('modules', models.ManyToManyField(blank=True, related_name='embedded_files', to='api.Module')),
                ('questions', models.ManyToManyField(blank=True, related_name='embedded_files', to='api.Question')),
            ],
        ),
    ]