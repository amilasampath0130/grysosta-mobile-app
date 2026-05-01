import { apiService } from './apiService';
import { getApiBaseUrl } from '@/lib/apiBaseUrl';

const BACKEND_BASE_URL = getApiBaseUrl().replace(/\/api\/?$/, '');

export const testBackendConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing backend connection...');
    
    // First, try a simple fetch to see if server is reachable
    const response = await fetch(BACKEND_BASE_URL, {
      method: 'GET',
    });
    
    console.log('Server response status:', response.status);
    
    if (response.ok) {
      console.log('✅ Backend server is reachable');
      return true;
    } else {
      console.log('❌ Backend server returned error:', response.status);
      return false;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log('❌ Cannot connect to backend server:', error.message);
    } else {
      console.log('❌ Cannot connect to backend server: Unknown error');
    }
    return false;
  }
};