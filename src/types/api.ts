/**
 * API Types for Floor Plans
 */

export interface ImageData {
  link: string | null;
  name: string | null;
  order?: number | null;
}

export interface UnitResponse {
  id: string;
  name?: string | null;
  rooms?: RoomResponse[];
}

export interface RoomResponse {
  id: string;
  name?: string | null;
  unitId?: string | null;
}

export interface FloorPlanResponse {
  id: string;
  name?: string | null;
  units?: Array<UnitResponse | string>;
  buildingId?: string | null;
  projectId?: string | null;
  buildingName?: string | null;
  description?: string | null;
  status?: string | null;
  floorPlanType?: string | null;
  floorPlanStatus?: string | null;
  sizeUnit?: string | null;
  interiorSize?: string | null;
  exteriorSize?: string | null;
  totalSize?: string | null;
  price?: string | null;
  applyNowUrl?: string | null;
  customDisclaimer?: string | null;
  floorNumbers?: string | null;
  bedRooms?: string | null;
  bathRooms?: string | null;
  juniorBedRooms?: boolean | null;
  studio?: boolean | null;
  flex?: boolean | null;
  sparkId?: string | null;
  floorplanUnitType?: string | null;
  orientations?: string | null;
  viewStudyUrl?: string | null;
  virtualTour?: string | null;
  externalId?: string | null;
  floorPlanPhoto?: ImageData[] | null;
  keyPlan?: ImageData[] | null;
  renderings?: any[] | null;
  marketingPdf?: ImageData[] | null;
  expandedCardSettings?: any | null;
  previewCardSettings?: any | null;
  extraFeatures?: any | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  // Allow additional fields (passthrough)
  [key: string]: any;
}

export interface GetAllFloorPlansRequest {
  projectSlugs: string[];
}

export interface GetAllFloorPlansResponse {
  data: FloorPlanResponse[];
}

