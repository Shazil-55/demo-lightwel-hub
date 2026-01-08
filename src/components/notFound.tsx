import { FC } from 'react';

interface NotFoundProps {
  slug: string;
}

const NotFound: FC<NotFoundProps> = ({ slug }) => {
  return (
    <section className="proxima-hub-notFound">
      <p><b>Error:</b> The project hub for "{slug}" was not found.</p>
    </section>
  );
};

export default NotFound;