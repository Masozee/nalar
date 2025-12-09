import axios from 'axios';
import * as FileSystem from 'expo-file-system';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export interface Employee {
  id: string;
  employee_id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  department?: {
    id: string;
    name: string;
  };
  position?: string;
  job_title?: string;
  avatar?: string;
  face_registered: boolean;
}

export interface AttendanceRecord {
  id: string;
  employee: {
    id: string;
    employee_id: string;
    full_name: string;
  };
  date: string;
  check_in?: string;
  check_out?: string;
  status: string;
  work_hours?: number;
  check_in_location?: string;
  check_out_location?: string;
}

export interface FaceCheckInResponse {
  success: boolean;
  message: string;
  employee: {
    id: string;
    employee_id: string;
    full_name: string;
    department?: string;
  };
  confidence: number;
  attendance: AttendanceRecord;
}

/**
 * Register face for an employee
 */
export async function registerFace(
  employeeId: string,
  imageUri: string,
  token: string
): Promise<{ success: boolean; message: string; employee?: Employee }> {
  const formData = new FormData();

  // Create file object from URI
  const fileInfo = await FileSystem.getInfoAsync(imageUri);
  const file = {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'face.jpg',
  } as any;

  formData.append('face_image', file);

  const response = await axios.post(
    `${API_BASE_URL}/api/v1/hr/employees/${employeeId}/register-face/`,
    formData,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
}

/**
 * Remove face registration for an employee
 */
export async function removeFaceRegistration(
  employeeId: string,
  token: string
): Promise<{ success: boolean; message: string }> {
  const response = await axios.delete(
    `${API_BASE_URL}/api/v1/hr/employees/${employeeId}/remove-face/`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

/**
 * Check in using face recognition
 */
export async function faceCheckIn(
  imageUri: string,
  token: string,
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  }
): Promise<FaceCheckInResponse> {
  const formData = new FormData();

  const file = {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'face.jpg',
  } as any;

  formData.append('face_image', file);

  if (location) {
    formData.append('latitude', location.latitude.toString());
    formData.append('longitude', location.longitude.toString());
    if (location.address) {
      formData.append('location', location.address);
    }
  }

  const response = await axios.post(
    `${API_BASE_URL}/api/v1/hr/attendance/face-check-in/`,
    formData,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
}

/**
 * Check out using face recognition
 */
export async function faceCheckOut(
  imageUri: string,
  token: string,
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  }
): Promise<FaceCheckInResponse> {
  const formData = new FormData();

  const file = {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'face.jpg',
  } as any;

  formData.append('face_image', file);

  if (location) {
    formData.append('latitude', location.latitude.toString());
    formData.append('longitude', location.longitude.toString());
    if (location.address) {
      formData.append('location', location.address);
    }
  }

  const response = await axios.post(
    `${API_BASE_URL}/api/v1/hr/attendance/face-check-out/`,
    formData,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
}

/**
 * Verify face (find matching employee)
 */
export async function verifyFace(
  imageUri: string,
  token: string,
  employeeId?: string
): Promise<{
  match: boolean;
  confidence?: number;
  distance?: number;
  employee?: Employee;
  message?: string;
}> {
  const formData = new FormData();

  const file = {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'face.jpg',
  } as any;

  formData.append('face_image', file);

  if (employeeId) {
    formData.append('employee_id', employeeId);
  }

  const response = await axios.post(
    `${API_BASE_URL}/api/v1/hr/employees/verify-face/`,
    formData,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
}

/**
 * Get current employee profile
 */
export async function getMyProfile(token: string): Promise<Employee> {
  const response = await axios.get(
    `${API_BASE_URL}/api/v1/hr/employees/me/`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

/**
 * Get my attendance records
 */
export async function getMyAttendance(
  token: string,
  params?: {
    page?: number;
    page_size?: number;
  }
): Promise<{
  count: number;
  next?: string;
  previous?: string;
  results: AttendanceRecord[];
}> {
  const response = await axios.get(
    `${API_BASE_URL}/api/v1/hr/attendance/my-attendance/`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      params,
    }
  );

  return response.data;
}
