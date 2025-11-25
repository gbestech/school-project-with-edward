# auto_fix_viewsets.py
# Run this script to automatically add AutoSectionFilterMixin to ViewSets
# Usage: python auto_fix_viewsets.py

import os
import re

# ViewSets that need the mixin
VIEWSETS_TO_FIX = {
    "teacher/views.py": [
        "AssignmentRequestViewSet",
        "TeacherScheduleViewSet",
    ],
    "classroom/views.py": [
        "ClassScheduleViewSet",
        "ClassroomTeacherAssignmentViewSet",
        "GradeLevelViewSet",
        "SectionViewSet",
        "StreamViewSet",
        "StudentEnrollmentViewSet",
        "StudentViewSet",
        "SubjectAnalyticsViewSet",
        "SubjectManagementViewSet",
        "SubjectViewSet",
        "TeacherViewSet",
    ],
    "result/views.py": [
        "AssessmentScoreViewSet",
        "AssessmentTypeViewSet",
        "ExamSessionViewSet",
        "GradeViewSet",
        "GradingSystemViewSet",
        "ResultCommentViewSet",
        "ResultSheetViewSet",
        "ResultTemplateViewSet",
        "ScoringConfigurationViewSet",
    ],
    "attendance/views.py": [
        "AttendanceViewSet",
    ],
}


def fix_viewset_file(filepath, viewsets_to_fix):
    """Add AutoSectionFilterMixin to specified ViewSets in a file"""

    if not os.path.exists(filepath):
        print(f"⚠️  File not found: {filepath}")
        return False

    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    original_content = content

    # Check if import already exists
    if "from utils.section_filtering import AutoSectionFilterMixin" not in content:
        # Find the best place to add the import (after other imports)
        import_pattern = r"(from [^\n]+\n|import [^\n]+\n)+"
        match = re.search(import_pattern, content)
        if match:
            insert_pos = match.end()
            content = (
                content[:insert_pos]
                + "\nfrom utils.section_filtering import AutoSectionFilterMixin\n"
                + content[insert_pos:]
            )
        else:
            # Add at the beginning if no imports found
            content = (
                "from utils.section_filtering import AutoSectionFilterMixin\n\n"
                + content
            )

    # Fix each ViewSet
    for viewset_name in viewsets_to_fix:
        # Pattern to match class definition
        pattern = rf"class\s+{viewset_name}\s*\((.*?)\):"

        def replace_class(match):
            parents = match.group(1).strip()

            # Check if already has the mixin
            if "AutoSectionFilterMixin" in parents or "SectionFilterMixin" in parents:
                return match.group(0)  # Already has it, don't change

            # Add mixin as first parent
            if parents:
                new_parents = f"AutoSectionFilterMixin, {parents}"
            else:
                new_parents = "AutoSectionFilterMixin"

            return f"class {viewset_name}({new_parents}):"

        content = re.sub(pattern, replace_class, content)

    # Only write if changed
    if content != original_content:
        # Create backup
        backup_path = filepath + ".backup"
        with open(backup_path, "w", encoding="utf-8") as f:
            f.write(original_content)
        print(f"📝 Backup created: {backup_path}")

        # Write updated content
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)

        print(f"✅ Updated: {filepath}")
        return True
    else:
        print(f"⏭️  No changes needed: {filepath}")
        return False


def main():
    print("=" * 80)
    print("🔧 AUTO-FIX VIEWSETS - Adding AutoSectionFilterMixin")
    print("=" * 80)

    fixed_count = 0

    for filepath, viewsets in VIEWSETS_TO_FIX.items():
        print(f"\n📦 Processing: {filepath}")
        print(f"   ViewSets to fix: {', '.join(viewsets)}")

        if fix_viewset_file(filepath, viewsets):
            fixed_count += 1

    print("\n" + "=" * 80)
    print(f"✅ Fixed {fixed_count} files!")
    print("=" * 80)
    print("\n⚠️  IMPORTANT: Review the changes before committing!")
    print("Backup files (.backup) have been created for safety.")


if __name__ == "__main__":
    main()
