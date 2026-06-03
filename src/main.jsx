import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { HelmetProvider } from "react-helmet-async";
import { Provider } from "react-redux";
import store from "./redux/store.js";
import { ThemeProvider } from "./context/ThemeContext.jsx";

// When a new version is deployed, an already-open tab may try to lazy-load chunk
// hashes that no longer exist on the server (Vercel then serves index.html for
// them, causing a "Failed to fetch dynamically imported module" error). Reload
// once to pick up the fresh build. The sessionStorage guard prevents a loop.
window.addEventListener("vite:preloadError", () => {
  if (!sessionStorage.getItem("chatkroo:reloaded-for-chunk")) {
    sessionStorage.setItem("chatkroo:reloaded-for-chunk", "1");
    window.location.reload();
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <HelmetProvider>
          <div onContextMenu={(e) => e.preventDefault()}>
            <App />
          </div>
        </HelmetProvider>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
