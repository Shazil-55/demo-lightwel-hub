import WebFont from 'webfontloader';

const useFonts = (font: string = 'Montserrat'): void => {
  WebFont.load({
    google: {
      families: [font],
    },
    custom: {
      families: ['/fonts.css'],
    },
  });
};

export default useFonts;
