import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const links = [
  { to: "/", label: "Home" },
  { to: "/projects", label: "Projects" },
  { to: "/certificates", label: "Certificates" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${
        scrolled ? "bg-background/80 backdrop-blur-lg border-b border-border" : "bg-transparent"
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-6 flex items-center justify-between h-14">
        <Link to="/" className="text-base font-semibold tracking-tight" aria-label="Home">
          {/* Simple text logo — no gradients */}
          MI<span className="text-primary">.</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-[13px] font-medium px-3 py-1.5 rounded-md transition-colors ${
                pathname === l.to
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-current={pathname === l.to ? "page" : undefined}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/resume"
            className="ml-3 text-[13px] font-medium px-4 py-1.5 rounded-md bg-foreground text-background hover:opacity-90 transition-opacity"
          >
            Resume
          </Link>
        </div>

        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="md:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="container mx-auto px-6 py-3 flex flex-col gap-0.5">
              {[...links, { to: "/resume", label: "Resume" }].map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`text-sm py-2.5 px-3 rounded-md transition-colors ${
                    pathname === l.to ? "text-foreground font-medium" : "text-muted-foreground"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
