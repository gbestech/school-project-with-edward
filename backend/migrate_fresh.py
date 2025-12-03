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

print("=" * 70)
print("FORCED FRESH MIGRATION WITH TABLE CLEANUP")
print("=" * 70)

# Show connection details
db_settings = connection.settings_dict
print(f"\n🔗 Database: {db_settings['NAME']}")
print(f"🔗 Host: {db_settings['HOST']}")

# Drop ALL tables
print("\n🗑️  Dropping all existing tables...")
with connection.cursor() as cursor:
    # Get all tables
    cursor.execute(
        """
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    """
    )
    tables = [row[0] for row in cursor.fetchall()]

    print(f"📋 Found {len(tables)} existing tables")

    if tables:
        for table in tables:
            print(f"   - Dropping {table}")
            cursor.execute(f'DROP TABLE IF EXISTS "{table}" CASCADE')
        print("✅ All tables dropped")
    else:
        print("✅ No existing tables to drop")

# Verify tables are gone
with connection.cursor() as cursor:
    cursor.execute(
        """
        SELECT COUNT(*) 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    """
    )
    table_count = cursor.fetchone()[0]
    print(f"\n📋 Tables remaining: {table_count}")

# Now run migrations on clean database
print("\n🔄 Running migrations on clean database...")
try:
    call_command('migrate', '--noinput', verbosity=2)
    print("\n✅ MIGRATIONS COMPLETED SUCCESSFULLY!")
except Exception as e:
    print(f"\n❌ MIGRATION FAILED: {e}")
    import traceback

    traceback.print_exc()
    sys.exit(1)

# Verify tables were created
with connection.cursor() as cursor:
    cursor.execute("""
        SELECT COUNT(*) 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    """)
    table_count = cursor.fetchone()[0]
    print(f"\n✅ Total tables created: {table_count}")

    # Check for our specific table
    cursor.execute(
        """
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'schoolSettings_schoolsettings'
        ORDER BY ordinal_position
    """
    )
    columns = [row[0] for row in cursor.fetchall()]
    if columns:
        print(
            f"\n✅ schoolSettings_schoolsettings table created with {len(columns)} columns:"
        )
        for col in columns:
            print(f"   - {col}")
    else:
        print("\n⚠️  WARNING: schoolSettings_schoolsettings table not found!")

print("\n" + "=" * 70)
print("DONE!")
print("=" * 70)
