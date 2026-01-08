import { FC } from 'react';
import { ProjectConfig } from '../types.ts';

interface DividerProps {
  config: ProjectConfig;
}

const Divider: FC<DividerProps> = ({ config }) => {
  if (!config.show_divider) return null;

  return (
    <section className="proxima-hub-divider">
      <img src={`project_assets/${config.slug}/divider.svg`} alt="divider" />
    </section>
  );
};

export default Divider;