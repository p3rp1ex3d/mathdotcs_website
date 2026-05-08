import "./App.css";
import { Routes, Route, useLocation } from "react-router-dom";

import { ThemeProvider } from "./lib/theme";
import { Header, MobileNav } from "./components/Header";
import { Footer } from "./components/Footer";
import { Doodles } from "./components/Doodles";

import Landing from "./pages/Landing";
import Blogs from "./pages/Blogs";
import BlogDetail from "./pages/BlogDetails";
import Videos from "./pages/Videos";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const Shell = () => {
  const location = useLocation();

  return (
    <div
      className="App relative min-h-screen flex flex-col paper-bg"
      data-testid="app-shell"
    >
      <Doodles />
      <Header />
      <MobileNav />

      <div key={location.pathname} className="flex-1 flex flex-col">
        <Routes location={location}>
          <Route path="/" element={<Landing />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/:slug" element={<BlogDetail />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Shell />
    </ThemeProvider>
  );
}

export default App;