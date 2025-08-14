from django.apps import AppConfig


class LessonConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'lesson'
    verbose_name = 'Lesson Management'
    
    def ready(self):
        """Import signals when app is ready"""
        import lesson.signals
