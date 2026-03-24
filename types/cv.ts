import { CVInfo } from "@/lib/data";


export interface CVService {
  getCVInfo(): CVInfo | null;
  getCVVersions(): CVInfo[];
  updateCV(cv: CVInfo): Promise<void>;
  deleteCV(): void;
}

