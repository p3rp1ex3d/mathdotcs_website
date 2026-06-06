import { Link, NavLink } from "react-router-dom";
import { Moon, Sun, BookOpen } from "lucide-react";
import { useTheme } from "../lib/theme";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/blogs", label: "Blogs" },
  { to: "/videos", label: "Videos" },
  // { to: "/explore", label: "Explore" },
  { to: "/about", label: "About" },
];

export const Header = () => {
  const { theme, toggle } = useTheme();
  return (
    <div>
        <header
      data-testid="site-header"
      className="relative z-30 w-full px-5 sm:px-10 py-4 flex items-center justify-between"
    >
      <Link
        to="/"
        data-testid="brand-link"
        className="flex items-center gap-1 sm:gap-2 group"
      >
        <span className="sketch-circle text-base sm:text-lg font-bold" style={{ borderColor: "currentColor", color: "hsl(var(--ink))" }}>
          <BookOpen size={20} strokeWidth={2.5} />
        </span>
        <span className="font-bold text-lg sm:text-2xl tracking-tight" style={{ fontFamily: "Patrick Hand, cursive" }}>
          Math<span className="text-[hsl(var(--accent))]">.</span>CS
        </span>
      </Link>

      <nav className="hidden md:flex items-center gap-0.5 lg:gap-1" data-testid="nav-links">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            data-testid={`nav-${item.label.toLowerCase()}`}
            className={({ isActive }) =>
              `px-3 lg:px-4 py-2 text-sm lg:text-lg rounded-full transition-all duration-300 hover:rotate-[-2deg] hover:scale-105 active:scale-95 ${
                isActive
                  ? "underline decoration-[hsl(var(--accent))] decoration-wavy underline-offset-4"
                  : "hover:bg-[hsl(var(--ink))/0.05]"
              }`
            }
            style={{ fontFamily: "Patrick Hand, cursive" }}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={toggle}
        data-testid="theme-toggle"
        aria-label="Toggle theme"
        className="sketch-btn !p-2 sm:!p-3"
        title={theme === "dark" ? "Switch to paper" : "Switch to chalkboard"}
      >
        {theme === "dark" ? <Sun size={20} strokeWidth={2.5} className="wobble" /> : <Moon size={20} strokeWidth={2.5} className="wobble" />}
      </button>
    </header>
    </div>
  );
};

export const MobileNav = () => {
  return (
    <nav className="md:hidden flex flex-wrap items-center justify-center gap-2 px-3 sm:px-4 pb-3" data-testid="mobile-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          data-testid={`mobile-nav-${item.label.toLowerCase()}`}
          className={({ isActive }) =>
            `chip text-sm sm:text-base transition-all duration-200 active:scale-95 ${isActive ? "!bg-[hsl(var(--accent))/0.4]" : "hover:scale-105"}`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
};