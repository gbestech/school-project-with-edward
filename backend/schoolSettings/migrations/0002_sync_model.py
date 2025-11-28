from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('schoolSettings', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            sql="SELECT 1;",
            reverse_sql="SELECT 1;"
        ),
    ]
