import type { Entity } from "./entity";

/** Color usage entry in a design report. */
export interface ReportColor {
  hex: string;
  count: number;
  roles: string[];
}

export interface ReportFont {
  family: string;
  count: number;
  weights?: number[];
}

export interface ReportFontSize {
  px: number;
  count: number;
}

export interface ReportRadius {
  value: string;
  count: number;
}

export interface ReportShadow {
  value: string;
  count: number;
}

export interface ReportSpacing {
  px: number;
  count: number;
}

export interface ReportComponent {
  kind: "button" | "input" | "form" | "card" | "nav";
  count: number;
  sample?: {
    background?: string;
    color?: string;
    borderRadius?: string;
    padding?: string;
    fontSize?: string;
    fontWeight?: string;
    boxShadow?: string;
    border?: string;
  };
}

export interface ReportLayout {
  containerWidth?: number;
  contentWidth?: number;
  sectionCount: number;
  gridCount: number;
  flexCount: number;
  viewportWidth: number;
  viewportHeight: number;
}

export interface ReportAsset {
  kind: "image" | "svg" | "logo" | "icon";
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface ReportStatistics {
  scannedElements: number;
  uniqueColors: number;
  uniqueFonts: number;
  componentCount: number;
  imageCount: number;
  svgCount: number;
}

export interface DesignReport extends Entity {
  projectId?: string;
  url: string;
  title: string;
  favicon?: string;
  saved?: boolean;

  colors: ReportColor[];
  fonts: ReportFont[];
  fontSizes: ReportFontSize[];
  radii: ReportRadius[];
  shadows: ReportShadow[];
  spacings: ReportSpacing[];
  components: ReportComponent[];
  layout: ReportLayout;
  assets: ReportAsset[];
  statistics: ReportStatistics;
}
