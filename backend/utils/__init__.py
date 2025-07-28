from datetime import datetime

def generate_unique_username(role: str) -> str:
    from users.models import CustomUser  # Import inside the function to avoid AppRegistryNotReady
    """
    Generate a unique username in the format:
    PREFIX/GTS/MONTH/YEAR/REGNUM
    PREFIX: STU, TEA, PAR, ADM
    GTS: School code
    MONTH: 3-letter uppercase month
    YEAR: last two digits
    REGNUM: 4-digit, zero-padded, unique for the role/month/year
    """
    prefix_map = {
        'student': 'STU',
        'teacher': 'TEA',
        'parent': 'PAR',
        'admin': 'ADM',
    }
    prefix = prefix_map.get(role.lower(), 'USR')
    school = 'GTS'
    now = datetime.now()
    month = now.strftime('%b').upper()  # e.g., 'SEP'
    year = now.strftime('%y')           # e.g., '25'

    # Find the highest regnum for this role/month/year
    pattern = f"{prefix}/{school}/{month}/{year}/"
    existing_usernames = CustomUser.objects.filter(username__startswith=pattern)
    max_regnum = 0
    for user in existing_usernames:
        try:
            regnum = int(user.username.split('/')[-1])
            if regnum > max_regnum:
                max_regnum = regnum
        except Exception:
            continue
    reg_num = f"{max_regnum + 1:04d}"
    username = f"{pattern}{reg_num}"
    return username
