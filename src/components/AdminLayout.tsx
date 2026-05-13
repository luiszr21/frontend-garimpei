import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const { logout } = useAuthStore();

  const navItems = [
    { path: "/admin", label: "Dashboard", icon: "📊" },
    { path: "/admin/produtos", label: "Produtos", icon: "📦" },
    { path: "/admin/interacoes", label: "Interações", icon: "💬" },
  ];

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    window.location.assign("/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-5 overflow-y-auto flex flex-col shadow-lg">
        <div className="pb-5 border-b border-slate-700 mb-6">
          <h1 className="text-2xl font-black">🏪 Admin</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                isActive(item.path)
                  ? "bg-blue-500 text-white"
                  : "text-gray-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
        >
          🚪 Sair
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
