import { FC, useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { ProjectConfig } from '../types.ts';

import 'mapbox-gl/dist/mapbox-gl.css';

interface InteractiveMapProps {
  config: ProjectConfig;
}

const InteractiveMap: FC<InteractiveMapProps> = ({ config }) => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const defaultPinRef = useRef<mapboxgl.Marker | null>(null);
  const [selectedProjectIndex, setSelectedProjectIndex] = useState<number | null>(null);

  const selectedProject = selectedProjectIndex !== null ? config.projects[selectedProjectIndex] : null;

  const handlePrevious = () => {
    if (selectedProjectIndex !== null && selectedProjectIndex > 0) {
      setSelectedProjectIndex(selectedProjectIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedProjectIndex !== null && selectedProjectIndex < config.projects.length - 1) {
      setSelectedProjectIndex(selectedProjectIndex + 1);
    }
  };

  const closeSidebar = () => {
    setSelectedProjectIndex(null);
  };

  // Mapbox access token
  const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoibG5nc3R1ZGlvcyIsImEiOiJja3I2anhhaHAyaThoMnBzNjFqbGQ3MmxhIn0.Spy65NSiUTz-vo1GJqg9hA';

  // Initialize the map
  useEffect(() => {
    if (containerRef.current && config.projects.length > 0) {
      mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

      // Center on presentation center (lightwell coordinates) or calculate from projects
      const centerLat = config.lat || config.projects.reduce((sum, project) => sum + project.lat, 0) / config.projects.length;
      const centerLng = config.lng || config.projects.reduce((sum, project) => sum + project.lng, 0) / config.projects.length;

      mapRef.current = new mapboxgl.Map({
        container: containerRef.current,
        center: [centerLng, centerLat],
        style: 'mapbox://styles/lngstudios/ckvmk18ws2kj214qshc3nxy6u',
        zoom: 16,
        pitch: 45,
        dragRotate: false,
        attributionControl: false,
      });

      // Add navigation control
      const compassControl = new mapboxgl.NavigationControl({
        showCompass: true,
        showZoom: true,
      });
      mapRef.current.addControl(compassControl, 'top-right');

      return () => {
        defaultPinRef.current?.remove();
        mapRef.current?.remove();
      };
    }
  }, [config]);

  // Add markers for each project
  useEffect(() => {
    if (!mapRef.current || config.projects.length === 0) return;

    const map = mapRef.current;

    // Wait for map to load before adding markers
    const addMarkers = () => {
      // Remove existing markers
      Object.values(markersRef.current).forEach(marker => marker.remove());
      markersRef.current = {};

      if (defaultPinRef.current) {
        defaultPinRef.current.remove();
        defaultPinRef.current = null;
      }

      config.projects.forEach((project, index) => {
        if (project.lat && project.lng) {
          // Wrapper controlled by Mapbox for positioning
          const el = document.createElement('div');
          el.className = 'marker';
          el.style.position = 'relative';
          el.style.width = '0px';
          el.style.height = '0px';
          el.style.pointerEvents = 'auto';

          // Pin marker element (teardrop shape)
          const pin = document.createElement('div');
          pin.className = 'marker-pin';
          pin.style.width = '52px';
          pin.style.height = '64px';
          pin.style.position = 'relative';
          pin.style.transform = 'translate(-50%, -100%)';
          pin.style.cursor = 'pointer';
          pin.style.filter = 'drop-shadow(0 4px 6px rgba(0,0,0,0.35))';
          pin.style.transition = 'transform 0.2s ease';

          // Pin head (circle part)
          const pinHead = document.createElement('div');
          pinHead.className = 'marker-pin-head';
          pinHead.style.width = '52px';
          pinHead.style.height = '52px';
          pinHead.style.backgroundColor = config.header_color;
          pinHead.style.borderRadius = '50%';
          pinHead.style.display = 'flex';
          pinHead.style.alignItems = 'center';
          pinHead.style.justifyContent = 'center';
          pinHead.style.position = 'relative';
          pinHead.style.zIndex = '2';

          // Name inside pin
          const pinText = document.createElement('span');
          pinText.className = 'marker-pin-text';
          pinText.style.color = config.font_color;
          pinText.style.fontSize = '10px';
          pinText.style.fontWeight = 'bold';
          pinText.style.textAlign = 'center';
          pinText.style.lineHeight = '1.1';
          pinText.style.padding = '4px';
          pinText.style.wordBreak = 'break-word';
          pinText.textContent = project.name;

          // Pin tail (triangle pointing down)
          const pinTail = document.createElement('div');
          pinTail.className = 'marker-pin-tail';
          pinTail.style.width = '0';
          pinTail.style.height = '0';
          pinTail.style.borderLeft = '12px solid transparent';
          pinTail.style.borderRight = '12px solid transparent';
          pinTail.style.borderTop = `18px solid ${config.header_color}`;
          pinTail.style.position = 'absolute';
          pinTail.style.bottom = '0';
          pinTail.style.left = '50%';
          pinTail.style.transform = 'translateX(-50%)';
          pinTail.style.zIndex = '1';

          pinHead.appendChild(pinText);
          pin.appendChild(pinHead);
          pin.appendChild(pinTail);
          el.appendChild(pin);

          const marker = new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
          })
            .setLngLat([project.lng, project.lat])
            .setPopup(
              new mapboxgl.Popup({
                offset: 25,
                closeButton: true,
                className: "marker-popup",
              }).setHTML(`
                <div style="padding: 10px; min-width: 200px;">
                  <h4 style="margin: 0 0 8px 0; color: ${config.header_color}; font-family: ${config.font_family};">${project.name}</h4>
                  <p style="margin: 0; color: #666;">Click to visit project</p>
                  ${project.img_src ? `<img src="${project.img_src}" alt="${project.name}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 4px; margin-top: 8px;" />` : ''}
                </div>
              `)
            )
            .addTo(mapRef.current as mapboxgl.Map);

          // Add click handler - open sidebar instead of URL
          pin.addEventListener('click', (e) => {
            e.stopPropagation();
            if(config.slug === 'lightwell') {
              setSelectedProjectIndex(index);
            } else {
              window.open(project.url || '', '_blank');
            }
          });

          // Add hover effects
          pin.addEventListener('mouseenter', () => {
            pin.style.transform = 'translate(-50%, -100%) scale(1.1)';
            el.style.zIndex = '1000';
          });
          
          pin.addEventListener('mouseleave', () => {
            pin.style.transform = 'translate(-50%, -100%) scale(1)';
            el.style.zIndex = '1';
          });

          markersRef.current[project.name] = marker;
        }
      });

      // Add default "You are here" pin at presentation center
      // Use config lat/lng (lightwell coordinates) for presentation center
      if (config.lat && config.lng) {
        const defaultLat = config.lat;
        const defaultLng = config.lng;

        // Create wrapper for default pin
        const defaultEl = document.createElement('div');
        defaultEl.className = 'default-pin-wrapper';
        defaultEl.style.position = 'relative';
        defaultEl.style.width = '0px';
        defaultEl.style.height = '0px';
        defaultEl.style.pointerEvents = 'none';

        // Main pin container
        const defaultPinContainer = document.createElement('div');
        defaultPinContainer.style.position = 'relative';
        defaultPinContainer.style.display = 'flex';
        defaultPinContainer.style.flexDirection = 'column';
        defaultPinContainer.style.alignItems = 'center';
        defaultPinContainer.style.transform = 'translate(-50%, -100%)';

        // SVG pin image
        const pinImage = document.createElement('img');
        pinImage.src = '/project_assets/lightwell/loc.svg';
        pinImage.alt = 'You are here';
        pinImage.style.width = '64px';
        pinImage.style.height = '64px';
        pinImage.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))';
        pinImage.style.pointerEvents = 'none';

        defaultPinContainer.appendChild(pinImage);

        // "You are here" text
        const youAreHereText = document.createElement('div');
        youAreHereText.textContent = 'You are here';
        youAreHereText.style.color = '#333';
        youAreHereText.style.fontSize = '12px';
        youAreHereText.style.fontWeight = '500';
        youAreHereText.style.fontFamily = 'sans-serif';
        youAreHereText.style.marginTop = '4px';
        youAreHereText.style.whiteSpace = 'nowrap';
        youAreHereText.style.textShadow = '0 1px 2px rgba(255,255,255,0.8)';

        defaultPinContainer.appendChild(youAreHereText);
        defaultEl.appendChild(defaultPinContainer);

        // Create and add the marker
        defaultPinRef.current = new mapboxgl.Marker({
          element: defaultEl,
          anchor: 'bottom'
        })
          .setLngLat([defaultLng, defaultLat])
          .addTo(map);
      }
    };

    // Add markers when map loads
    if (map.loaded()) {
      addMarkers();
    } else {
      map.on('load', addMarkers);
    }

    return () => {
      Object.values(markersRef.current).forEach(marker => marker.remove());
      markersRef.current = {};
      defaultPinRef.current?.remove();
      defaultPinRef.current = null;
    };
  }, [config]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          borderRadius: '8px',
          overflow: 'hidden'
        }} 
      />
      
      {/* Sidebar Panel */}
      <div className={`map-sidebar ${selectedProject ? 'open' : ''}`}>
        {selectedProject && (
          <>
            <button className="map-sidebar-close" onClick={closeSidebar}>
              ×
            </button>
            
            <div className="map-sidebar-content">
              {/* Project Image */}
              <div className="map-sidebar-image">
                {selectedProject.img_src ? (
                  <img src={selectedProject.img_src} alt={selectedProject.name} />
                ) : (
                  <div 
                    className="map-sidebar-image-placeholder"
                    style={{ backgroundColor: selectedProject.background_color || config.header_color }}
                  />
                )}
                {selectedProject.overlay_img_src && (
                  <div className="map-sidebar-logo-overlay">
                    <img src={selectedProject.overlay_img_src} alt={`${selectedProject.name} logo`} />
                  </div>
                )}
              </div>

              {/* Project Info */}
              <div className="map-sidebar-info">
                <span className="map-sidebar-index">({String(selectedProjectIndex! + 1).padStart(2, '0')})</span>
                <h2 className="map-sidebar-name" style={{ fontFamily: config.font_family }}>{selectedProject.name}</h2>
                <p className="map-sidebar-address">1666 W 8th Avenue</p>
                
                <p className="map-sidebar-description">
                  Inspired by the rhythm of natural living, {selectedProject.name} is a boutique collection of three-bedroom homes where clean architectural lines meet natural warmth. Designed for flow, comfort, and connection, {selectedProject.name} welcomes you home.
                </p>

                {selectedProject.url && (
                  <a 
                    href={selectedProject.url} 
                    // target="_blank" 
                    rel="noopener noreferrer"
                    className="map-sidebar-button"
                  >
                    View Residences
                  </a>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="map-sidebar-nav">
              <button 
                className="map-sidebar-nav-btn"
                onClick={handlePrevious}
                disabled={selectedProjectIndex === 0}
              >
                ‹
              </button>
              <button 
                className="map-sidebar-nav-btn"
                onClick={handleNext}
                disabled={selectedProjectIndex === config.projects.length - 1}
              >
                ›
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InteractiveMap;
