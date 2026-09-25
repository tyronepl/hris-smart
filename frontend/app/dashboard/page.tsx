"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  Clock,
  DollarSign,
  FileText,
  UserCheck,
  UserPlus,
  Users,
  WalletCards,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  BriefcaseBusiness,
  RefreshCw,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import DashboardLayout from "@/components/DashboardLayout";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000";

type Employee = {
  id: number;
  firstName?: string;
  lastName?: string;
  name?: string;
  fullName?: string;
  department?: string;
  position?: string;
};

type Attendance = {
  id: number;
  employeeId: number;
  date: string;
  status: string;
  timeIn?: string | null;
  timeOut?: string | null;
};

type Leave = {
  id: number;
  employeeId: number;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: string;
};

type Overtime = {
  id: number;
  employeeId: number;
  date?: string;
  hours?: number;
  status?: string;
};

type Payroll = {
  id: number;
  employeeId: number;
  periodStart: string;
  periodEnd: string;
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  status: string;
};

type DashboardData = {
  employees: Employee[];
  attendance: Attendance[];
  leaves: Leave[];
  overtime: Overtime[];
  payroll: Payroll[];
};

const getToken = () =>
  typeof window !== "undefined"
    ? localStorage.getItem("accessToken")
    : null;

const getArray = (data: any) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};

const formatMoney = (value: number) => {
  return `PHP ${Number(value || 0).toLocaleString(
    "en-PH",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )}`;
};

const formatDate = (value: string) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getEmployeeName = (
  employee: Employee | undefined,
) => {
  if (!employee) {
    return "Unknown Employee";
  }

  if (employee.name) {
    return employee.name;
  }

  if (employee.fullName) {
    return employee.fullName;
  }

  return (
    `${employee.firstName || ""} ${
      employee.lastName || ""
    }`.trim() ||
    `Employee #${employee.id}`
  );
};

const getStatusCount = (
  items: { status?: string }[],
  status: string,
) => {
  return items.filter(
    (item) =>
      item.status?.toUpperCase() ===
      status.toUpperCase(),
  ).length;
};

export default function DashboardPage() {
  const [data, setData] =
    useState<DashboardData>({
      employees: [],
      attendance: [],
      leaves: [],
      overtime: [],
      payroll: [],
    });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchEndpoint = async (
    endpoint: string,
  ) => {
    const token = getToken();

    const response = await fetch(
      `${API_URL}${endpoint}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch ${endpoint}`,
      );
    }

    return response.json();
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const results =
        await Promise.allSettled([
          fetchEndpoint("/employees"),
          fetchEndpoint("/attendance"),
          fetchEndpoint("/leaves"),
          fetchEndpoint("/overtime"),
          fetchEndpoint("/payroll"),
        ]);

      const employees =
        results[0].status === "fulfilled"
          ? getArray(results[0].value)
          : [];

      const attendance =
        results[1].status === "fulfilled"
          ? getArray(results[1].value)
          : [];

      const leaves =
        results[2].status === "fulfilled"
          ? getArray(results[2].value)
          : [];

      const overtime =
        results[3].status === "fulfilled"
          ? getArray(results[3].value)
          : [];

      const payroll =
        results[4].status === "fulfilled"
          ? getArray(results[4].value)
          : [];

      setData({
        employees,
        attendance,
        leaves,
        overtime,
        payroll,
      });

      const failedCount = results.filter(
        (result) =>
          result.status === "rejected",
      ).length;

      if (failedCount > 0) {
        setError(
          "Some dashboard data could not be loaded.",
        );
      }
    } catch (err) {
      console.error(err);

      setError(
        "Failed to load dashboard data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const today = useMemo(() => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(
      date.getMonth() + 1,
    ).padStart(2, "0");
    const day = String(
      date.getDate(),
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, []);

  const todayAttendance = useMemo(() => {
    return data.attendance.filter(
      (item) =>
        item.date?.substring(0, 10) ===
        today,
    );
  }, [data.attendance, today]);

  const presentToday = getStatusCount(
    todayAttendance,
    "PRESENT",
  );

  const lateToday = getStatusCount(
    todayAttendance,
    "LATE",
  );

  const absentToday = getStatusCount(
    todayAttendance,
    "ABSENT",
  );

  const pendingLeaves =
    data.leaves.filter(
      (leave) =>
        leave.status?.toUpperCase() ===
        "PENDING",
    );

  const pendingOvertime =
    data.overtime.filter(
      (item) =>
        item.status?.toUpperCase() ===
        "PENDING",
    );

  const payrollTotal = data.payroll.reduce(
    (total, payroll) =>
      total + Number(payroll.netPay || 0),
    0,
  );

  const approvedPayroll =
    data.payroll.filter(
      (item) =>
        item.status?.toUpperCase() ===
        "APPROVED",
    );

  /*
   * Attendance graph
   */
  const attendanceChartData = [
    { name: "Present", count: presentToday },
    { name: "Late", count: lateToday },
    { name: "Absent", count: absentToday },
  ].filter((item) => item.count > 0);

  /*
   * Leave graph
   */
  const leaveChartData = [
    { name: "Pending", value: getStatusCount(data.leaves, "PENDING") },
    { name: "Approved", value: getStatusCount(data.leaves, "APPROVED") },
    { name: "Rejected", value: getStatusCount(data.leaves, "REJECTED") },
    { name: "Cancelled", value: getStatusCount(data.leaves, "CANCELLED") },
  ].filter((item) => item.value > 0);

  /*
   * Payroll graph
   *
   * Uses the most recent payroll records.
   * This avoids treating historical payroll
   * records as one current payroll total.
   */
  const payrollChartData = useMemo(() => {
    return [...data.payroll]
      .sort(
        (a, b) =>
          new Date(a.periodEnd).getTime() -
          new Date(b.periodEnd).getTime(),
      )
      .slice(-8)
      .map((payroll) => ({
        period: formatDate(payroll.periodEnd),
        gross: Number(payroll.grossPay || 0),
        deductions: Number(payroll.totalDeductions || 0),
        net: Number(payroll.netPay || 0),
      }))
      .filter(
        (item) =>
          item.gross > 0 ||
          item.deductions > 0 ||
          item.net > 0,
      );
  }, [data.payroll]);

  const recentLeaves = [...data.leaves]
    .sort(
      (a, b) =>
        new Date(
          b.startDate,
        ).getTime() -
        new Date(
          a.startDate,
        ).getTime(),
    )
    .slice(0, 5);

  const recentPayroll = [...data.payroll]
    .sort(
      (a, b) =>
        new Date(
          b.periodEnd,
        ).getTime() -
        new Date(
          a.periodEnd,
        ).getTime(),
    )
    .slice(0, 5);

  const getLeaveStatusClass = (
    status: string,
  ) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
        return "bg-green-100 text-green-800";

      case "REJECTED":
        return "bg-red-100 text-red-800";

      case "CANCELLED":
        return "bg-gray-200 text-gray-800";

      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getPayrollStatusClass = (
    status: string,
  ) => {
    switch (status?.toUpperCase()) {
      case "PAID":
        return "bg-green-100 text-green-800";

      case "APPROVED":
        return "bg-blue-100 text-blue-800";

      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">
              HRIS Dashboard
            </h1>

            <p className="mt-1 text-sm text-black">
              Overview of employees, attendance,
              leave, overtime, and payroll.
            </p>
          </div>

          <button
            onClick={loadDashboard}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-black shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh Data
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
            <AlertCircle size={18} />

            <span>{error}</span>
          </div>
        )}

        {/* Main Statistics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Employees */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">
                  Total Employees
                </p>

                <p className="mt-2 text-3xl font-bold text-black">
                  {loading
                    ? "..."
                    : data.employees.length}
                </p>

                <p className="mt-1 text-xs text-black">
                  Active employee records
                </p>
              </div>

              <div className="rounded-lg bg-blue-100 p-3 text-blue-700">
                <Users size={24} />
              </div>
            </div>
          </div>

          {/* Present */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">
                  Present Today
                </p>

                <p className="mt-2 text-3xl font-bold text-black">
                  {loading
                    ? "..."
                    : presentToday}
                </p>

                <p className="mt-1 text-xs text-black">
                  {lateToday} late attendance
                </p>
              </div>

              <div className="rounded-lg bg-green-100 p-3 text-green-700">
                <UserCheck size={24} />
              </div>
            </div>
          </div>

          {/* Leave */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">
                  Pending Leaves
                </p>

                <p className="mt-2 text-3xl font-bold text-black">
                  {loading
                    ? "..."
                    : pendingLeaves.length}
                </p>

                <p className="mt-1 text-xs text-black">
                  Requests awaiting review
                </p>
              </div>

              <div className="rounded-lg bg-yellow-100 p-3 text-yellow-700">
                <CalendarDays size={24} />
              </div>
            </div>
          </div>

          {/* Overtime */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">
                  Pending Overtime
                </p>

                <p className="mt-2 text-3xl font-bold text-black">
                  {loading
                    ? "..."
                    : pendingOvertime.length}
                </p>

                <p className="mt-1 text-xs text-black">
                  Requests awaiting review
                </p>
              </div>

              <div className="rounded-lg bg-orange-100 p-3 text-orange-700">
                <Clock size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Graphs */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Attendance Graph */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-black">
                Attendance Overview
              </h2>

              <p className="mt-1 text-sm text-black">
                Today's attendance status.
              </p>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={
                    attendanceChartData
                  }
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="name"
                    tick={{
                      fill: "#000000",
                      fontSize: 12,
                    }}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{
                      fill: "#000000",
                      fontSize: 12,
                    }}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="count"
                    name="Employees"
                    radius={[
                      6,
                      6,
                      0,
                      0,
                    ]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Leave Graph */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-black">
                Leave Requests
              </h2>

              <p className="mt-1 text-sm text-black">
                Leave requests by current status.
              </p>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={leaveChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    outerRadius={95}
                    label={({ name, value }) =>
                      `${name}: ${value}`
                    }
                  >
                    {leaveChartData.map(
                      (_, index) => (
                        <Cell
                          key={`leave-cell-${index}`}
                        />
                      ),
                    )}
                  </Pie>

                  <Tooltip />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Payroll Graph */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-black">
                Payroll Overview
              </h2>

              <p className="mt-1 text-sm text-black">
                Gross pay, deductions, and net pay
                from recent payroll records.
              </p>
            </div>

            <WalletCards
              size={24}
              className="text-blue-600"
            />
          </div>

          <div className="h-[320px] w-full">
            {payrollChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-black">
                No payroll data available.
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart
                  data={payrollChartData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 10,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="period"
                    tick={{
                      fill: "#000000",
                      fontSize: 11,
                    }}
                  />

                  <YAxis
                    tick={{
                      fill: "#000000",
                      fontSize: 11,
                    }}
                    tickFormatter={(value) =>
                      `₱${Number(
                        value,
                      ).toLocaleString(
                        "en-PH",
                        {
                          notation:
                            "compact",
                        },
                      )}`
                    }
                  />

                  <Tooltip
                    formatter={(
                      value,
                      name,
                    ) => [
                      formatMoney(
                        Number(value),
                      ),
                      String(name),
                    ]}
                  />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="gross"
                    name="Gross Pay"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="deductions"
                    name="Deductions"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="net"
                    name="Net Pay"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Secondary Statistics */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-3 text-green-700">
                <CheckCircle2 size={22} />
              </div>

              <div>
                <p className="text-sm text-black">
                  Present Today
                </p>

                <p className="text-xl font-bold text-black">
                  {presentToday}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-100 p-3 text-yellow-700">
                <Clock size={22} />
              </div>

              <div>
                <p className="text-sm text-black">
                  Late Today
                </p>

                <p className="text-xl font-bold text-black">
                  {lateToday}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-100 p-3 text-red-700">
                <AlertCircle size={22} />
              </div>

              <div>
                <p className="text-sm text-black">
                  Absent Today
                </p>

                <p className="text-xl font-bold text-black">
                  {absentToday}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payroll Summary */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-black">
                Payroll Summary
              </h2>

              <p className="mt-1 text-sm text-black">
                Current payroll records available
                in the system.
              </p>
            </div>

            <WalletCards
              size={24}
              className="text-blue-600"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-black">
                Payroll Records
              </p>

              <p className="mt-1 text-2xl font-bold text-black">
                {data.payroll.length}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-black">
                Approved Payroll
              </p>

              <p className="mt-1 text-2xl font-bold text-black">
                {approvedPayroll.length}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-black">
                Total Net Pay
              </p>

              <p className="mt-1 text-2xl font-bold text-black">
                {formatMoney(payrollTotal)}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-black">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-black">
              Quickly access common HR tasks.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <a
              href="/employees"
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 text-black hover:bg-gray-50"
            >
              <UserPlus
                size={20}
                className="text-blue-600"
              />

              <span className="font-medium">
                Add Employee
              </span>

              <ArrowRight
                size={16}
                className="ml-auto"
              />
            </a>

            <a
              href="/leaves"
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 text-black hover:bg-gray-50"
            >
              <CalendarDays
                size={20}
                className="text-blue-600"
              />

              <span className="font-medium">
                Manage Leaves
              </span>

              <ArrowRight
                size={16}
                className="ml-auto"
              />
            </a>

            <a
              href="/attendance"
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 text-black hover:bg-gray-50"
            >
              <UserCheck
                size={20}
                className="text-blue-600"
              />

              <span className="font-medium">
                Attendance
              </span>

              <ArrowRight
                size={16}
                className="ml-auto"
              />
            </a>

            <a
              href="/payroll"
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 text-black hover:bg-gray-50"
            >
              <WalletCards
                size={20}
                className="text-blue-600"
              />

              <span className="font-medium">
                Manage Payroll
              </span>

              <ArrowRight
                size={16}
                className="ml-auto"
              />
            </a>
          </div>
        </div>

        {/* Recent Data */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Leave */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 p-5">
              <div>
                <h2 className="text-lg font-bold text-black">
                  Recent Leave Requests
                </h2>

                <p className="mt-1 text-sm text-black">
                  Latest leave activity.
                </p>
              </div>

              <FileText
                size={22}
                className="text-blue-600"
              />
            </div>

            {recentLeaves.length === 0 ? (
              <div className="p-6 text-center text-sm text-black">
                No leave requests found.
              </div>
            ) : (
              <div className="divide-y">
                {recentLeaves.map(
                  (leave) => (
                    <div
                      key={leave.id}
                      className="p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-semibold text-black">
                            {getEmployeeName(
                              data.employees.find(
                                (employee) =>
                                  employee.id ===
                                  leave.employeeId,
                              ),
                            )}
                          </p>

                          <p className="mt-1 text-sm text-black">
                            {leave.type} ·{" "}
                            {leave.days} day
                            {leave.days !== 1
                              ? "s"
                              : ""}
                          </p>

                          <p className="mt-1 text-xs text-black">
                            {formatDate(
                              leave.startDate,
                            )}{" "}
                            -{" "}
                            {formatDate(
                              leave.endDate,
                            )}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${getLeaveStatusClass(
                            leave.status,
                          )}`}
                        >
                          {leave.status}
                        </span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}

            <div className="border-t border-gray-200 p-4">
              <a
                href="/leaves"
                className="flex items-center justify-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800"
              >
                View all leave requests
                <ArrowRight size={16} />
              </a>
            </div>
          </div>

          {/* Recent Payroll */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 p-5">
              <div>
                <h2 className="text-lg font-bold text-black">
                  Recent Payroll
                </h2>

                <p className="mt-1 text-sm text-black">
                  Latest payroll records.
                </p>
              </div>

              <DollarSign
                size={22}
                className="text-blue-600"
              />
            </div>

            {recentPayroll.length === 0 ? (
              <div className="p-6 text-center text-sm text-black">
                No payroll records found.
              </div>
            ) : (
              <div className="divide-y">
                {recentPayroll.map(
                  (payroll) => (
                    <div
                      key={payroll.id}
                      className="p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-semibold text-black">
                            {getEmployeeName(
                              data.employees.find(
                                (employee) =>
                                  employee.id ===
                                  payroll.employeeId,
                              ),
                            )}
                          </p>

                          <p className="mt-1 text-sm text-black">
                            {formatDate(
                              payroll.periodStart,
                            )}{" "}
                            -{" "}
                            {formatDate(
                              payroll.periodEnd,
                            )}
                          </p>

                          <p className="mt-1 text-sm font-semibold text-black">
                            Net Pay:{" "}
                            {formatMoney(
                              Number(
                                payroll.netPay,
                              ),
                            )}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${getPayrollStatusClass(
                            payroll.status,
                          )}`}
                        >
                          {payroll.status}
                        </span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}

            <div className="border-t border-gray-200 p-4">
              <a
                href="/payroll"
                className="flex items-center justify-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800"
              >
                View payroll
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* HR Overview */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-3 text-blue-700">
              <BriefcaseBusiness size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-black">
                HR Overview
              </h2>

              <p className="text-sm text-black">
                Current activity across HRIS Smart.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-black">
                Employees
              </p>

              <p className="mt-1 text-xl font-bold text-black">
                {data.employees.length}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-black">
                Leave Requests
              </p>

              <p className="mt-1 text-xl font-bold text-black">
                {data.leaves.length}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-black">
                Overtime Requests
              </p>

              <p className="mt-1 text-xl font-bold text-black">
                {data.overtime.length}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-black">
                Payroll Records
              </p>

              <p className="mt-1 text-xl font-bold text-black">
                {data.payroll.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
