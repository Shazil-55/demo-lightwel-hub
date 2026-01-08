import { useState } from 'react';
import { FloorPlanResponse } from '../types/api';

interface FloorPlanCardProps {
  floorPlan: FloorPlanResponse;
  projectName?: string | null;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onClick?: () => void;
}

export const FloorPlanCard = ({
  floorPlan,
  projectName,
  isFavorite = false,
  onToggleFavorite,
  onClick,
}: FloorPlanCardProps) => {
  const [imageError, setImageError] = useState(false);

  // Get primary image from floorPlanPhoto, keyPlan, or renderings
  const getRenderingsImage = () => {
    if (
      !Array.isArray(floorPlan.renderings) ||
      floorPlan.renderings.length === 0
    ) {
      return null;
    }
    const firstRendering = floorPlan.renderings[0];
    // Handle new format: rendering sections with images array
    if (
      firstRendering?.images &&
      Array.isArray(firstRendering.images) &&
      firstRendering.images.length > 0
    ) {
      return firstRendering.images[0]?.link || null;
    }
    // Handle old format: direct array of images
    return firstRendering?.link || null;
  };

  const imageUrl =
    floorPlan.floorPlanPhoto?.[0]?.link ||
    floorPlan.keyPlan?.[0]?.link ||
    getRenderingsImage() ||
    null;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Get marketing PDF or fallback to image
    const downloadUrl =
      floorPlan.marketingPdf?.[0]?.link ||
      floorPlan.floorPlanPhoto?.[0]?.link ||
      floorPlan.keyPlan?.[0]?.link ||
      null;

    if (downloadUrl) {
      // Create a temporary anchor element to trigger download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download =
        floorPlan.marketingPdf?.[0]?.name || floorPlan.name || "floor-plan";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.warn("No download file available for floor plan", floorPlan.id);
    }
  };

  const handleEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Open email client with floor plan info
    const subject = encodeURIComponent(
      `Floor Plan: ${floorPlan.name || "Floor Plan"}`
    );
    const body = encodeURIComponent(
      `I'm interested in this floor plan:\n\n${
        floorPlan.name || "Floor Plan"
      }\n${
        floorPlan.totalSize || floorPlan.interiorSize
          ? `Size: ${floorPlan.totalSize || floorPlan.interiorSize} sqft\n`
          : ""
      }${floorPlan.bedRooms ? `Bedrooms: ${floorPlan.bedRooms}\n` : ""}${
        floorPlan.bathRooms ? `Bathrooms: ${floorPlan.bathRooms}\n` : ""
      }`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.();
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on action buttons
    if (
      (e.target as HTMLElement).closest("button") ||
      (e.target as HTMLElement).closest("a")
    ) {
      return;
    }
    onClick?.();
  };

  // Format size with sqft
  const formatSize = (size: string | null | undefined): string => {
    if (!size) return "N/A";
    return size.includes("sqft") ? size : `${size} sqft`;
  };

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

  // Format bed/bath combined
  const formatBedBath = (): string => {
    const beds = formatBedrooms(floorPlan.bedRooms);
    const baths = formatBathrooms(floorPlan.bathRooms);
    return `${beds} | ${baths}`;
  };

  return (
    <div
      className="proxima-hub-floor-plan-card"
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="proxima-hub-floor-plan-image">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={floorPlan.name || "Floor plan"}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="proxima-hub-floor-plan-placeholder">
            {floorPlan.name || "Floor Plan"}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="proxima-hub-floor-plan-content">
        {floorPlan.name && (
          <div className="proxima-hub-floor-plan-name">
            {projectName ? `${projectName}, ${floorPlan.name}` : floorPlan.name}
          </div>
        )}

        {floorPlan.totalSize || floorPlan.interiorSize ? (
          <div className="proxima-hub-floor-plan-size">
            {formatSize(floorPlan.totalSize || floorPlan.interiorSize)}
          </div>
        ) : null}

        {floorPlan.bedRooms || floorPlan.bathRooms ? (
          <div className="proxima-hub-floor-plan-bed-bath">
            {formatBedBath()}
          </div>
        ) : null}

        {floorPlan.price && (
          <div className="proxima-hub-floor-plan-price">
            {floorPlan.price.startsWith("$") ||
            floorPlan.price.startsWith("from")
              ? floorPlan.price
              : `$${floorPlan.price}`}
          </div>
        )}

        {/* Action Icons */}
        <div className="proxima-hub-floor-plan-actions">
          <button
            onClick={handleToggleFavorite}
            className={`proxima-hub-floor-plan-action-btn ${
              isFavorite ? "proxima-hub-floor-plan-favorite-active" : ""
            }`}
            aria-label={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill={isFavorite ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
          <button
            onClick={handleDownload}
            className="proxima-hub-floor-plan-action-btn"
            aria-label="Download floor plan"
            title="Download"
          >
            <svg
              width="14"
              height="14"
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
            className="proxima-hub-floor-plan-action-btn"
            aria-label="Email floor plan"
            title="Email"
          >
            <svg
              width="14"
              height="14"
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
  );
};

