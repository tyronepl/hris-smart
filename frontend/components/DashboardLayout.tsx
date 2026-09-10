"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  UsersRound,
  UserPlus,
  LogOut,
  Settings,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [userName, setUserName] = useState("HR Administrator");

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (!user) {
      return;
    }

    try {
      const parsedUser = JSON.parse(user);

      if (parsedUser.name) {
        setUserName(parsedUser.name);
      }
    } catch {
      localStorage.removeItem("user");
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    router.push("/login");
  }

  const menuItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Employees",
      href: "/employees",
      icon: UsersRound,
    },
    // {
    //   label: "Add Employee",
    //   href: "/employees?create=true",
    //   icon: UserPlus,
    // },
    {
      label: "Account Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between bg-blue-600 px-6 text-white shadow-md">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-blue-600">
            <UsersRound size={22} />
          </div>

          <div>
            <h1 className="font-bold leading-none">
              HRIS Smart
            </h1>

            <p className="mt-1 text-xs text-blue-100">
              Human Resources Information System
            </p>
          </div>
        </div>

        {/* HR User */}
        <div className="flex items-center gap-3">

          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium">
              {userName}
            </p>

            <p className="text-xs text-blue-100">
              Human Resources
            </p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-blue-600">
            HR
          </div>

        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed bottom-0 left-0 top-16 z-40 flex w-64 flex-col bg-blue-700 text-white">

        <nav className="flex-1 space-y-1 px-3 py-6">

          {menuItems.map((item) => {
            const Icon = item.icon;

            const basePath = item.href.split("?")[0];

            const active =
              pathname === basePath ||
              (basePath !== "/dashboard" &&
                pathname.startsWith(`${basePath}/`));

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-white text-blue-700"
                    : "text-blue-100 hover:bg-blue-600 hover:text-white"
                }`}
              >
                <Icon size={20} />

                <span>
                  {item.label}
                </span>
              </Link>
            );
          })}

        </nav>

        {/* Logout */}
        <div className="border-t border-blue-600 p-3">

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-blue-100 transition hover:bg-blue-600 hover:text-white"
          >
            <LogOut size={20} />

            <span>
              Logout
            </span>
          </button>

        </div>

      </aside>

      {/* Main Content */}
      <div className="ml-64 pt-16">

        <main className="p-8">
          {children}
        </main>

      </div>

    </div>
  );
}
