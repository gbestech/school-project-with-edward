from schoolSettings.models import SchoolSettings

def get_school_info():
    school = SchoolSettings.objects.first()
    if not school:
        return {
            "name": "School Name",
            "site": "Site Name",
            "address": "",
            "phone": "",
            "email": "",
            "logo": None,
            "favicon": None,
            "motto": "",
        }

    return {
        "name": school.school_name or school.name or "School Name",
        "site": school.site_name or "Site Name",
        "address": school.school_address or school.address or "",
        "phone": school.school_phone or school.phone or "",
        "email": school.school_email or school.email or "",
        "logo": school.logo.url if school.logo else None,
        "favicon": school.favicon.url if school.favicon else None,
        "motto": school.school_motto or school.motto or "",
    }
