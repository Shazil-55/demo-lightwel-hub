import { FC } from 'react';
import { ProjectConfig } from '../types.ts';

interface HeaderProps {
  config: ProjectConfig;
  // showMap: boolean;
  // setShowMap: (showMap: boolean) => void;
  activeTab: string;
  // setActiveTab: (tab: string) => void;
}

const Header: FC<HeaderProps> = ({ config, activeTab }) => {
  // const handleTabClick = (tab: string) => {
  //   setActiveTab(tab);
  //   setShowMap(tab === 'map');
  // }

  return (
    <>
      <header
        className={`${
          config.is_wide_logo ? "proxima-hub-header-wide" : "proxima-hub-header"
        } ${activeTab !="projects" ? "proxima-hub-header-map" : ""}` }
        style={{ backgroundColor: config.header_color }}
      >
        <img src={`project_assets/${config.slug}/logo.svg`} alt="logo" />
      </header>
      {/* {config.slug === "lightwell" && (
        <section
          className={`proxima-hub-projects proxima-hub-tabs-row ${
            showMap ? "proxima-hub-projects-map" : ""
          }`}
        >
          <div className="proxima-hub-project-tab"></div>
          <div className="proxima-hub-project-tab"></div>
          <div className="proxima-hub-project-tab">
            <section className="proxima-hub-tab-container">
              <div className="proxima-hub-tabs">
                <button
                  className={`proxima-hub-tab ${
                    activeTab === "projects" ? "active" : ""
                  }`}
                  onClick={() => handleTabClick("projects")}
                >
                  Projects
                </button>
                <button
                  className={`proxima-hub-tab ${
                    activeTab === "map" ? "active" : ""
                  }`}
                  onClick={() => handleTabClick("map")}
                >
                  Map
                </button>
                <button
                  className={`proxima-hub-tab ${
                    activeTab === "floor-plans" ? "active" : ""
                  }`}
                  onClick={() => handleTabClick("floor-plans")}
                >
                  Floor Plans
                </button>
              </div>
            </section>
          </div>
        </section>
      )} */}
    </>
  );
};

export default Header;