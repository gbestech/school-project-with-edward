#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Add TeacherPortalCheckMixin to result/views.py
"""

import re


def add_teacher_portal_check():
    """Add TeacherPortalCheckMixin to result ViewSets"""

    file_path = "result/views.py"

    print("🔧 Adding TeacherPortalCheckMixin to result/views.py...")
    print("=" * 60)

    try:
        # Read file
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()

        original_content = content

        # Step 1: Add import if not present
        if "TeacherPortalCheckMixin" not in content:
            # Find the utils imports section
            utils_import_pattern = r"(from utils\.section_filtering import.*?)(\n)"

            if re.search(utils_import_pattern, content):
                content = re.sub(
                    utils_import_pattern,
                    r"\1\2from utils.teacher_portal_permissions import TeacherPortalCheckMixin\2",
                    content,
                    count=1,
                )
                print("✅ Added TeacherPortalCheckMixin import")
            else:
                print("⚠️  Could not find utils imports section")

        # Step 2: Update all result ViewSets
        # Pattern: class XxxResultViewSet(AutoSectionFilterMixin, viewsets.ModelViewSet):
        # Replace with: class XxxResultViewSet(TeacherPortalCheckMixin, AutoSectionFilterMixin, viewsets.ModelViewSet):

        patterns = [
            # Pattern 1: ResultViewSet classes
            (
                r"class (\w*Result\w*ViewSet)\(AutoSectionFilterMixin, viewsets\.ModelViewSet\):",
                r"class \1(TeacherPortalCheckMixin, AutoSectionFilterMixin, viewsets.ModelViewSet):",
            ),
            # Pattern 2: TermReportViewSet classes
            (
                r"class (\w*TermReport\w*ViewSet)\(AutoSectionFilterMixin, viewsets\.ModelViewSet\):",
                r"class \1(TeacherPortalCheckMixin, AutoSectionFilterMixin, viewsets.ModelViewSet):",
            ),
            # Pattern 3: SessionReportViewSet classes
            (
                r"class (\w*SessionReport\w*ViewSet)\(AutoSectionFilterMixin, viewsets\.ModelViewSet\):",
                r"class \1(TeacherPortalCheckMixin, AutoSectionFilterMixin, viewsets.ModelViewSet):",
            ),
            # Pattern 4: SessionResultViewSet classes
            (
                r"class (\w*SessionResult\w*ViewSet)\(AutoSectionFilterMixin, viewsets\.ModelViewSet\):",
                r"class \1(TeacherPortalCheckMixin, AutoSectionFilterMixin, viewsets.ModelViewSet):",
            ),
            # Pattern 5: Supporting ViewSets (ResultSheet, AssessmentScore, etc.)
            (
                r"class (ResultSheet|AssessmentScore|ResultComment)ViewSet\(AutoSectionFilterMixin, viewsets\.ModelViewSet\):",
                r"class \1ViewSet(TeacherPortalCheckMixin, AutoSectionFilterMixin, viewsets.ModelViewSet):",
            ),
        ]

        classes_updated = []
        for pattern, replacement in patterns:
            matches = re.findall(pattern, content)
            if matches:
                content = re.sub(pattern, replacement, content)
                classes_updated.extend(
                    matches if isinstance(matches[0], str) else [m for m in matches]
                )

        if classes_updated:
            print(f"✅ Updated {len(classes_updated)} ViewSet classes:")
            for cls in set(classes_updated):
                print(
                    f"   - {cls}ViewSet"
                    if not cls.endswith("ViewSet")
                    else f"   - {cls}"
                )

        # Save if changes were made
        if content != original_content:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)

            print("\n✨ Successfully updated result/views.py!")
            return True
        else:
            print("\n⏭️  No changes needed (already up to date)")
            return False

    except FileNotFoundError:
        print(f"❌ File not found: {file_path}")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False


def verify_updates():
    """Verify that all updates were applied correctly"""

    file_path = "result/views.py"

    print("\n" + "=" * 60)
    print("🔍 Verifying updates...")
    print("=" * 60)

    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()

        # Check for import
        has_import = (
            "from utils.teacher_portal_permissions import TeacherPortalCheckMixin"
            in content
        )
        print(f"{'✅' if has_import else '❌'} TeacherPortalCheckMixin import")

        # Check for ViewSets with both mixins
        viewsets_to_check = [
            "SeniorSecondaryResultViewSet",
            "SeniorSecondaryTermReportViewSet",
            "JuniorSecondaryResultViewSet",
            "JuniorSecondaryTermReportViewSet",
            "PrimaryResultViewSet",
            "PrimaryTermReportViewSet",
            "NurseryResultViewSet",
            "NurseryTermReportViewSet",
            "StudentResultViewSet",
            "StudentTermResultViewSet",
        ]

        print("\nViewSet configurations:")
        for viewset in viewsets_to_check:
            pattern = (
                f"class {viewset}\\(TeacherPortalCheckMixin, AutoSectionFilterMixin"
            )
            has_both = re.search(pattern, content)
            print(f"{'✅' if has_both else '❌'} {viewset}")

        print("\n" + "=" * 60)

    except Exception as e:
        print(f"❌ Verification failed: {str(e)}")


def main():
    """Main function"""
    print("\n🚀 Starting result/views.py update...\n")

    success = add_teacher_portal_check()

    if success:
        verify_updates()

        print("\n📋 Summary:")
        print("✅ result/views.py has been updated with TeacherPortalCheckMixin")
        print("✅ All result ViewSets now have dual protection:")
        print("   1. Teacher portal enabled check")
        print("   2. Section-based filtering")
        print("\n🧪 Next step: Test with different user roles!")
    else:
        print("\n⚠️  Updates may have already been applied.")
        print("Run verification to check current state.")
        verify_updates()


if __name__ == "__main__":
    main()
