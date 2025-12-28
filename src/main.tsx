import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./assets/fonts/fonts.css";
import "./index.css";
import "./lib/i18n";
import { ModalProvider } from "./hooks/Modal.tsx";
import { Toaster } from "sonner"; // ← add this import
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ModalProvider>
      <BrowserRouter>
        <App />
        {/* <Toaster position="top-right" richColors closeButton /> */}
      </BrowserRouter>
    </ModalProvider>
  </React.StrictMode>
);
