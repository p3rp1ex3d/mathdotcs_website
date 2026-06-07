import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useLocation } from 'react-router-dom'
import "katex/dist/katex.min.css";

import './index.css'
import App from './App.jsx'
import { pageview } from './lib/analytics'

function AnalyticsListener() {
  const loc = useLocation();
  useEffect(() => {
    pageview(loc.pathname + loc.search);
  }, [loc]);
  return null;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AnalyticsListener />
      <App />
    </BrowserRouter>
  </StrictMode>,
)