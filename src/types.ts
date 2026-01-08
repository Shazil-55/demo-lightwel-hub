export interface ProjectConfig {
  slug: string;
  header_color: string;
  body_color: string;
  font_color: string;
  logo_color: string;
  divider_color: string | null;
  show_divider: boolean;
  project_title: string;
  body_title: string | null;
  font_family: string;
  is_wide_logo?: boolean;
  show_map: boolean;
  lat?: number;
  lng?: number;
  projects: {
    name: string;
    disabled: boolean;
    featured: boolean;
    img_src: string;
    overlay_img_src: string | null;
    url: string | null;
    text_color: string;
    no_image?: boolean;
    background_color?: string;
    lat: number;
    lng: number;
    projectId?: string;
  }[];
}