from django.contrib import admin
from .models import Event, EventImage


class EventImageInline(admin.TabularInline):
    model = EventImage
    extra = 1
    fields = ['image', 'title', 'description', 'alt_text', 'order']


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'event_type', 'display_type', 'background_theme',
        'is_active', 'is_published', 'created_by', 'created_at'
    ]
    list_filter = [
        'event_type', 'display_type', 'background_theme',
        'is_active', 'is_published', 'created_at'
    ]
    search_fields = ['title', 'subtitle', 'description', 'badge_text']
    readonly_fields = ['created_at', 'updated_at', 'is_current']
    inlines = [EventImageInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'subtitle', 'description', 'badge_text')
        }),
        ('Call to Action', {
            'fields': ('cta_text', 'secondary_cta_text')
        }),
        ('Event Settings', {
            'fields': ('event_type', 'background_theme', 'display_type')
        }),
        ('Dates', {
            'fields': ('start_date', 'end_date')
        }),
        ('Status', {
            'fields': ('is_active', 'is_published', 'is_current')
        }),
        ('Ribbon Settings', {
            'fields': ('ribbon_text', 'ribbon_speed'),
            'classes': ('collapse',)
        }),
        ('Carousel Settings', {
            'fields': ('carousel_interval', 'carousel_speed', 'show_indicators', 'show_controls', 'auto_play'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if not change:  # Only set created_by for new objects
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(created_by=request.user)


@admin.register(EventImage)
class EventImageAdmin(admin.ModelAdmin):
    list_display = ['event', 'title', 'order', 'image']
    list_filter = ['event', 'order']
    search_fields = ['event__title', 'title', 'description']
    ordering = ['event', 'order']
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(event__created_by=request.user)
