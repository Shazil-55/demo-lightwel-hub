import { FC } from 'react';
import { ProjectConfig } from '../types.ts';
import { motion } from 'framer-motion';
import InteractiveMap from './InteractiveMap';

interface ProjectsProps {
  config: ProjectConfig;
  showMap: boolean;
}

const MapProjects: FC<ProjectsProps> = ({ config, showMap }) => {
  return (
    <section className="proxima-hub-projects proxima-hub-projects-map">
      {showMap && (
        <motion.div
          className="proxima-hub-map-full"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            width: "100%",
            height: "70vh",
            marginBottom: "2rem",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <InteractiveMap config={config} />
        </motion.div>
      )}
    </section>
  );
};

export default MapProjects;