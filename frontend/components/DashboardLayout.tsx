"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  UsersRound,
  CalendarDays,
  ClipboardList,
  ClipboardX,
  Clock3,
  LogOut,
  Settings,
  UserCheck,
  Clock,
  CalendarRange,
  ChevronDown,
  WalletCards,
  ScrollText,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [userName, setUserName] = useState(
    "HR Administrator",
  );

  const [attendanceOpen, setAttendanceOpen] =
    useState(
      pathname.startsWith("/attendance"),
    );

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

  useEffect(() => {
    if (pathname.startsWith("/attendance")) {
      setAttendanceOpen(true);
    }
  }, [pathname]);

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    router.push("/login");
  }

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

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">

          {/* Dashboard */}
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
              pathname === "/dashboard"
                ? "bg-white text-blue-700"
                : "text-blue-100 hover:bg-blue-600 hover:text-white"
            }`}
          >
            <LayoutDashboard size={20} />

            <span>
              Dashboard
            </span>
          </Link>

          {/* Employees */}
          <Link
            href="/employees"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
              pathname === "/employees" ||
              pathname.startsWith("/employees/")
                ? "bg-white text-blue-700"
                : "text-blue-100 hover:bg-blue-600 hover:text-white"
            }`}
          >
            <UsersRound size={20} />

            <span>
              Employees
            </span>
          </Link>

          {/* Payroll */}
          <Link
            href="/payroll"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
              pathname === "/payroll" ||
              pathname.startsWith("/payroll/")
                ? "bg-white text-blue-700"
                : "text-blue-100 hover:bg-blue-600 hover:text-white"
            }`}
          >
            <WalletCards size={20} />

            <span>
              Payroll
            </span>
          </Link>

          {/* Attendance */}
          <div>
            <button
              type="button"
              onClick={() =>
                setAttendanceOpen(
                  (current) => !current,
                )
              }
              className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition ${
                pathname.startsWith(
                  "/attendance",
                )
                  ? "bg-white text-blue-700"
                  : "text-blue-100 hover:bg-blue-600 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <UserCheck size={20} />

                <span>
                  Attendance
                </span>
              </div>

              <ChevronDown
                size={18}
                className={`transition-transform ${
                  attendanceOpen
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>

            {attendanceOpen && (
              <div className="mt-1 space-y-1 pl-4">

                {/* Attendance List */}
                <Link
                  href="/attendance"
                  className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition ${
                    pathname ===
                    "/attendance"
                      ? "bg-white text-blue-700"
                      : "text-blue-100 hover:bg-blue-600 hover:text-white"
                  }`}
                >
                  <UserCheck size={17} />

                  <span>
                    Attendance List
                  </span>
                </Link>

                {/* Work Time */}
                <Link
                  href="/attendance/worktime"
                  className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition ${
                    pathname.startsWith(
                      "/attendance/worktime",
                    )
                      ? "bg-white text-blue-700"
                      : "text-blue-100 hover:bg-blue-600 hover:text-white"
                  }`}
                >
                  <Clock size={17} />

                  <span>
                    Work Time
                  </span>
                </Link>

                {/* Employee Calendar */}
                <Link
                  href="/attendance/calendar"
                  className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition ${
                    pathname.startsWith(
                      "/attendance/calendar",
                    )
                      ? "bg-white text-blue-700"
                      : "text-blue-100 hover:bg-blue-600 hover:text-white"
                  }`}
                >
                  <CalendarRange
                    size={17}
                  />

                  <span>
                    Employee Calendar
                  </span>
                </Link>

              </div>
            )}
          </div>

          {/* Overtime */}
          <Link
            href="/overtime"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
              pathname === "/overtime" ||
              pathname.startsWith("/overtime/")
                ? "bg-white text-blue-700"
                : "text-blue-100 hover:bg-blue-600 hover:text-white"
            }`}
          >
            <Clock3 size={20} />

            <span>
              Overtime Management
            </span>
          </Link>

          {/* Leave */}
          <Link
            href="/leaves"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
              pathname === "/leaves" ||
              pathname.startsWith("/leaves/")
                ? "bg-white text-blue-700"
                : "text-blue-100 hover:bg-blue-600 hover:text-white"
            }`}
          >
            <ClipboardList size={20} />

            <span>
              Leave Management
            </span>
          </Link>

          {/* Absence */}
          <Link
            href="/absences"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
              pathname === "/absences" ||
              pathname.startsWith("/absences/")
                ? "bg-white text-blue-700"
                : "text-blue-100 hover:bg-blue-600 hover:text-white"
            }`}
          >
            <ClipboardX size={20} />

            <span>
              Absence Management
            </span>
          </Link>

          {/* Calendar */}
          <Link
            href="/calendar"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
              pathname === "/calendar" ||
              pathname.startsWith("/calendar/")
                ? "bg-white text-blue-700"
                : "text-blue-100 hover:bg-blue-600 hover:text-white"
            }`}
          >
            <CalendarDays size={20} />

            <span>
              Calendar
            </span>
          </Link>

          {/* Audit Logs */}
          <Link
            href="/audit-logs"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
              pathname === "/audit-logs" ||
              pathname.startsWith("/audit-logs/")
                ? "bg-white text-blue-700"
                : "text-blue-100 hover:bg-blue-600 hover:text-white"
            }`}
          >
            <ScrollText size={20} />

            <span>
              Audit Logs
            </span>
          </Link>

          {/* Account Settings */}
          <Link
            href="/settings"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
              pathname === "/settings" ||
              pathname.startsWith("/settings/")
                ? "bg-white text-blue-700"
                : "text-blue-100 hover:bg-blue-600 hover:text-white"
            }`}
          >
            <Settings size={20} />

            <span>
              Account Settings
            </span>
          </Link>

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