import type { AppContextApi, ProjectApi } from "../shared/types";

declare global {
  interface Window {
    context: AppContextApi;
    projectAPI?: ProjectApi;
  }
}

export {};
