import { useState, useMemo, useEffect } from 'react';
import { FloorPlanResponse } from '../types/api';

interface FloorPlanDetailModalProps {
  floorPlan: FloorPlanResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FloorPlanDetailModal = ({
  floorPlan,
  isOpen,
  onClose,
}: FloorPlanDetailModalProps) => {
  const [showFullDisclaimer, setShowFullDisclaimer] = useState(false);

  // Get floorplan image
  const getRenderingsImage = () => {
    if (!floorPlan?.renderings || !Array.isArray(floorPlan.renderings) || floorPlan.renderings.length === 0) {
      return null;
    }
    const firstRendering = floorPlan.renderings[0];
    // Handle new format: rendering sections with images array
    if (firstRendering?.images && Array.isArray(firstRendering.images) && firstRendering.images.length > 0) {
      return firstRendering.images[0]?.link || null;
    }
    // Handle old format: direct array of images
    return firstRendering?.link || null;
  };

  const floorPlanImageUrl =
    floorPlan?.floorPlanPhoto?.[0]?.link ||
    floorPlan?.keyPlan?.[0]?.link ||
    getRenderingsImage() ||
    null;

  // Format price
  const formattedPrice = useMemo(() => {
    if (!floorPlan?.price) return null;
    const price = floorPlan.price;
    if (price.startsWith('from') || price.startsWith('From') || price.startsWith('$')) {
      return price;
    }
    return `from $${price}`;
  }, [floorPlan?.price]);

  // Format bedrooms (3.5 → "3 Beds + Den")
  const formatBedrooms = (beds: string | null | undefined): string => {
    if (!beds) return "0 Beds";
    const num = parseFloat(beds);
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
    if (!baths) return "0 Baths";
    const num = parseFloat(baths);
    const whole = Math.floor(num);
    const hasDecimal = num % 1 !== 0;
    const plural = whole !== 1 ? "s" : "";
    if (hasDecimal) {
      return `${whole} Bath${plural} + Powder`;
    }
    return `${whole} Bath${plural}`;
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowFullDisclaimer(false);
    }
  }, [isOpen]);

  const handleDownload = () => {
    const downloadUrl =
      floorPlan?.marketingPdf?.[0]?.link ||
      floorPlanImageUrl;
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = floorPlan?.marketingPdf?.[0]?.name || floorPlan?.name || 'floor-plan';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Floor Plan: ${floorPlan?.name || 'Floor Plan'}`);
    const body = encodeURIComponent(
      `I'm interested in this floor plan:\n\n${floorPlan?.name || 'Floor Plan'}\n${
        floorPlan?.totalSize || floorPlan?.interiorSize ? `Size: ${floorPlan.totalSize || floorPlan.interiorSize} sqft\n` : ''
      }${floorPlan?.bedRooms ? `Bedrooms: ${floorPlan.bedRooms}\n` : ''}${floorPlan?.bathRooms ? `Bathrooms: ${floorPlan.bathRooms}\n` : ''}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  if (!isOpen || !floorPlan) return null;

  return (
    <div
      className="proxima-hub-modal-overlay"
      onClick={onClose}
    >
      <div
        className="proxima-hub-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Content */}
        <div className="proxima-hub-modal-body">
          {/* Left Side - Floorplan Image */}
          <div className="proxima-hub-modal-image-section">
            {floorPlanImageUrl ? (
              <img
                src={floorPlanImageUrl}
                alt={floorPlan.name || 'Floor plan'}
                className="proxima-hub-modal-image"
              />
            ) : (
              <div className="proxima-hub-modal-image-placeholder">
                No floorplan image available
              </div>
            )}

            {floorPlan.customDisclaimer && (
              <div className="proxima-hub-modal-custom-disclaimer">
                <div className="proxima-hub-modal-disclaimer-content">
                  <span>{floorPlan.customDisclaimer}</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="proxima-hub-info-icon"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Details */}
          <div className="proxima-hub-modal-details-section">
            {/* Header */}
            <div className="proxima-hub-modal-header">
              <div className="proxima-hub-modal-badges">
                {formattedPrice && (
                  <span className="proxima-hub-modal-price-badge">
                    {formattedPrice}
                  </span>
                )}
              </div>
              <div className="proxima-hub-modal-title-row">
                <div className="proxima-hub-modal-title">
                  {floorPlan.name}
                </div>
                <div className="proxima-hub-modal-actions">
                  {floorPlan.applyNowUrl && (
                    <a
                      href={floorPlan.applyNowUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="proxima-hub-modal-apply-btn"
                    >
                      Apply Now
                    </a>
                  )}
                  <button
                    onClick={handleDownload}
                    className="proxima-hub-modal-icon-btn"
                    aria-label="Download"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                  </button>
                  <button
                    onClick={handleEmail}
                    className="proxima-hub-modal-icon-btn"
                    aria-label="Email"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="proxima-hub-modal-scrollable-content">
              {/* Description */}
              {floorPlan.description && (
                <div className="proxima-hub-modal-description">
                  <span className="proxima-hub-modal-description-text">{floorPlan.description}</span>
                  <button
                    onClick={() => setShowFullDisclaimer(!showFullDisclaimer)}
                    className="proxima-hub-modal-info-btn"
                    aria-label="Show full disclaimer"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                  </button>
                  {showFullDisclaimer && (
                    <div className="proxima-hub-modal-full-disclaimer">
                      <div className="proxima-hub-modal-full-disclaimer-content">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="proxima-hub-info-icon-white"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        <span>{floorPlan.description}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Specifications Grid */}
              <div className="proxima-hub-modal-specs-grid">
                {floorPlan.interiorSize && (
                  <div className="proxima-hub-modal-spec-item">
                    <div className="proxima-hub-modal-spec-label">Interior (sqft)</div>
                    <div className="proxima-hub-modal-spec-value">{floorPlan.interiorSize}</div>
                  </div>
                )}
                {floorPlan.exteriorSize && (
                  <div className="proxima-hub-modal-spec-item">
                    <div className="proxima-hub-modal-spec-label">Exterior (sqft)</div>
                    <div className="proxima-hub-modal-spec-value">{floorPlan.exteriorSize}</div>
                  </div>
                )}
                {floorPlan.bedRooms && (
                  <div className="proxima-hub-modal-spec-item">
                    <div className="proxima-hub-modal-spec-label">Bedroom</div>
                    <div className="proxima-hub-modal-spec-value">
                      {formatBedrooms(floorPlan.bedRooms)}
                    </div>
                  </div>
                )}
                {floorPlan.bathRooms && (
                  <div className="proxima-hub-modal-spec-item">
                    <div className="proxima-hub-modal-spec-label">Bath</div>
                    <div className="proxima-hub-modal-spec-value">
                      {formatBathrooms(floorPlan.bathRooms)}
                    </div>
                  </div>
                )}
                {floorPlan.totalSize && (
                  <div className="proxima-hub-modal-spec-item">
                    <div className="proxima-hub-modal-spec-label">Total (sqft)</div>
                    <div className="proxima-hub-modal-spec-value">{floorPlan.totalSize}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Close Button */}
        <div className="proxima-hub-modal-footer">
          <button
            onClick={onClose}
            className="proxima-hub-modal-close-btn"
            aria-label="Close"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

