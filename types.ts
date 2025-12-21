
export interface FontProject {
  id: string;
  name: string;
  originalFileName: string;
  subsetText: string;
  createdAt: number;
  fontData: string; // Base64 or Blob URL
  subsetData?: string; // Base64 of the subset font
  aiAnalysis?: string;
  previewCss?: string;
}

export interface AppState {
  projects: FontProject[];
  currentProject: FontProject | null;
  isProcessing: boolean;
  error: string | null;
}

declare global {
  interface Window {
    opentype: any;
  }
}
