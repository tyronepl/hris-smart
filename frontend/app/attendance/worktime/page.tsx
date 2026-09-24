"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Search,
  Users,
} from "lucide-react";

import DashboardLayout from "../../../components/DashboardLayout";
import { API_URL } from "../../../lib/api";

type Employee = {
  id: number;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  name?: string;
};

type AttendanceStatus =
  | "PRESENT"
  | "LATE"
  | "ABSENT";

type Attendance = {
  id: number;
  employeeId: number;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  hoursWorked: number | null;
  status: AttendanceStatus;
  notes: string | null;
};

export default function WorkTimePage() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] =
    useState("ALL");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const getToken = () =>
    localStorage.getItem("accessToken");

  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find(
      (item) => item.id === employeeId,
    );

    if (!employee) {
      return `Employee #${employeeId}`;
    }

    if (employee.name) {
      return employee.name;
    }

    return [
      employee.firstName,
      employee.middleName,
      employee.lastName,
    ]
      .filter(Boolean)
      .join(" ");
  };

  const fetchData = async () => {
    try {
      const token = getToken();

      const [attendanceResponse, employeesResponse] =
        await Promise.all([
          fetch(`${API_URL}/attendance`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_URL}/employees`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

      if (!attendanceResponse.ok) {
        throw new Error(
          "Failed to fetch attendance records.",
        );
      }

      if (!employeesResponse.ok) {
        throw new Error(
          "Failed to fetch employees.",
        );
      }

      const attendanceData =
        await attendanceResponse.json();

      const employeesData =
        await employeesResponse.json();

      setAttendance(attendanceData);
      setEmployees(employeesData);
    } catch (error) {
      console.error(error);

      alert("Failed to load work time data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredAttendance = useMemo(() => {
    const searchValue =
      search.toLowerCase().trim();

    return attendance
      .filter((record) => {
        const matchesEmployee =
          selectedEmployee === "ALL" ||
          record.employeeId ===
            Number(selectedEmployee);

        const matchesMonth =
          record.date.startsWith(
            selectedMonth,
          );

        const employeeName =
          getEmployeeName(
            record.employeeId,
          ).toLowerCase();

        const matchesSearch =
          !searchValue ||
          employeeName.includes(searchValue) ||
          record.date.includes(searchValue);

        return (
          matchesEmployee &&
          matchesMonth &&
          matchesSearch
        );
      })
      .sort((a, b) =>
        b.date.localeCompare(a.date),
      );
  }, [
    attendance,
    employees,
    selectedEmployee,
    selectedMonth,
    search,
  ]);

  const totalHours = useMemo(() => {
    return filteredAttendance.reduce(
      (total, record) =>
        total +
        (record.hoursWorked !== null
          ? Number(record.hoursWorked)
          : 0),
      0,
    );
  }, [filteredAttendance]);

  const averageHours =
    filteredAttendance.length > 0
      ? totalHours /
        filteredAttendance.length
      : 0;

  const presentCount =
    filteredAttendance.filter(
      (record) =>
        record.status === "PRESENT",
    ).length;

  const lateCount =
    filteredAttendance.filter(
      (record) =>
        record.status === "LATE",
    ).length;

  const absentCount =
    filteredAttendance.filter(
      (record) =>
        record.status === "ABSENT",
    ).length;

  const formatTime = (
    value: string | null,
  ) => {
    if (!value) {
      return "—";
    }

    return value.slice(0, 5);
  };

  const getStatusClass = (
    status: AttendanceStatus,
  ) => {
    if (status === "PRESENT") {
      return "bg-green-100 text-green-800";
    }

    if (status === "LATE") {
      return "bg-yellow-100 text-yellow-800";
    }

    return "bg-red-100 text-red-800";
  };

  return (
    <DashboardLayout>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-black">
            Work Time
          </h1>

          <p className="mt-1 text-sm text-black">
            View employee working hours and
            attendance summaries.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-black">
                Employee
              </label>

              <select
                value={selectedEmployee}
                onChange={(event) =>
                  setSelectedEmployee(
                    event.target.value,
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">
                  All Employees
                </option>

                {employees.map(
                  (employee) => (
                    <option
                      key={employee.id}
                      value={employee.id}
                    >
                      {getEmployeeName(
                        employee.id,
                      )}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-black">
                Month
              </label>

              <input
                type="month"
                value={selectedMonth}
                onChange={(event) =>
                  setSelectedMonth(
                    event.target.value,
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-black">
                Search
              </label>

              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Search employee or date..."
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm text-black outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="rounded-lg bg-blue-100 p-2">
                <Clock3
                  size={20}
                  className="text-blue-600"
                />
              </div>

              <span className="text-xs font-medium text-black">
                Total
              </span>
            </div>

            <p className="text-2xl font-bold text-black">
              {totalHours.toFixed(2)}
            </p>

            <p className="mt-1 text-sm text-black">
              Hours worked
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="rounded-lg bg-indigo-100 p-2">
                <CalendarDays
                  size={20}
                  className="text-indigo-600"
                />
              </div>

              <span className="text-xs font-medium text-black">
                Average
              </span>
            </div>

            <p className="text-2xl font-bold text-black">
              {averageHours.toFixed(2)}
            </p>

            <p className="mt-1 text-sm text-black">
              Hours per record
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="rounded-lg bg-green-100 p-2">
                <Users
                  size={20}
                  className="text-green-600"
                />
              </div>

              <span className="text-xs font-medium text-black">
                Present
              </span>
            </div>

            <p className="text-2xl font-bold text-black">
              {presentCount}
            </p>

            <p className="mt-1 text-sm text-black">
              Present records
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="rounded-lg bg-yellow-100 p-2">
                <Clock3
                  size={20}
                  className="text-yellow-600"
                />
              </div>

              <span className="text-xs font-medium text-black">
                Late
              </span>
            </div>

            <p className="text-2xl font-bold text-black">
              {lateCount}
            </p>

            <p className="mt-1 text-sm text-black">
              Late records
            </p>
          </div>
        </div>

        {/* Extra Summary */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-black">
              Attendance Records
            </p>

            <p className="mt-2 text-3xl font-bold text-black">
              {filteredAttendance.length}
            </p>

            <p className="mt-1 text-sm text-black">
              Records for the selected period
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-black">
              Absent
            </p>

            <p className="mt-2 text-3xl font-bold text-black">
              {absentCount}
            </p>

            <p className="mt-1 text-sm text-black">
              Absent records for the selected period
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="border-b px-6 py-4">
            <h2 className="font-semibold text-black">
              Daily Work Time
            </h2>

            <p className="mt-1 text-sm text-black">
              Detailed attendance and working hours.
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-black">
              Loading work time...
            </div>
          ) : filteredAttendance.length === 0 ? (
            <div className="p-8 text-center text-black">
              No work time records found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-black">
                      Employee
                    </th>

                    <th className="px-6 py-4 font-semibold text-black">
                      Date
                    </th>

                    <th className="px-6 py-4 font-semibold text-black">
                      Clock In
                    </th>

                    <th className="px-6 py-4 font-semibold text-black">
                      Clock Out
                    </th>

                    <th className="px-6 py-4 font-semibold text-black">
                      Hours Worked
                    </th>

                    <th className="px-6 py-4 font-semibold text-black">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAttendance.map(
                    (record) => (
                      <tr
                        key={record.id}
                        className="border-b last:border-b-0"
                      >
                        <td className="px-6 py-4 font-medium text-black">
                          {getEmployeeName(
                            record.employeeId,
                          )}
                        </td>

                        <td className="px-6 py-4 text-black">
                          {record.date}
                        </td>

                        <td className="px-6 py-4 text-black">
                          {formatTime(
                            record.clockIn,
                          )}
                        </td>

                        <td className="px-6 py-4 text-black">
                          {formatTime(
                            record.clockOut,
                          )}
                        </td>

                        <td className="px-6 py-4 font-medium text-black">
                          {record.hoursWorked !==
                          null
                            ? `${Number(
                                record.hoursWorked,
                              ).toFixed(2)} hrs`
                            : "—"}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                              record.status,
                            )}`}
                          >
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
