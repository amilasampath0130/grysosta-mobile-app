import { logger } from '@/lib/logger';

const BACKEND_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api').replace(/\/api\/?$/, '');

export const testBackendConnection = async (): Promise<boolean> => {
  try {
    logger.info('Testing backend connection');
    
    // First, try a simple fetch to see if server is reachable
    const response = await fetch(BACKEND_BASE_URL, {
      method: 'GET',
    });
    
    logger.info('Server response status', response.status);
    
    if (response.ok) {
      logger.info('Backend server is reachable');
      return true;
    } else {
      logger.warn('Backend server returned error', response.status);
      return false;
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Cannot connect to backend server', error.message);
    } else {
      logger.error('Cannot connect to backend server: Unknown error');
    }
    return false;
  }
};