import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Preview from "./preiew.tsx";
import Home from "./home.tsx"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { Navbar } from "@/components/navbar"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
      <Navbar /> 
          <Routes>
          <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<App />} />
            <Route path="/preview/:id" element={<Preview />} />
          </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
)
