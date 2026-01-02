# Add to views.py or create utils/signature_handler.py

import logging
import cloudinary.uploader
from django.core.exceptions import ValidationError
from django.utils import timezone
from PIL import Image

import io

logger = logging.getLogger(__name__)

def upload_signature_to_cloudinary(signature_file, user, signature_type='teacher'):
    """
    Upload signature to Cloudinary with validation and optimization.
    
    Args:
        signature_file: The uploaded file object
        user: The user uploading the signature
        signature_type: 'teacher' or 'head_teacher'
    
    Returns:
        dict: Upload result with signature_url and public_id
    """
    # Validate file size (max 2MB)
    if signature_file.size > 2 * 1024 * 1024:
        raise ValidationError("Signature image must be less than 2MB")
    
    # Validate file type
    allowed_types = ['image/png', 'image/jpeg', 'image/jpg']
    if signature_file.content_type not in allowed_types:
        raise ValidationError("Only PNG and JPEG images are allowed")
    
    # Optional: Validate image dimensions (signatures should be reasonable size)
    try:
        image = Image.open(signature_file)
        width, height = image.size
        
        # Ensure signature is not too small or too large
        if width < 100 or height < 50:
            raise ValidationError("Signature image is too small (min 100x50 pixels)")
        
        if width > 2000 or height > 1000:
            raise ValidationError("Signature image is too large (max 2000x1000 pixels)")
        
        # Reset file pointer after reading
        signature_file.seek(0)
        
    except Exception as e:
        raise ValidationError(f"Invalid image file: {str(e)}")
    
    try:
        # Upload to Cloudinary with optimizations
        upload_result = cloudinary.uploader.upload(
            signature_file,
            folder=f'signatures/{signature_type}s',
            resource_type='image',
            public_id=f'{signature_type}_{user.id}_{int(timezone.now().timestamp())}',
            overwrite=True,
            invalidate=True,
            # Transformations for optimization
            eager=[
                {'width': 400, 'height': 200, 'crop': 'limit', 'quality': 'auto:best'},
            ],
            # PNG with transparency support
            format='png',
        )
        
        return {
            'signature_url': upload_result.get('secure_url'),
            'public_id': upload_result.get('public_id'),
            'width': upload_result.get('width'),
            'height': upload_result.get('height'),
        }
        
    except Exception as e:
        logger.error(f"Cloudinary upload failed: {e}", exc_info=True)
        raise ValidationError(f"Failed to upload signature: {str(e)}")