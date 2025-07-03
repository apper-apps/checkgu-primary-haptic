import './index.css'
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "@/App";

// Ensure root element has proper dimensions before rendering
const rootElement = document.getElementById('root');
if (rootElement) {
  // Add loaded class to prevent FOUC and ensure dimensions
  rootElement.classList.add('loaded');
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);