"""
Face Recognition Service using AWS Rekognition
"""
import os
import boto3
from typing import Dict, Optional, Tuple
from botocore.exceptions import ClientError
from django.core.files.uploadedfile import UploadedFile


class FaceRecognitionService:
    """
    Service for face detection and comparison using AWS Rekognition.

    AWS Rekognition provides:
    - Face detection in images
    - Face comparison between two images
    - Face attributes (age, gender, emotions, etc.)
    - No ML model training required
    - Pay per API call
    """

    def __init__(self):
        """Initialize AWS Rekognition client"""
        self.client = boto3.client(
            'rekognition',
            region_name=os.getenv('AWS_REKOGNITION_REGION', 'us-east-1'),
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
        )

    def detect_faces(self, image_bytes: bytes) -> Dict:
        """
        Detect faces in an image.

        Args:
            image_bytes: Image file as bytes

        Returns:
            Dict containing face detection results
        """
        try:
            response = self.client.detect_faces(
                Image={'Bytes': image_bytes},
                Attributes=['ALL']  # Get all face attributes
            )

            return {
                'success': True,
                'face_count': len(response.get('FaceDetails', [])),
                'faces': response.get('FaceDetails', []),
            }
        except ClientError as e:
            return {
                'success': False,
                'error': str(e),
                'face_count': 0,
                'faces': [],
            }

    def compare_faces(
        self,
        source_image: bytes,
        target_image: bytes,
        similarity_threshold: float = 90.0
    ) -> Dict:
        """
        Compare two faces to determine if they're the same person.

        Args:
            source_image: First image as bytes (e.g., employee photo)
            target_image: Second image as bytes (e.g., attendance photo)
            similarity_threshold: Minimum similarity percentage (0-100)

        Returns:
            Dict with comparison results:
            {
                'success': bool,
                'match': bool,
                'similarity': float,
                'confidence': float,
                'face_matches': list
            }
        """
        try:
            response = self.client.compare_faces(
                SourceImage={'Bytes': source_image},
                TargetImage={'Bytes': target_image},
                SimilarityThreshold=similarity_threshold
            )

            face_matches = response.get('FaceMatches', [])

            if face_matches:
                # Get the best match
                best_match = face_matches[0]
                similarity = best_match.get('Similarity', 0)
                confidence = best_match['Face'].get('Confidence', 0)

                return {
                    'success': True,
                    'match': True,
                    'similarity': similarity,
                    'confidence': confidence,
                    'face_matches': face_matches,
                    'message': f'Faces match with {similarity:.2f}% similarity'
                }
            else:
                return {
                    'success': True,
                    'match': False,
                    'similarity': 0,
                    'confidence': 0,
                    'face_matches': [],
                    'message': 'Faces do not match'
                }

        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', '')
            error_message = e.response.get('Error', {}).get('Message', str(e))

            return {
                'success': False,
                'match': False,
                'error': error_message,
                'error_code': error_code,
                'similarity': 0,
                'confidence': 0,
            }

    def verify_employee_photo(
        self,
        employee_photo: bytes,
        verification_photo: bytes,
        threshold: float = 95.0
    ) -> Tuple[bool, Dict]:
        """
        Verify if a photo matches an employee's registered photo.
        Higher threshold for employee verification.

        Args:
            employee_photo: Employee's registered photo
            verification_photo: Photo to verify
            threshold: Similarity threshold (default 95%)

        Returns:
            Tuple of (is_match: bool, details: dict)
        """
        result = self.compare_faces(employee_photo, verification_photo, threshold)

        if not result['success']:
            return False, result

        return result['match'], result

    def extract_face_attributes(self, image_bytes: bytes) -> Optional[Dict]:
        """
        Extract face attributes from an image (age, gender, emotions, etc.)

        Args:
            image_bytes: Image as bytes

        Returns:
            Dict with face attributes or None if no face found
        """
        result = self.detect_faces(image_bytes)

        if not result['success'] or result['face_count'] == 0:
            return None

        # Get first face (largest)
        face = result['faces'][0]

        return {
            'age_range': face.get('AgeRange', {}),
            'gender': face.get('Gender', {}).get('Value'),
            'emotions': face.get('Emotions', []),
            'smile': face.get('Smile', {}).get('Value'),
            'eyeglasses': face.get('Eyeglasses', {}).get('Value'),
            'sunglasses': face.get('Sunglasses', {}).get('Value'),
            'beard': face.get('Beard', {}).get('Value'),
            'mustache': face.get('Mustache', {}).get('Value'),
            'eyes_open': face.get('EyesOpen', {}).get('Value'),
            'mouth_open': face.get('MouthOpen', {}).get('Value'),
            'quality': face.get('Quality', {}),
        }

    @staticmethod
    def read_image_file(file: UploadedFile) -> bytes:
        """
        Read an uploaded file into bytes.

        Args:
            file: Django UploadedFile

        Returns:
            File contents as bytes
        """
        if hasattr(file, 'read'):
            file.seek(0)  # Reset file pointer
            return file.read()
        return file

    def find_matching_employee(
        self,
        verification_image_bytes: bytes,
        employees_queryset,
        threshold: float = 90.0
    ) -> Optional[Tuple]:
        """
        Find matching employee by comparing face with all registered employees.

        Args:
            verification_image_bytes: Photo to verify
            employees_queryset: Queryset of employees to check against
            threshold: Similarity threshold (default 90%)

        Returns:
            Tuple of (employee, similarity) or None if no match
        """
        best_match = None
        best_similarity = 0

        # Filter employees with registered faces
        employees = employees_queryset.filter(face_registered=True, face_image__isnull=False)

        for employee in employees:
            try:
                # Read employee's registered face image
                employee.face_image.seek(0)
                employee_photo_bytes = employee.face_image.read()

                # Compare faces
                result = self.compare_faces(
                    employee_photo_bytes,
                    verification_image_bytes,
                    threshold
                )

                if result['success'] and result['match']:
                    similarity = result['similarity']
                    if similarity > best_similarity:
                        best_similarity = similarity
                        best_match = (employee, similarity)

            except Exception as e:
                # Skip this employee on error
                continue

        return best_match


# Singleton instance
face_service = FaceRecognitionService()
