import {
  FaGithub,
  FaYoutube,
  FaLinkedin,
  FaInstagram,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FiRss, FiMail } from "react-icons/fi";

const socials = [
  { href: "https://www.youtube.com/@_math.cs_", icon: FaYoutube, label: "YouTube" },
  { href: "https://x.com/MathDotCS", icon: FaXTwitter, label: "Twitter" },
  { href: "https://www.instagram.com/_math.cs_/", icon: FaInstagram, label: "Instagram" },
  { href: "https://www.linkedin.com/company/mathdotcs/", icon: FaLinkedin, label: "LinkedIn" },
  { href: "mailto:thecysecchannel@gmail.com", icon: FiMail, label: "Email" }
  
];

export const Footer = () => {
  return (
    <footer
      data-testid="site-footer"
      className="relative mt-16 px-6 pb-8 pt-6"
    >
      <div className="squiggle mb-6" />
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
        <div>
          <p className="text-sm sm:text-base lg:text-lg" style={{ fontFamily: "Caveat, cursive" }}>
            Made with thoughts, pencils, and the occasional eraser.
          </p>
          <p className="text-xs sm:text-sm text-[hsl(var(--ink-soft))] mt-1">
            © {new Date().getFullYear()} MathDotCS — all squiggles reserved.
          </p>
        </div>
        <ul className="flex items-center gap-2 sm:gap-3" data-testid="social-links">
          {socials.map(({ href, icon: Icon, label }) => (
            <li key={label}>
              <a
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`social-${label.toLowerCase()}`}
                className="sketch-btn !p-2 sm:!p-2.5"
                title={label}
              >
                <Icon size={20} strokeWidth={2.5} className="wobble" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
};
