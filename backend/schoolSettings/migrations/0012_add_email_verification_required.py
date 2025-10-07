from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("schoolSettings", "0011_alter_schoolsettings_allow_self_registration"),
    ]

    operations = [
        migrations.AddField(
            model_name="schoolsettings",
            name="email_verification_required",
            field=models.BooleanField(default=True),
        ),
    ]
