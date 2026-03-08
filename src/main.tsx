// import { StrictMode } from 'react'
import "./index.css";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@core/providers/theme-provider.tsx";
import { createRoot } from "react-dom/client";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light">
      <App />
    </ThemeProvider>
  </QueryClientProvider>,
  // </StrictMode>,
);
