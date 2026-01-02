# students/management/commands/fix_duplicates.py
from django.core.management.base import BaseCommand
from classroom.models import Classroom, StudentEnrollment
from collections import defaultdict

class Command(BaseCommand):
    help = "Fix duplicate classrooms by keeping the one with a teacher"

    def handle(self, *args, **options):
        duplicates = defaultdict(list)
        for c in Classroom.objects.all():
            key = (c.section_id, c.academic_session_id, c.term_id)
            duplicates[key].append(c)

        for key, cls_list in duplicates.items():
            if len(cls_list) > 1:
                classroom1 = cls_list[0]
                classroom2 = cls_list[1]

                # Decide which classroom to keep
                if classroom1.class_teacher and not classroom2.class_teacher:
                    keep_classroom = classroom1
                    delete_classroom = classroom2
                elif classroom2.class_teacher and not classroom1.class_teacher:
                    keep_classroom = classroom2
                    delete_classroom = classroom1
                else:
                    keep_classroom = classroom1
                    delete_classroom = classroom2

                self.stdout.write(
                    f"Keeping classroom {keep_classroom.id} ({keep_classroom.name}), "
                    f"deleting {delete_classroom.id} ({delete_classroom.name})"
                )

                # Move students
                StudentEnrollment.objects.filter(classroom=delete_classroom).update(
                    classroom=keep_classroom
                )
                # Delete duplicate
                delete_classroom.delete()
