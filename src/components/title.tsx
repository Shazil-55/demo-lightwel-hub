import { FC } from 'react';
import { ProjectConfig } from '../types.ts';

interface TitleProps {
  config: ProjectConfig;
}

const Title: FC<TitleProps> = ({ config }) => {
  if (!config.body_title) return null;

  return (
    <section className="proxima-hub-title">
      {config.body_title}
    </section>
  );
};

export default Title;