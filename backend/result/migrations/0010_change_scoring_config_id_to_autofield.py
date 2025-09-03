# Generated manually on 2025-09-01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('result', '0009_auto_20250901_0950'),
    ]

    operations = [
        migrations.AlterField(
            model_name='scoringconfiguration',
            name='id',
            field=models.AutoField(primary_key=True),
        ),
    ]



