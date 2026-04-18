import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { LayoutDashboard, Users, UserSquare, CheckSquare, DollarSign, MessageSquare, Briefcase, LogOut } from "lucide-react";
import { useLogout } from "@workspace/api-client-react";

export function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();
  const logout = useLogout();
  const [, setLocation] = useLocation();

  if (!user) return null;

  const adminLinks = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/employees", icon: Users, label: "Employees" },
    { href: "/admin/clients", icon: UserSquare, label: "Clients" },
    { href: "/admin/tasks", icon: CheckSquare, label: "Tasks" },
    { href: "/admin/earnings", icon: DollarSign, label: "Earnings" },
    { href: "/admin/plans", icon: Briefcase, label: "Plans" },
    { href: "/admin/chat", icon: MessageSquare, label: "Chat" },
  ];

  const salesmanLinks = [
    { href: "/salesman", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/salesman/add-client", icon: UserSquare, label: "Add Client" },
    { href: "/salesman/earnings", icon: DollarSign, label: "Earnings" },
    { href: "/salesman/chat", icon: MessageSquare, label: "Chat" },
  ];

  const workerLinks = [
    { href: "/worker", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/worker/tasks", icon: CheckSquare, label: "Tasks" },
    { href: "/worker/earnings", icon: DollarSign, label: "Earnings" },
    { href: "/worker/chat", icon: MessageSquare, label: "Chat" },
  ];

  const links = user.role === "admin" ? adminLinks : user.role === "salesman" ? salesmanLinks : workerLinks;

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        setLocation("/");
      }
    });
  };

  return (
    <div className="w-64 border-r border-border bg-card h-screen flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-primary tracking-tight">PRIME LINK OS</h1>
        <p className="text-xs text-muted-foreground mt-1 capitalize">{user.role} Portal</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const active = location === link.href || (location.startsWith(link.href) && link.href !== "/admin" && link.href !== "/salesman" && link.href !== "/worker");
          return (
            <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${active ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}>
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border">
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors text-sm font-medium">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
