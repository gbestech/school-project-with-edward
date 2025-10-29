from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("schoolSettings", "0016_schoolsettings_account_lock_duration_and_more"),
    ]

    operations = [
        migrations.RunSQL(
            # This adds columns only if they don't exist - safe for both local and production
            sql="""
            DO $$ 
            BEGIN
                -- Add password_expiration if it doesn't exist
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='schoolSettings_schoolsettings' 
                    AND column_name='password_expiration'
                ) THEN
                    ALTER TABLE "schoolSettings_schoolsettings" 
                    ADD COLUMN "password_expiration" INTEGER DEFAULT 90;
                END IF;
                
                -- Add any other missing columns from migration 0016 here
                -- Check your 0016 migration file for all fields
                
            END $$;
            """,
            reverse_sql="-- No reverse needed for a fix migration",
        ),
    ]
