#!/usr/bin/env python
import os
import sys

# Force production environment
os.environ['ENV'] = 'prod'
os.environ['DEBUG'] = 'False'
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from django.db import connection
from django.core.management import call_command
from django.db.migrations.recorder import MigrationRecorder

print("=" * 70)
print("FORCED FRESH MIGRATION")
print("=" * 70)

# Show connection details
db_settings = connection.settings_dict
print(f"\n🔗 Database: {db_settings['NAME']}")
print(f"🔗 Host: {db_settings['HOST']}")
print(f"🔗 User: {db_settings['USER']}")

# Check current migration state
try:
    migration_count = MigrationRecorder.Migration.objects.count()
    print(f"\n📋 Current migrations recorded: {migration_count}")
    
    if migration_count > 0:
        print("⚠️  WARNING: Migrations already recorded but tables don't exist!")
        print("🗑️  Clearing fake migration records...")
        MigrationRecorder.Migration.objects.all().delete()
        print("✅ Migration records cleared")
except Exception as e:
    print(f"📋 No migration table yet (expected): {e}")

# Now run migrations
print("\n🔄 Running migrations...")
try:
    call_command('migrate', '--noinput', verbosity=2)
    print("\n✅ MIGRATIONS COMPLETED SUCCESSFULLY!")
except Exception as e:
    print(f"\n❌ MIGRATION FAILED: {e}")
    sys.exit(1)

# Verify tables were created
with connection.cursor() as cursor:
    cursor.execute("""
        SELECT COUNT(*) 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    """)
    table_count = cursor.fetchone()[0]
    print(f"\n✅ Total tables in database: {table_count}")

print("\n" + "=" * 70)
print("DONE!")
print("=" * 70)