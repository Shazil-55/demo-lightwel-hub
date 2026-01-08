import { useState, useEffect, useMemo } from 'react';
import { FloorPlanResponse } from '../types/api';
import { ProjectConfig } from '../types';

interface FloorPlanComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  favoritedFloorPlans: FloorPlanResponse[];
  config: ProjectConfig;
  getProjectName: (projectId: string | null | undefined) => string | null;
}

export const FloorPlanComparisonModal = ({
  isOpen,
  onClose,
  favoritedFloorPlans,
  getProjectName,
}: FloorPlanComparisonModalProps) => {
  const [leftFloorPlan, setLeftFloorPlan] = useState<FloorPlanResponse | null>(null);
  const [rightFloorPlan, setRightFloorPlan] = useState<FloorPlanResponse | null>(null);
  const [pickerSide, setPickerSide] = useState<0 | 1 | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Initialize with first two favorites
  useEffect(() => {
    if (isOpen && favoritedFloorPlans.length >= 2) {
      setLeftFloorPlan(favoritedFloorPlans[0]);
      setRightFloorPlan(favoritedFloorPlans[1]);
    }
  }, [isOpen, favoritedFloorPlans]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPickerSide(null);
      setIsExpanded(false);
    }
  }, [isOpen]);

  // Get candidate floor plans for picker (excluding currently compared)
  const candidateFloorPlans = useMemo(() => {
    if (!isOpen) return [];
    const excludedIds = new Set([leftFloorPlan?.id, rightFloorPlan?.id].filter(Boolean));
    return favoritedFloorPlans.filter((fp) => fp.id && !excludedIds.has(fp.id));
  }, [favoritedFloorPlans, leftFloorPlan?.id, rightFloorPlan?.id, isOpen]);

  // Floor plans to compare
  const floorPlansToCompare = useMemo(() => {
    return [leftFloorPlan, rightFloorPlan].filter((fp): fp is FloorPlanResponse => fp !== null);
  }, [leftFloorPlan, rightFloorPlan]);

  if (!isOpen || favoritedFloorPlans.length < 2) return null;

  const getRenderingsImage = (floorPlan: FloorPlanResponse | null) => {
    if (!floorPlan?.renderings || !Array.isArray(floorPlan.renderings) || floorPlan.renderings.length === 0) {
      return null;
    }
    const firstRendering = floorPlan.renderings[0];
    if (firstRendering?.images && Array.isArray(firstRendering.images) && firstRendering.images.length > 0) {
      return firstRendering.images[0]?.link || null;
    }
    return firstRendering?.link || null;
  };

  const getFloorPlanImage = (floorPlan: FloorPlanResponse | null) => {
    if (!floorPlan) return null;
    return (
      floorPlan.floorPlanPhoto?.[0]?.link ||
      floorPlan.keyPlan?.[0]?.link ||
      getRenderingsImage(floorPlan) ||
      null
    );
  };

  const getKeyPlanImage = (floorPlan: FloorPlanResponse | null) => {
    if (!floorPlan) return null;
    return floorPlan.keyPlan?.[0]?.link || null;
  };

  // Format bedrooms (3.5 → "3 Beds + Den")
  const formatBedrooms = (beds: string | null | undefined): string => {
    if (!beds) return "";
    const num = parseFloat(beds);
    if (isNaN(num)) return beds;
    const whole = Math.floor(num);
    const hasDecimal = num % 1 !== 0;
    const plural = whole !== 1 ? "s" : "";
    if (hasDecimal) {
      return `${whole} Bed${plural} + Den`;
    }
    return `${whole} Bed${plural}`;
  };

  // Format bathrooms (2.5 → "2 Baths + Powder")
  const formatBathrooms = (baths: string | null | undefined): string => {
    if (!baths) return "";
    const num = parseFloat(baths);
    if (isNaN(num)) return baths;
    const whole = Math.floor(num);
    const hasDecimal = num % 1 !== 0;
    const plural = whole !== 1 ? "s" : "";
    if (hasDecimal) {
      return `${whole} Bath${plural} + Powder`;
    }
    return `${whole} Bath${plural}`;
  };

  const handleReplaceFloorPlan = (sideIndex: 0 | 1, floorPlan: FloorPlanResponse) => {
    if (sideIndex === 0) {
      setLeftFloorPlan(floorPlan);
    } else {
      setRightFloorPlan(floorPlan);
    }
    setPickerSide(null);
  };

  const formatFloorPlanTitle = (fp: FloorPlanResponse) => {
    const projectName = getProjectName(fp.projectId);
    return projectName ? `${projectName}, ${fp.name}` : fp.name || 'Floor Plan';
  };

  const formatFloorPlanMeta = (fp: FloorPlanResponse) => {
    const parts: string[] = [];
    if (fp.bedRooms) parts.push(formatBedrooms(fp.bedRooms));
    if (fp.bathRooms) parts.push(formatBathrooms(fp.bathRooms));
    const size = (fp.totalSize ?? fp.interiorSize ?? '').toString().trim();
    if (size) parts.push(size);
    return parts.join(' | ');
  };

  const FloorPlanDetails = ({
    floorPlan,
    index,
    isExpanded,
  }: {
    floorPlan: FloorPlanResponse;
    index: number;
    isExpanded: boolean;
  }) => {
    const imageUrl = getFloorPlanImage(floorPlan);
    const keyPlanUrl = getKeyPlanImage(floorPlan);

    return (
      <div className={`fp-unit-section ${index === 0 ? 'fp-unit-section-left' : ''}`}>
        {/* Top Section - Header with Key Plan and Info (hidden when expanded) */}
        {!isExpanded && (
          <div className="fp-unit-header">
            {/* Left: Key Plan */}
            <div className="fp-unit-keyplan">
              {keyPlanUrl ? (
                <img src={keyPlanUrl} alt="Key Plan" />
              ) : (
                <div className="fp-unit-keyplan-empty">No map</div>
              )}
            </div>

            {/* Right: Floor Plan Info */}
            <div className="fp-unit-info">
              {/* Line 1: Name */}
              <div className="fp-unit-name">
                {formatFloorPlanTitle(floorPlan)}
              </div>

              {/* Line 2: Interior, Exterior */}
              <div className="fp-unit-sizes">
                {floorPlan.interiorSize && `Interior ${floorPlan.interiorSize}`}
                {floorPlan.interiorSize && floorPlan.exteriorSize && ' | '}
                {floorPlan.exteriorSize && `Exterior ${floorPlan.exteriorSize}`}
                {!floorPlan.interiorSize && !floorPlan.exteriorSize && (
                  <span className="fp-unit-na">Size not available</span>
                )}
              </div>

              {/* Line 3: Bed, Bath */}
              <div className="fp-unit-bedbath">
                {floorPlan.bedRooms && formatBedrooms(floorPlan.bedRooms)}
                {floorPlan.bedRooms && floorPlan.bathRooms && ' | '}
                {floorPlan.bathRooms && formatBathrooms(floorPlan.bathRooms)}
                {!floorPlan.bedRooms && !floorPlan.bathRooms && (
                  <span className="fp-unit-na">Bed/Bath not available</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Compact header when expanded - just floor plan name */}
        {isExpanded && (
          <div className="fp-unit-header-compact">
            <div className="fp-unit-name-compact">
              {formatFloorPlanTitle(floorPlan)}
            </div>
          </div>
        )}

        {/* Main Floor Plan Image - Large and Prominent */}
        <div className="fp-unit-image">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={floorPlan.name || 'Floor plan'}
            />
          ) : (
            <div className="fp-unit-image-empty">
              No floor plan image available
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Full Screen Modal */}
      <div className="fp-modal-backdrop" onClick={onClose}>
        <div className="fp-modal-container" onClick={(e) => e.stopPropagation()}>
          {/* Comparison Content */}
          <div className="fp-modal-body">
            {floorPlansToCompare.map((floorPlan, index) => (
              <FloorPlanDetails
                key={floorPlan.id}
                floorPlan={floorPlan}
                index={index}
                isExpanded={isExpanded}
              />
            ))}

            {/* Placeholder for second floor plan if only one selected */}
            {floorPlansToCompare.length === 1 && (
              <div className="fp-unit-section fp-unit-placeholder">
                <div className="fp-unit-placeholder-content">
                  <p>Select another floor plan to compare</p>
                  <button
                    onClick={() => setPickerSide(1)}
                    className="fp-compare-others-btn"
                  >
                    Compare Others
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer - Controls */}
          <div className="fp-modal-footer">
            {/* Left: Close button */}
            <button
              type="button"
              onClick={onClose}
              className="fp-footer-close-btn"
              aria-label="Close comparison"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Center: Compare buttons and zoom */}
            <div className="fp-footer-center">
              {/* Left Compare Others button */}
              <button
                type="button"
                onClick={() => setPickerSide(0)}
                className="fp-compare-others-btn"
                aria-label="Compare other floor plan on left"
              >
                Compare Others
              </button>

              {/* Center zoom button */}
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="fp-footer-zoom-btn"
                aria-label={isExpanded ? "Show details" : "Expand images"}
              >
                {isExpanded ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                    <line x1="8" y1="11" x2="14" y2="11"></line>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                    <line x1="11" y1="8" x2="11" y2="14"></line>
                    <line x1="8" y1="11" x2="14" y2="11"></line>
                  </svg>
                )}
              </button>

              {/* Right Compare Others button */}
              <button
                type="button"
                onClick={() => setPickerSide(1)}
                className="fp-compare-others-btn"
                aria-label="Compare other floor plan on right"
              >
                Compare Others
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Compare Others Picker Modal */}
      {pickerSide !== null && (
        <div
          className="fp-picker-backdrop"
          onClick={() => setPickerSide(null)}
        >
          <div className="fp-picker-container">
            <div
              className="fp-picker-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="fp-picker-header">
                <div className="fp-picker-title">Select a floor plan to replace</div>
                <button
                  type="button"
                  onClick={() => setPickerSide(null)}
                  className="fp-picker-close"
                  aria-label="Close picker"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div className="fp-picker-list">
                {candidateFloorPlans.length === 0 ? (
                  <div className="fp-picker-empty">No other floor plans available.</div>
                ) : (
                  <div className="fp-picker-items">
                    {candidateFloorPlans.map((fp) => {
                      const thumb = getFloorPlanImage(fp);
                      const title = formatFloorPlanTitle(fp);
                      const meta = formatFloorPlanMeta(fp);

                      return (
                        <button
                          key={fp.id}
                          type="button"
                          onClick={() => handleReplaceFloorPlan(pickerSide, fp)}
                          className="fp-picker-item"
                        >
                          <div className="fp-picker-item-thumb">
                            {thumb ? (
                              <img src={thumb} alt={fp.name || 'Floor plan'} />
                            ) : (
                              <div className="fp-picker-item-no-image">No image</div>
                            )}
                          </div>
                          <div className="fp-picker-item-info">
                            <div className="fp-picker-item-title">{title}</div>
                            {meta && <div className="fp-picker-item-meta">{meta}</div>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
