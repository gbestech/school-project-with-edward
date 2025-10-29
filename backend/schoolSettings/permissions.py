from rest_framework import permissions
from django.contrib.auth import get_user_model

User = get_user_model()


class ModulePermissionBase(permissions.BasePermission):
    """
    Base class for module permissions.
    Set module_name as a class attribute in subclasses.
    """

    module_name = None
    permission_type = None

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if not request.user.is_active:
            return False

        # Get module name from class attribute or view
        module = self.module_name or getattr(view, "permission_module", None)
        if not module:
            return False

        # Determine permission type based on HTTP method
        if self.permission_type:
            perm_type = self.permission_type
        else:
            perm_type = self.get_permission_type_from_method(request.method)

        # Check if user has the required permission
        return self.user_has_permission(request.user, module, perm_type)

    def get_permission_type_from_method(self, method):
        """Map HTTP methods to permission types"""
        method_to_permission = {
            "GET": "read",
            "HEAD": "read",
            "OPTIONS": "read",
            "POST": "write",
            "PUT": "write",
            "PATCH": "write",
            "DELETE": "delete",
        }
        return method_to_permission.get(method.upper(), "read")

    def user_has_permission(self, user, module, permission_type):
        """Check if user has specific permission through their role assignments"""
        # Super admins have full access to everything
        if user.is_superuser:
            return True

        # Get all active role assignments for the user
        from schoolSettings.models import UserRole

        user_roles = UserRole.objects.filter(
            user=user, is_active=True
        ).prefetch_related("role", "role__permissions", "custom_permissions")

        for user_role in user_roles:
            # Skip expired assignments
            if user_role.is_expired():
                continue

            # Check custom permissions first (they override role permissions)
            custom_perm = user_role.custom_permissions.filter(
                module=module, permission_type=permission_type, granted=True
            ).first()

            if custom_perm:
                return True

            # Check role permissions
            if user_role.role.has_permission(module, permission_type):
                return True

        return False


# ============================================================================
# MODULE-SPECIFIC PERMISSIONS
# ============================================================================


class HasExamsPermission(ModulePermissionBase):
    """Permission for exams module"""

    module_name = "exams"


class HasTeachersPermission(ModulePermissionBase):
    """Permission for teachers module"""

    module_name = "teachers"


class HasStudentsPermission(ModulePermissionBase):
    """Permission for students module"""

    module_name = "students"


class HasAttendancePermission(ModulePermissionBase):
    """Permission for attendance module"""

    module_name = "attendance"


class HasResultsPermission(ModulePermissionBase):
    """Permission for results module"""

    module_name = "results"


class HasFinancePermission(ModulePermissionBase):
    """Permission for finance module"""

    module_name = "finance"


class HasReportsPermission(ModulePermissionBase):
    """Permission for reports module"""

    module_name = "reports"


class HasSettingsPermission(ModulePermissionBase):
    """Permission for settings module"""

    module_name = "settings"


class HasAnnouncementsPermission(ModulePermissionBase):
    """Permission for announcements module"""

    module_name = "announcements"


class HasMessagingPermission(ModulePermissionBase):
    """Permission for messaging module"""

    module_name = "messaging"


class HasClassroomPermission(ModulePermissionBase):
    """Permission for classroom module"""

    module_name = "classroom"


class HasSubjectsPermission(ModulePermissionBase):
    """Permission for subjects module"""

    module_name = "subjects"


class HasTimetablePermission(ModulePermissionBase):
    """Permission for timetable module"""

    module_name = "timetable"


class HasLibraryPermission(ModulePermissionBase):
    """Permission for library module"""

    module_name = "library"


class HasInventoryPermission(ModulePermissionBase):
    """Permission for inventory module"""

    module_name = "inventory"


class HasTransportPermission(ModulePermissionBase):
    """Permission for transport module"""

    module_name = "transport"


# ============================================================================
# SECTION-BASED PERMISSIONS
# ============================================================================


class SectionPermissionBase(permissions.BasePermission):
    """
    Check if user has access to specific school sections.
    Set section as a class attribute in subclasses.
    """

    section = None

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if not request.user.is_active:
            return False

        # Superusers have access to all sections
        if request.user.is_superuser:
            return True

        # Get user's section access from role assignments
        from schoolSettings.models import UserRole

        user_roles = UserRole.objects.filter(user=request.user, is_active=True)

        for user_role in user_roles:
            if user_role.is_expired():
                continue

            # Check section access based on section type
            if self.section == "primary" and user_role.primary_section_access:
                return True
            elif self.section == "secondary" and user_role.secondary_section_access:
                return True
            elif self.section == "nursery" and user_role.nursery_section_access:
                return True

        return False


class HasPrimarySectionAccess(SectionPermissionBase):
    """Access to Primary Section (typically grades 1-6)"""

    section = "primary"


class HasSecondarySectionAccess(SectionPermissionBase):
    """Access to entire Secondary Section (JSS + SSS)"""

    section = "secondary"


class HasNurserySectionAccess(SectionPermissionBase):
    """Access to Nursery Section (pre-primary)"""

    section = "nursery"


# ============================================================================
# SUB-SECTION PERMISSIONS (Junior Secondary, Senior Secondary)
# ============================================================================


class SubSectionPermissionBase(permissions.BasePermission):
    """
    Check if user has access to specific sub-sections.
    This checks both section access AND grade level access.
    """

    section = None  # 'secondary', 'primary', etc.
    grade_levels = []  # List of grade level names

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if not request.user.is_active:
            return False

        # Superusers have access to all sections
        if request.user.is_superuser:
            return True

        # Get user's section access from role assignments
        from schoolSettings.models import UserRole

        user_roles = UserRole.objects.filter(user=request.user, is_active=True)

        for user_role in user_roles:
            if user_role.is_expired():
                continue

            # Check if user has access to the parent section
            has_section_access = False
            if self.section == "primary" and user_role.primary_section_access:
                has_section_access = True
            elif self.section == "secondary" and user_role.secondary_section_access:
                has_section_access = True
            elif self.section == "nursery" and user_role.nursery_section_access:
                has_section_access = True

            if has_section_access:
                # If no specific grade levels specified, grant access
                if not self.grade_levels:
                    return True

                # TODO: Check if role has specific grade level restrictions
                # For now, if they have section access, they can access sub-sections
                return True

        return False


class HasJuniorSecondaryAccess(SubSectionPermissionBase):
    """
    Access to Junior Secondary School (JSS 1-3)
    Typically grades 7-9
    """

    section = "secondary"
    grade_levels = ["JSS 1", "JSS 2", "JSS 3"]


class HasSeniorSecondaryAccess(SubSectionPermissionBase):
    """
    Access to Senior Secondary School (SSS 1-3)
    Typically grades 10-12
    """

    section = "secondary"
    grade_levels = ["SSS 1", "SSS 2", "SSS 3"]


class HasLowerPrimaryAccess(SubSectionPermissionBase):
    """
    Access to Lower Primary (Primary 1-3)
    """

    section = "primary"
    grade_levels = ["Primary 1", "Primary 2", "Primary 3"]


class HasUpperPrimaryAccess(SubSectionPermissionBase):
    """
    Access to Upper Primary (Primary 4-6)
    """

    section = "primary"
    grade_levels = ["Primary 4", "Primary 5", "Primary 6"]


# ============================================================================
# ADMIN ROLE PERMISSIONS (Combines Module + Section)
# ============================================================================


class AdminRolePermissionBase(permissions.BasePermission):
    """
    Base class for admin roles that combine module permissions and section access.
    Checks if user has BOTH the required module permissions AND section access.
    """

    required_modules = (
        []
    )  # List of module names that should have at least 'read' permission
    section = None  # 'primary', 'secondary', 'nursery'
    grade_levels = []  # Optional: specific grade levels

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if not request.user.is_active:
            return False

        # Superusers have full access
        if request.user.is_superuser:
            return True

        from schoolSettings.models import UserRole

        user_roles = UserRole.objects.filter(
            user=request.user, is_active=True
        ).prefetch_related("role", "role__permissions")

        for user_role in user_roles:
            if user_role.is_expired():
                continue

            # Check section access
            has_section_access = False
            if self.section == "primary" and user_role.primary_section_access:
                has_section_access = True
            elif self.section == "secondary" and user_role.secondary_section_access:
                has_section_access = True
            elif self.section == "nursery" and user_role.nursery_section_access:
                has_section_access = True
            elif self.section is None:  # No section restriction
                has_section_access = True

            if not has_section_access:
                continue

            # Check if user has permissions for required modules
            has_all_module_permissions = True
            for module in self.required_modules:
                if not user_role.role.has_permission(module, "read"):
                    has_all_module_permissions = False
                    break

            if has_all_module_permissions:
                return True

        return False


class IsPrimaryAdmin(AdminRolePermissionBase):
    """
    Primary Section Administrator
    - Full access to primary section (grades 1-6)
    - Can manage students, teachers, attendance, exams, results
    """

    section = "primary"
    required_modules = [
        "students",
        "teachers",
        "attendance",
        "exams",
        "results",
        "classroom",
    ]


class IsSecondaryAdmin(AdminRolePermissionBase):
    """
    Secondary Section Administrator (Full Secondary)
    - Full access to entire secondary section (JSS + SSS)
    - Can manage students, teachers, attendance, exams, results
    """

    section = "secondary"
    required_modules = [
        "students",
        "teachers",
        "attendance",
        "exams",
        "results",
        "classroom",
    ]


class IsJuniorSecondaryAdmin(AdminRolePermissionBase):
    """
    Junior Secondary Administrator
    - Access to JSS 1-3 only
    - Can manage students, teachers, attendance, exams, results for junior secondary
    """

    section = "secondary"
    grade_levels = ["JSS 1", "JSS 2", "JSS 3"]
    required_modules = [
        "students",
        "teachers",
        "attendance",
        "exams",
        "results",
        "classroom",
    ]


class IsSeniorSecondaryAdmin(AdminRolePermissionBase):
    """
    Senior Secondary Administrator
    - Access to SSS 1-3 only
    - Can manage students, teachers, attendance, exams, results for senior secondary
    """

    section = "secondary"
    grade_levels = ["SSS 1", "SSS 2", "SSS 3"]
    required_modules = [
        "students",
        "teachers",
        "attendance",
        "exams",
        "results",
        "classroom",
    ]


class IsNurseryAdmin(AdminRolePermissionBase):
    """
    Nursery Section Administrator
    - Full access to nursery section
    - Can manage students, teachers, attendance
    """

    section = "nursery"
    required_modules = ["students", "teachers", "attendance", "classroom"]


class IsAcademicAdmin(AdminRolePermissionBase):
    """
    Academic Administrator (Cross-section)
    - Can access all sections
    - Focused on academic modules: exams, results, subjects, timetable
    """

    section = None  # Access all sections
    required_modules = ["exams", "results", "subjects", "timetable", "reports"]


class IsFinanceAdmin(AdminRolePermissionBase):
    """
    Finance Administrator
    - Can access all sections
    - Focused on financial operations
    """

    section = None  # Access all sections
    required_modules = ["finance", "reports"]


# ============================================================================
# COMBINED PERMISSIONS (OR Logic)
# ============================================================================


class IsSectionAdmin(permissions.BasePermission):
    """
    Check if user is an admin for ANY section
    (Primary OR Secondary OR Nursery OR Junior Secondary OR Senior Secondary)
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_superuser:
            return True

        # Check if user has any admin role
        admin_permissions = [
            IsPrimaryAdmin(),
            IsSecondaryAdmin(),
            IsJuniorSecondaryAdmin(),
            IsSeniorSecondaryAdmin(),
            IsNurseryAdmin(),
        ]

        for perm in admin_permissions:
            if perm.has_permission(request, view):
                return True

        return False


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Allow any section admin to write, but allow authenticated users to read
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Read permissions for authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions for admins only
        return IsSectionAdmin().has_permission(request, view)


# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================


def get_user_sections(user):
    """
    Get all sections a user has access to
    Returns: dict with keys 'primary', 'secondary', 'nursery'
    """
    if user.is_superuser:
        return {
            "primary": True,
            "secondary": True,
            "nursery": True,
            "junior_secondary": True,
            "senior_secondary": True,
        }

    from schoolSettings.models import UserRole

    user_roles = UserRole.objects.filter(user=user, is_active=True)

    sections = {
        "primary": False,
        "secondary": False,
        "nursery": False,
        "junior_secondary": False,
        "senior_secondary": False,
    }

    for user_role in user_roles:
        if user_role.is_expired():
            continue

        if user_role.primary_section_access:
            sections["primary"] = True
        if user_role.secondary_section_access:
            sections["secondary"] = True
            # Assume if they have secondary access, they have both junior and senior
            # unless specific grade level restrictions apply
            sections["junior_secondary"] = True
            sections["senior_secondary"] = True
        if user_role.nursery_section_access:
            sections["nursery"] = True

    return sections


def get_user_permissions(user):
    """
    Get all module permissions for a user
    Returns: dict mapping module names to list of permission types
    """
    if user.is_superuser:
        return {"all": ["read", "write", "delete"]}

    from schoolSettings.models import UserRole

    user_roles = UserRole.objects.filter(user=user, is_active=True).prefetch_related(
        "role", "role__permissions", "custom_permissions"
    )

    permissions = {}

    for user_role in user_roles:
        if user_role.is_expired():
            continue

        # Add role permissions
        for perm in user_role.role.permissions.filter(granted=True):
            if perm.module not in permissions:
                permissions[perm.module] = set()
            permissions[perm.module].add(perm.permission_type)

        # Add/override with custom permissions
        for custom_perm in user_role.custom_permissions.all():
            if custom_perm.granted:
                if custom_perm.module not in permissions:
                    permissions[custom_perm.module] = set()
                permissions[custom_perm.module].add(custom_perm.permission_type)
            elif custom_perm.module in permissions:
                # Remove if explicitly denied
                permissions[custom_perm.module].discard(custom_perm.permission_type)

    # Convert sets to lists
    return {module: list(perms) for module, perms in permissions.items()}
