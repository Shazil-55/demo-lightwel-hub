import { FC } from 'react';
import { ProjectConfig } from '../types.ts';
import { motion } from 'framer-motion';

interface ProjectsProps {
  config: ProjectConfig;
}

const Projects: FC<ProjectsProps> = ({ config }) => {
  const goToProxima = (url: string | null) => {
    if (!url) return;
    window.location.assign(url);
  };

  const isVertical = window.innerWidth < 1199;

  const projectVariants = (isOdd: boolean) => ({
    hidden: isVertical ? { x: isOdd ? '-100vw' : '100vw', opacity: 0 } : { y: isOdd ? '-100vh' : '100vh', opacity: 0 },
    visible: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: 'easeOut' } // EaseOut removes snapping
    },
  });

  return (
    <section className="proxima-hub-projects">
      {config.projects.map((item, index) => {
        const isOdd = index % 2 === 0;

        return (
          <motion.div
            className="proxima-hub-project"
            key={`${item.name}-${index}`}
            initial="hidden"
            animate="visible"
            variants={projectVariants(isOdd)}
            viewport={{ once: true }}
            onClick={() => goToProxima(item.url)}
            style={{ cursor: item.disabled ? 'not-allowed' : 'pointer' }}
          >
            {
              item.no_image ? (
                <div className="project-placeholder" style={{ backgroundColor: item.background_color }}>
                  <p
                  style={{
                    color: item.text_color,
                  }}
                  >{item.name}</p>
                </div>
              ) : (
                <>
                  <img src={item.img_src} style={{ filter: item.disabled ? 'grayscale(100%)' : '' }} alt="project" />
                  <div className="overlay" style={{ color: item.text_color, opacity: item.disabled ? 0.5 : 1 }}>
                    {item.overlay_img_src ? (
                      <img src={item.overlay_img_src} alt={item.overlay_img_src} />
                    ) : (
                      <p>{item.name}</p>
                    )}
                  </div>
                </>
              )
            }

          </motion.div>
        );
      })}
    </section>
  );
};

export default Projects;