import { FloorPlanResponse } from '../types/api';

interface CompareOthersModalProps {
  isOpen: boolean;
  onClose: () => void;
  favoritedFloorPlans: FloorPlanResponse[];
  currentLeftId: string | null;
  currentRightId: string | null;
  replaceSide: 'left' | 'right';
  onSelect: (floorPlan: FloorPlanResponse) => void;
  getProjectName: (projectId: string | null | undefined) => string | null;
}

export const CompareOthersModal = ({
  isOpen,
  onClose,
  favoritedFloorPlans,
  currentLeftId,
  currentRightId,
  replaceSide,
  onSelect,
  getProjectName,
}: CompareOthersModalProps) => {
  if (!isOpen) return null;

  const getRenderingsImage = (floorPlan: FloorPlanResponse) => {
    if (!floorPlan?.renderings || !Array.isArray(floorPlan.renderings) || floorPlan.renderings.length === 0) {
      return null;
    }
    const firstRendering = floorPlan.renderings[0];
    if (firstRendering?.images && Array.isArray(firstRendering.images) && firstRendering.images.length > 0) {
      return firstRendering.images[0]?.link || null;
    }
    return firstRendering?.link || null;
  };

  const getFloorPlanImage = (floorPlan: FloorPlanResponse) => {
    return (
      floorPlan.floorPlanPhoto?.[0]?.link ||
      floorPlan.keyPlan?.[0]?.link ||
      getRenderingsImage(floorPlan) ||
      null
    );
  };

  const formatBedBath = (floorPlan: FloorPlanResponse) => {
    const beds = floorPlan.bedRooms || '0';
    const baths = floorPlan.bathRooms || '0';
    return `${beds} Bed${beds !== '1' ? 's' : ''} | ${baths} Bath${baths !== '1' ? 's' : ''}`;
  };

  const formatSize = (floorPlan: FloorPlanResponse) => {
    return floorPlan.totalSize || floorPlan.interiorSize || 'N/A';
  };

  // Filter out the currently displayed floor plan on the side being replaced
  const availableFloorPlans = favoritedFloorPlans.filter((fp) => {
    if (replaceSide === 'left') {
      return fp.id !== currentLeftId;
    } else {
      return fp.id !== currentRightId;
    }
  });

  return (
    <div className="proxima-hub-modal-overlay proxima-hub-compare-others-overlay" onClick={onClose}>
      <div
        className="proxima-hub-modal-content proxima-hub-compare-others-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="proxima-hub-compare-others-header">
          <h3 className="proxima-hub-compare-others-title">Select Floor Plan</h3>
          <button
            className="proxima-hub-modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="proxima-hub-compare-others-list">
          {availableFloorPlans.length === 0 ? (
            <div className="proxima-hub-compare-others-empty">
              No other floor plans available
            </div>
          ) : (
            availableFloorPlans.map((floorPlan) => {
              const projectName = getProjectName(floorPlan.projectId);
              const imageUrl = getFloorPlanImage(floorPlan);
              const displayName = projectName ? `${projectName}, ${floorPlan.name}` : floorPlan.name;

              return (
                <div
                  key={floorPlan.id}
                  className="proxima-hub-compare-others-item"
                  onClick={() => onSelect(floorPlan)}
                >
                  {imageUrl ? (
                    <div className="proxima-hub-compare-others-thumbnail">
                      <img src={imageUrl} alt={floorPlan.name || 'Floor plan'} />
                    </div>
                  ) : (
                    <div className="proxima-hub-compare-others-thumbnail proxima-hub-compare-others-thumbnail-placeholder">
                      No image
                    </div>
                  )}
                  <div className="proxima-hub-compare-others-info">
                    <div className="proxima-hub-compare-others-name">{displayName}</div>
                    <div className="proxima-hub-compare-others-specs">
                      {formatBedBath(floorPlan)} | {formatSize(floorPlan)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

