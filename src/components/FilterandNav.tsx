import { FC, useMemo, useRef } from 'react';
import { ProjectConfig } from '../types.ts';
import { FloorPlanFilters } from '../App.tsx';
import { useFloorPlans } from '../hooks/useFloorPlans.ts';

interface FilterandNavProps {
  config: ProjectConfig;
  showMap: boolean;
  setShowMap: (showMap: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filters: FloorPlanFilters;
  setFilters: React.Dispatch<React.SetStateAction<FloorPlanFilters>>;
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
}

const FilterandNav: FC<FilterandNavProps> = ({
  config,
  showMap,
  setShowMap,
  activeTab,
  setActiveTab,
  filters,
  setFilters,
  isFilterOpen,
  setIsFilterOpen,
}) => {
  const navRef = useRef<HTMLElement>(null);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setShowMap(tab === 'map');
  };

  // Fetch floor plans data for filter options
  const slugs = ["ansoku", "solin", "willa"];
  const { data } = useFloorPlans(slugs, {
    enabled: activeTab === 'floor-plans',
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

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

  const getProjectName = (projectId: string | null | undefined): string | null => {
    if (!projectId) return null;
    return projectNameMap.get(projectId) || null;
  };

  // Extract unique filter options from data
  const filterOptions = useMemo(() => {
    if (!data?.data) return { projects: [], bedrooms: [], bathrooms: [], sizeRange: { min: 0, max: 5000 } };

    const projects = new Set<string>();
    const bedrooms = new Set<string>();
    const bathrooms = new Set<string>();
    let minSize = Infinity;
    let maxSize = 0;

    data.data.forEach((fp) => {
      const projectName = getProjectName(fp.projectId);
      if (projectName) projects.add(projectName);
      if (fp.bedRooms) bedrooms.add(fp.bedRooms);
      if (fp.bathRooms) bathrooms.add(fp.bathRooms);

      const size = parseInt(fp.totalSize || fp.interiorSize || "0", 10);
      if (size > 0) {
        minSize = Math.min(minSize, size);
        maxSize = Math.max(maxSize, size);
      }
    });

    return {
      projects: Array.from(projects).sort(),
      bedrooms: Array.from(bedrooms).sort((a, b) => parseInt(a) - parseInt(b)),
      bathrooms: Array.from(bathrooms).sort((a, b) => parseFloat(a) - parseFloat(b)),
      sizeRange: { min: minSize === Infinity ? 0 : minSize, max: maxSize || 5000 },
    };
  }, [data?.data, projectNameMap]);

  // Filter the floor plans to get result count
  const filteredCount = useMemo(() => {
    if (!data?.data) return 0;

    return data.data.filter((fp) => {
      if (filters.projectName) {
        const projectName = getProjectName(fp.projectId);
        if (projectName !== filters.projectName) return false;
      }
      if (filters.bedrooms && fp.bedRooms !== filters.bedrooms) return false;
      if (filters.bathrooms && fp.bathRooms !== filters.bathrooms) return false;
      if (filters.sizeRange) {
        const size = parseInt(fp.totalSize || fp.interiorSize || "0", 10);
        if (size < filters.sizeRange.min || size > filters.sizeRange.max) return false;
      }
      return true;
    }).length;
  }, [data?.data, filters, projectNameMap]);

  const handleFilterChange = (key: keyof FloorPlanFilters, value: string | { min: number; max: number } | null) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      projectName: "",
      bedrooms: "",
      bathrooms: "",
      sizeRange: null,
    });
  };

  const activeFilterCount = [
    filters.projectName,
    filters.bedrooms,
    filters.bathrooms,
    filters.sizeRange,
  ].filter(Boolean).length;

  const getSizeRangeLabel = (range: { min: number; max: number } | null) => {
    if (!range) return "";
    if (range.max === 99999) return "2,000+ sqft";
    if (range.min === 0) return `Under ${range.max.toLocaleString()} sqft`;
    return `${range.min.toLocaleString()} - ${range.max.toLocaleString()} sqft`;
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

  return (
    <>
      {/* Filter Drawer Backdrop */}
      {isFilterOpen && (
        <div
          className="fp-filter-backdrop"
          onClick={() => setIsFilterOpen(false)}
        />
      )}

      {/* Filter Drawer */}
      <div className={`fp-filter-drawer ${isFilterOpen ? 'open' : ''}`}>
        <div className="fp-filter-drawer-header">
          <h2>Filters</h2>
          <button type="button" onClick={clearFilters} className="fp-filter-clear-btn">
            Clear
          </button>
        </div>

        <div className="fp-filter-drawer-content">
          {/* Project Filter */}
          <div className="fp-filter-section">
            <label className="fp-filter-label">Project</label>
            {filters.projectName && (
              <div className="fp-filter-chips">
                <div className="fp-filter-chip">
                  <span>{filters.projectName}</span>
                  <button type="button" onClick={() => handleFilterChange("projectName", "")} aria-label="Remove filter">×</button>
                </div>
              </div>
            )}
            <div className="fp-filter-select-wrapper">
              <select
                value={filters.projectName}
                onChange={(e) => handleFilterChange("projectName", e.target.value)}
                className="fp-filter-select"
              >
                <option value="">Please select</option>
                {filterOptions.projects.map((project) => (
                  <option key={project} value={project}>{project}</option>
                ))}
              </select>
              <svg className="fp-filter-select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>

          {/* Bedrooms Filter */}
          <div className="fp-filter-section">
            <label className="fp-filter-label">Bedrooms</label>
            {filters.bedrooms && (
              <div className="fp-filter-chips">
                <div className="fp-filter-chip">
                  <span>{formatBedrooms(filters.bedrooms)}</span>
                  <button type="button" onClick={() => handleFilterChange("bedrooms", "")} aria-label="Remove filter">×</button>
                </div>
              </div>
            )}
            <div className="fp-filter-select-wrapper">
              <select
                value={filters.bedrooms}
                onChange={(e) => handleFilterChange("bedrooms", e.target.value)}
                className="fp-filter-select"
              >
                <option value="">Please select</option>
                {filterOptions.bedrooms.map((bed) => (
                  <option key={bed} value={bed}>{formatBedrooms(bed)}</option>
                ))}
              </select>
              <svg className="fp-filter-select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>

          {/* Bathrooms Filter */}
          <div className="fp-filter-section">
            <label className="fp-filter-label">Bathrooms</label>
            {filters.bathrooms && (
              <div className="fp-filter-chips">
                <div className="fp-filter-chip">
                  <span>{formatBathrooms(filters.bathrooms)}</span>
                  <button type="button" onClick={() => handleFilterChange("bathrooms", "")} aria-label="Remove filter">×</button>
                </div>
              </div>
            )}
            <div className="fp-filter-select-wrapper">
              <select
                value={filters.bathrooms}
                onChange={(e) => handleFilterChange("bathrooms", e.target.value)}
                className="fp-filter-select"
              >
                <option value="">Please select</option>
                {filterOptions.bathrooms.map((bath) => (
                  <option key={bath} value={bath}>{formatBathrooms(bath)}</option>
                ))}
              </select>
              <svg className="fp-filter-select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>

          {/* Size Filter */}
          <div className="fp-filter-section">
            <label className="fp-filter-label">Size</label>
            {filters.sizeRange && (
              <div className="fp-filter-chips">
                <div className="fp-filter-chip">
                  <span>{getSizeRangeLabel(filters.sizeRange)}</span>
                  <button type="button" onClick={() => handleFilterChange("sizeRange", null)} aria-label="Remove filter">×</button>
                </div>
              </div>
            )}
            <div className="fp-filter-select-wrapper">
              <select
                value={filters.sizeRange ? `${filters.sizeRange.min}-${filters.sizeRange.max}` : ""}
                onChange={(e) => {
                  if (!e.target.value) {
                    handleFilterChange("sizeRange", null);
                  } else {
                    const [min, max] = e.target.value.split("-").map(Number);
                    handleFilterChange("sizeRange", { min, max });
                  }
                }}
                className="fp-filter-select"
              >
                <option value="">Please select</option>
                <option value="0-1000">Under 1,000 sqft</option>
                <option value="1000-1500">1,000 - 1,500 sqft</option>
                <option value="1500-2000">1,500 - 2,000 sqft</option>
                <option value="2000-99999">2,000+ sqft</option>
              </select>
              <svg className="fp-filter-select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>

          {/* Results Count */}
          <div className="fp-filter-results">
            {filteredCount} {filteredCount === 1 ? "result" : "results"}
          </div>
        </div>
      </div>

      {config.slug === "lightwell" && (
        <>
          <section
            ref={navRef}
            className={`proxima-hub-projects proxima-hub-tabs-row ${showMap ? "proxima-hub-projects-map" : ""
              }`}
          >
            <div className="proxima-hub-project-tab">
              {/* Filter Button - only visible on floor-plans tab */}

            </div>
            {/* <div className="proxima-hub-project-tab"></div> */}
            <div className="proxima-hub-project-tab" >
              {activeTab === "floor-plans" && (
                <button
                  className="fp-filter-toggle-btn"
                  onClick={() => setIsFilterOpen(true)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="4" y1="6" x2="20" y2="6"></line>
                    <line x1="4" y1="12" x2="20" y2="12"></line>
                    <line x1="4" y1="18" x2="20" y2="18"></line>
                    <circle cx="8" cy="6" r="2" fill="currentColor"></circle>
                    <circle cx="16" cy="12" r="2" fill="currentColor"></circle>
                    <circle cx="10" cy="18" r="2" fill="currentColor"></circle>
                  </svg>
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="fp-filter-badge">{activeFilterCount}</span>
                  )}
                </button>
              )}
              <section className="proxima-hub-tab-container">
                <div className="proxima-hub-tabs">
                  <button
                    className={`proxima-hub-tab ${activeTab === "projects" ? "active" : ""
                      }`}
                    onClick={() => handleTabClick("projects")}
                  >
                    Projects
                  </button>
                  <button
                    className={`proxima-hub-tab ${activeTab === "map" ? "active" : ""
                      }`}
                    onClick={() => handleTabClick("map")}
                  >
                    Map
                  </button>
                  <button
                    className={`proxima-hub-tab ${activeTab === "floor-plans" ? "active" : ""
                      }`}
                    onClick={() => handleTabClick("floor-plans")}
                  >
                    Floor Plans
                  </button>
                </div>
              </section>
            </div>
          </section>
        </>
      )}
    </>
  );
};

export default FilterandNav;
