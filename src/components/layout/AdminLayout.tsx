import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, FolderOpen, Briefcase, Wrench, MessageSquare, Settings, LogOut, Star, Award } from "lucide-react";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/projects", icon: FolderOpen, label: "Projects" },
  { to: "/admin/experience", icon: Briefcase, label: "Experience" },
  { to: "/admin/skills", icon: Wrench, label: "Skills" },
  { to: "/admin/certificates", icon: Award, label: "Certificates" },
  { to: "/admin/testimonials", icon: Star, label: "Testimonials" },
  { to: "/admin/messages", icon: MessageSquare, label: "Messages" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function AdminLayout() {
  const { signOut } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 border-r border-border bg-card flex flex-col">
        <div className="p-6">
          <Link to="/" className="text-xl font-bold text-gradient">MI Admin</Link>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                pathname === item.to ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors w-full">
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
