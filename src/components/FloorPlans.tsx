import { FC, useState, useMemo } from "react";
import { useFloorPlans } from "../hooks/useFloorPlans";
import { useFavorites } from "../hooks/useFavorites";
import { FloorPlanCard } from "./FloorPlanCard";
import { FloorPlanDetailModal } from "./FloorPlanDetailModal";
import { FloorPlanComparisonModal } from "./FloorPlanComparisonModal";
import { FloorPlanResponse } from "../types/api";
import { ProjectConfig } from "../types";
import { FloorPlanFilters } from "../App";

interface FloorPlansProps {
  projectSlugs?: string[];
  config: ProjectConfig;
  filters: FloorPlanFilters;
}

const FloorPlans: FC<FloorPlansProps> = ({ projectSlugs, config, filters }) => {
  // Use specified slugs: ansoku, solin, willa
  const slugs = projectSlugs || ["ansoku", "solin", "willa"];
  const [selectedFloorPlan, setSelectedFloorPlan] =
    useState<FloorPlanResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  // Create a map of projectId to project name
  const projectNameMap = useMemo(() => {
    const map = new Map<string, string>();
    config.projects.forEach((project) => {
      if (project.projectId) {
        map.set(project.projectId, project.name);
      }
    });
    return map;
  }, [config]);

  // Helper function to get project name by projectId
  const getProjectName = (
    projectId: string | null | undefined
  ): string | null => {
    if (!projectId) return null;
    return projectNameMap.get(projectId) || null;
  };

  const { data, isLoading, error, isError } = useFloorPlans(slugs, {
    enabled: true,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter the floor plans based on selected filters
  const filteredFloorPlans = useMemo(() => {
    if (!data?.data) return [];
    
    return data.data.filter((fp) => {
      // Filter by project name
      if (filters.projectName) {
        const projectName = getProjectName(fp.projectId);
        if (projectName !== filters.projectName) return false;
      }
      
      // Filter by bedrooms
      if (filters.bedrooms && fp.bedRooms !== filters.bedrooms) return false;
      
      // Filter by bathrooms
      if (filters.bathrooms && fp.bathRooms !== filters.bathrooms) return false;
      
      // Filter by size range
      if (filters.sizeRange) {
        const size = parseInt(fp.totalSize || fp.interiorSize || "0", 10);
        if (size < filters.sizeRange.min || size > filters.sizeRange.max) return false;
      }
      
      return true;
    });
  }, [data?.data, filters, projectNameMap]);

  const handleCardClick = (floorPlan: FloorPlanResponse) => {
    setSelectedFloorPlan(floorPlan);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFloorPlan(null);
  };

  const handleToggleFavorite = (floorPlanId: string) => {
    toggleFavorite(floorPlanId);
  };

  const handleOpenCompare = () => {
    setIsCompareModalOpen(true);
  };

  const handleCloseCompare = () => {
    setIsCompareModalOpen(false);
  };

  // Get favorited floor plans
  const favoritedFloorPlans = useMemo(() => {
    if (!data?.data) return [];
    return data.data.filter((fp) => favorites.includes(fp.id));
  }, [data?.data, favorites]);

  const canCompare = favoritedFloorPlans.length >= 2;

  if (isLoading) {
    return (
      <div className="proxima-hub-floor-plans-container">
        <div className="proxima-hub-floor-plans-loading">
          Loading floor plans...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="proxima-hub-floor-plans-container">
        <div className="proxima-hub-floor-plans-error">
          Error loading floor plans: {error?.message || "Unknown error"}
        </div>
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div className="proxima-hub-floor-plans-container">
        <div className="proxima-hub-floor-plans-empty">
          No floor plans available
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="proxima-hub-floor-plans-container">
        {/* Floor Plans Grid */}
        <div className="proxima-hub-floor-plans-grid">
          {filteredFloorPlans.length === 0 ? (
            <div className="proxima-hub-floor-plans-no-results">
              No floor plans match your filters
            </div>
          ) : (
            filteredFloorPlans.map((floorPlan) => {
              const projectName = getProjectName(floorPlan.projectId);
              return (
                <FloorPlanCard
                  key={floorPlan.id}
                  floorPlan={floorPlan}
                  projectName={projectName}
                  isFavorite={isFavorite(floorPlan.id)}
                  onToggleFavorite={() => handleToggleFavorite(floorPlan.id)}
                  onClick={() => handleCardClick(floorPlan)}
                />
              );
            })
          )}
        </div>
      </div>
      {canCompare && (
        <div className="proxima-hub-floor-plans-compare-container">
          <button
            className="proxima-hub-floor-plans-compare-btn"
            onClick={handleOpenCompare}
          >
            Compare
          </button>
        </div>
      )}

      {/* Detail Modal - Rendered once at parent level */}
      <FloorPlanDetailModal
        floorPlan={selectedFloorPlan}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Comparison Modal */}
      <FloorPlanComparisonModal
        isOpen={isCompareModalOpen}
        onClose={handleCloseCompare}
        favoritedFloorPlans={favoritedFloorPlans}
        config={config}
        getProjectName={getProjectName}
      />
    </>
  );
};

export default FloorPlans;
