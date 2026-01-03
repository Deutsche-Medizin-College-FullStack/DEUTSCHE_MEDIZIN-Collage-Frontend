import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.js";
import "./assets/fonts/fonts.css";
import "./index.css";
import "./lib/i18n";
import { ModalProvider } from "./hooks/Modal.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ModalProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ModalProvider>
  </React.StrictMode>
);
