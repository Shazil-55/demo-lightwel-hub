/**
 * Example usage of useFloorPlans hook
 * 
 * This file demonstrates how to use the useFloorPlans hook in your components.
 * You can delete this file once you've integrated it into your actual components.
 */

import { useFloorPlans } from './useFloorPlans';

// Example component
export const FloorPlansExample = () => {
  // Example: Fetch floor plans for multiple projects
  const projectSlugs = ['lightwell', 'neighbour'];
  
  const { data, isLoading, error, isError } = useFloorPlans(projectSlugs, {
    enabled: true, // Set to false to disable automatic fetching
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return <div>Loading floor plans...</div>;
  }

  if (isError) {
    return <div>Error: {error?.message}</div>;
  }

  return (
    <div>
      <h2>Floor Plans</h2>
      {data?.data.map((floorPlan) => (
        <div key={floorPlan.id}>
          <h3>{floorPlan.name || 'Unnamed Floor Plan'}</h3>
          <p>ID: {floorPlan.id}</p>
          {floorPlan.units && (
            <p>Units: {floorPlan.units.length}</p>
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * Usage in your components:
 * 
 * import { useFloorPlans } from './hooks/useFloorPlans';
 * 
 * function MyComponent() {
 *   const { data, isLoading, error } = useFloorPlans(['project-slug-1', 'project-slug-2']);
 *   
 *   // Your component logic here
 * }
 */

