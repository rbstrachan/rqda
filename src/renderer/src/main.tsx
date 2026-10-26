import "./assets/index.css";
import "./i18n";

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AppI18nProvider } from "./i18n/provider";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppI18nProvider>
      <App />
    </AppI18nProvider>
  </React.StrictMode>,
);
