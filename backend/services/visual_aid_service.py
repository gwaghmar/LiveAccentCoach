"""
Visual Aid Service - Generates images using Gemini image generation.
Uses gemini-2.0-flash-preview-image-generation for interleaved output.
"""

import logging
import base64
from typing import Optional, Dict, Any
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)


class VisualAidService:
    """Generates visual aids for pronunciation coaching and story scenes."""

    def __init__(self, api_key: str, project_id: str = ""):
        self.api_key = api_key
        self.project_id = project_id
        self.client = genai.Client(api_key=api_key)

    async def generate_image(self, prompt: str, aspect_ratio: str = "1:1") -> Optional[Dict[str, Any]]:
        """Generate an image using Gemini image generation."""
        logger.info(f"Generating visual aid for prompt: {prompt}")
        
        try:
            # Using Imagen 3 via Vertex AI / GenAI SDK if available
            response = self.client.models.generate_images(
                model='imagen-3.0-generate-001',
                prompt=prompt,
                config=types.GenerateImagesConfig(
                    number_of_images=1,
                    aspect_ratio="1:1" if aspect_ratio == "1:1" else "16:9",
                )
            )
            
            if response and response.generated_images:
                image_data = response.generated_images[0].image.data
                base64_image = base64.b64encode(image_data).decode("utf-8")
                
                return {
                    "url": f"data:image/png;base64,{base64_image}",
                    "prompt": prompt,
                    "type": "image",
                    "source": "imagen-3.0"
                }
            
            logger.warning("No images generated")
            return None
        except Exception as e:
            logger.error(f"Image generation error: {e}")
            return None

    async def generate_pronunciation_visual(self, word: str, sound: str) -> Optional[Dict[str, Any]]:
        """Generate a mouth/tongue position diagram for a phoneme."""
        prompt = (
            f"Create a clear, professional diagram showing the correct mouth and tongue position "
            f"for pronouncing the '{sound}' sound in the word '{word}'. "
            f"Use a clean medical-illustration style with labels. White background."
        )
        return await self.generate_image(prompt, aspect_ratio="1:1")

    async def generate_scene(self, scene_description: str) -> Optional[Dict[str, Any]]:
        """Generate a background scene image for Story Mode."""
        prompt = (
            f"Create a photorealistic scene: {scene_description}. "
            f"Wide cinematic shot, 16:9, high quality, no text overlays."
        )
        return await self.generate_image(prompt, aspect_ratio="16:9")


_instance: Optional[VisualAidService] = None


def get_visual_aid_service(api_key: str, project_id: str = "") -> VisualAidService:
    global _instance
    if _instance is None:
        _instance = VisualAidService(api_key, project_id)
    return _instance
