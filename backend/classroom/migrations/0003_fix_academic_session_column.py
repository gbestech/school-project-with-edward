from django.db import migrations


def rename_column_if_exists(apps, schema_editor):
    """Rename academic_year_id to academic_session_id if it exists"""
    with schema_editor.connection.cursor() as cursor:
        # Check if academic_year_id column exists
        cursor.execute(
            """
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='classroom_classroom' 
            AND column_name='academic_year_id';
        """
        )

        if cursor.fetchone():
            # Column exists, rename it
            cursor.execute(
                """
                ALTER TABLE classroom_classroom 
                RENAME COLUMN academic_year_id TO academic_session_id;
            """
            )
            print("Renamed academic_year_id to academic_session_id")
        else:
            print("Column academic_year_id not found, skipping rename")


def reverse_rename(apps, schema_editor):
    """Reverse the rename operation"""
    with schema_editor.connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='classroom_classroom' 
            AND column_name='academic_session_id';
        """
        )

        if cursor.fetchone():
            cursor.execute(
                """
                ALTER TABLE classroom_classroom 
                RENAME COLUMN academic_session_id TO academic_year_id;
            """
            )


class Migration(migrations.Migration):

    dependencies = [
        ("academics", "0002_initial"),
        ("classroom", "0002_initial"),
    ]

    operations = [
        migrations.RunPython(rename_column_if_exists, reverse_rename),
    ]
