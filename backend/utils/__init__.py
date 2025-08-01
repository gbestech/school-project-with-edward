from datetime import datetime

def generate_unique_username(role: str, registration_number: str = None, employee_id: str = None) -> str:
    from users.models import CustomUser  # Import inside the function to avoid AppRegistryNotReady
    """
    Generate a unique username in the format:
    PREFIX/GTS/MONTH/YEAR/ID
    PREFIX: STU (student), TCH (teacher), PAR (parent), ADM (admin)
    GTS: God's Treasure Schools
    MONTH: 3-letter uppercase month (JUL, AUG, etc.)
    YEAR: last two digits (25, 26, etc.)
    ID: registration_number for students, employee_id for teachers, auto-increment for others
    """
    prefix_map = {
        'student': 'STU',
        'teacher': 'TCH',
        'parent': 'PAR',
        'admin': 'ADM',
    }
    prefix = prefix_map.get(role.lower(), 'USR')
    school = 'GTS'
    now = datetime.now()
    month = now.strftime('%b').upper()  # e.g., 'JUL'
    year = now.strftime('%y')           # e.g., '25'

    # Determine the ID part based on role and provided data
    if role.lower() == 'student' and registration_number:
        # Use registration number for students, but ensure uniqueness
        base_username = f"{prefix}/{school}/{month}/{year}/{registration_number}"
        
        # Check if this exact username already exists
        if CustomUser.objects.filter(username=base_username).exists():
            # If registration number already exists, append a suffix
            counter = 1
            while CustomUser.objects.filter(username=f"{base_username}-{counter}").exists():
                counter += 1
            id_part = f"{registration_number}-{counter}"
        else:
            id_part = registration_number
            
    elif role.lower() == 'teacher' and employee_id:
        # Use employee ID for teachers, but ensure uniqueness
        base_username = f"{prefix}/{school}/{month}/{year}/{employee_id}"
        
        # Check if this exact username already exists
        if CustomUser.objects.filter(username=base_username).exists():
            # If employee ID already exists, append a suffix
            counter = 1
            while CustomUser.objects.filter(username=f"{base_username}-{counter}").exists():
                counter += 1
            id_part = f"{employee_id}-{counter}"
        else:
            id_part = employee_id
            
    else:
        # For parents and admins, or when no specific ID is provided, use auto-increment
        pattern = f"{prefix}/{school}/{month}/{year}/"
        existing_usernames = CustomUser.objects.filter(username__startswith=pattern)
        max_regnum = 0
        for user in existing_usernames:
            try:
                # Extract the last part and try to convert to number
                last_part = user.username.split('/')[-1]
                # Handle cases where the last part might have a suffix (e.g., "0001-2")
                base_num = last_part.split('-')[0]
                regnum = int(base_num)
                if regnum > max_regnum:
                    max_regnum = regnum
            except (ValueError, IndexError):
                continue
        id_part = f"{max_regnum + 1:03d}"  # 3 digits for parents/admins

    username = f"{prefix}/{school}/{month}/{year}/{id_part}"
    return username
