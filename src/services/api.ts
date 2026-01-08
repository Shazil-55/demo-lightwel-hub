/**
 * API Service Functions
 */
import { API_BASE_URL, API_KEY } from '../config/api';
import { GetAllFloorPlansRequest, GetAllFloorPlansResponse } from '../types/api';

/**
 * Fetches floor plans for multiple projects
 * @param request - Request object containing project slugs
 * @returns Promise with floor plans data
 */
export const getAllFloorPlans = async (
  request: GetAllFloorPlansRequest
): Promise<GetAllFloorPlansResponse> => {
  const response = await fetch(`${API_BASE_URL}/floor-plans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': API_KEY,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch floor plans' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

