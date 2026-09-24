"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  List,
  X,
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

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const weekDays = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

export default function EmployeeCalendarPage() {
  const today = new Date();

  const [year, setYear] = useState(
    today.getFullYear(),
  );

  const [employees, setEmployees] = useState<Employee[]>(
    [],
  );

  const [attendance, setAttendance] = useState<Attendance[]>(
    [],
  );

  const [selectedEmployee, setSelectedEmployee] =
    useState("ALL");

  const [selectedDate, setSelectedDate] =
    useState<string | null>(null);

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

      const [
        employeesResponse,
        attendanceResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/employees`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_URL}/attendance`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (!employeesResponse.ok) {
        throw new Error(
          "Failed to fetch employees.",
        );
      }

      if (!attendanceResponse.ok) {
        throw new Error(
          "Failed to fetch attendance.",
        );
      }

      const employeesData =
        await employeesResponse.json();

      const attendanceData =
        await attendanceResponse.json();

      setEmployees(employeesData);
      setAttendance(attendanceData);
    } catch (error) {
      console.error(error);

      alert(
        "Failed to load attendance calendar.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredAttendance = useMemo(() => {
    return attendance.filter((record) => {
      if (selectedEmployee === "ALL") {
        return true;
      }

      return (
        record.employeeId ===
        Number(selectedEmployee)
      );
    });
  }, [
    attendance,
    selectedEmployee,
  ]);

  const getAttendanceForDate = (
    date: string,
  ) => {
    return filteredAttendance.filter(
      (record) => record.date === date,
    );
  };

  const getMonthDays = (
    month: number,
  ) => {
    const firstDay = new Date(
      year,
      month,
      1,
    ).getDay();

    const daysInMonth = new Date(
      year,
      month + 1,
      0,
    ).getDate();

    const days: (
      | number
      | null
    )[] = [];

    for (
      let i = 0;
      i < firstDay;
      i++
    ) {
      days.push(null);
    }

    for (
      let day = 1;
      day <= daysInMonth;
      day++
    ) {
      days.push(day);
    }

    return days;
  };

  const isToday = (
    month: number,
    day: number,
  ) => {
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  const getStatusColor = (
    status: AttendanceStatus,
  ) => {
    if (status === "PRESENT") {
      return "bg-green-100 border-green-300";
    }

    if (status === "LATE") {
      return "bg-yellow-100 border-yellow-300";
    }

    return "bg-red-100 border-red-300";
  };

  const getStatusDot = (
    status: AttendanceStatus,
  ) => {
    if (status === "PRESENT") {
      return "bg-green-500";
    }

    if (status === "LATE") {
      return "bg-yellow-500";
    }

    return "bg-red-500";
  };

  const getStatusText = (
    status: AttendanceStatus,
  ) => {
    if (status === "PRESENT") {
      return "text-green-700";
    }

    if (status === "LATE") {
      return "text-yellow-700";
    }

    return "text-red-700";
  };

  const previousYear = () => {
    setYear((current) => current - 1);
  };

  const nextYear = () => {
    setYear((current) => current + 1);
  };

  const goToCurrentYear = () => {
    setYear(today.getFullYear());
  };

  const formatTime = (
    value: string | null,
  ) => {
    if (!value) {
      return "—";
    }

    return value.slice(0, 5);
  };

  const selectedDateAttendance =
    selectedDate
      ? filteredAttendance.filter(
          (record) =>
            record.date === selectedDate,
        )
      : [];

  const selectedEmployeeName =
    selectedEmployee === "ALL"
      ? "All Employees"
      : getEmployeeName(
          Number(selectedEmployee),
        );

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <CalendarDays
                  size={22}
                  className="text-blue-600"
                />
              </div>

              <h1 className="text-2xl font-bold text-black">
                Attendance Calendar
              </h1>
            </div>

            <p className="mt-2 text-sm text-black">
              View employee attendance throughout
              the year.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={previousYear}
              className="rounded-lg border border-gray-300 p-2 text-black transition hover:bg-gray-100"
              title="Previous year"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={goToCurrentYear}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-black transition hover:bg-gray-100"
              title="Go to current year"
            >
              {year}
            </button>

            <button
              type="button"
              onClick={nextYear}
              className="rounded-lg border border-gray-300 p-2 text-black transition hover:bg-gray-100"
              title="Next year"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Employee Filter */}
        <div className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="w-full md:max-w-md">
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

            <div className="text-sm text-black">
              Showing:{" "}
              <span className="font-semibold">
                {selectedEmployeeName}
              </span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mb-6 flex flex-wrap items-center gap-5 rounded-xl border bg-white px-5 py-4 shadow-sm">
          <span className="text-sm font-semibold text-black">
            Attendance Status:
          </span>

          <div className="flex items-center gap-2 text-sm text-black">
            <span className="h-3 w-3 rounded-full bg-green-500" />
            Present
          </div>

          <div className="flex items-center gap-2 text-sm text-black">
            <span className="h-3 w-3 rounded-full bg-yellow-500" />
            Late
          </div>

          <div className="flex items-center gap-2 text-sm text-black">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            Absent
          </div>

          <div className="flex items-center gap-2 text-sm text-black">
            <span className="h-3 w-3 rounded-full bg-blue-600" />
            Today
          </div>
        </div>

        {/* Calendar Heading */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-black">
            Calendar {year}
          </h2>

          <span className="text-sm text-black">
            {filteredAttendance.length} attendance records
          </span>
        </div>

        {loading ? (
          <div className="rounded-xl border bg-white p-10 text-center text-black shadow-sm">
            Loading attendance calendar...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {monthNames.map(
              (monthName, monthIndex) => {
                const days =
                  getMonthDays(
                    monthIndex,
                  );

                return (
                  <div
                    key={monthName}
                    className="overflow-hidden rounded-xl border bg-white shadow-sm"
                  >
                    {/* Month Header */}
                    <div className="border-b bg-gray-50 px-4 py-3">
                      <h3 className="text-center font-bold text-black">
                        {monthName}
                      </h3>
                    </div>

                    {/* Weekdays */}
                    <div className="grid grid-cols-7 border-b">
                      {weekDays.map(
                        (day) => (
                          <div
                            key={day}
                            className="px-1 py-2 text-center text-xs font-semibold text-black"
                          >
                            {day}
                          </div>
                        ),
                      )}
                    </div>

                    {/* Days */}
                    <div className="grid grid-cols-7">
                      {days.map(
                        (
                          day,
                          dayIndex,
                        ) => {
                          if (
                            day ===
                            null
                          ) {
                            return (
                              <div
                                key={`empty-${dayIndex}`}
                                className="min-h-[82px] border-b border-r bg-gray-50"
                              />
                            );
                          }

                          const dateString = `${year}-${String(
                            monthIndex +
                              1,
                          ).padStart(
                            2,
                            "0",
                          )}-${String(
                            day,
                          ).padStart(
                            2,
                            "0",
                          )}`;

                          const records =
                            getAttendanceForDate(
                              dateString,
                            );

                          const hasRecords =
                            records.length >
                            0;

                          /*
                           * ALL EMPLOYEES
                           *
                           * Only show a compact record count
                           * and list icon. This keeps the
                           * calendar cell small even when
                           * there are many employees.
                           */
                          if (
                            selectedEmployee ===
                            "ALL"
                          ) {
                            return (
                              <button
                                key={
                                  dateString
                                }
                                type="button"
                                disabled={
                                  !hasRecords
                                }
                                onClick={() => {
                                  if (
                                    hasRecords
                                  ) {
                                    setSelectedDate(
                                      dateString,
                                    );
                                  }
                                }}
                                className={`min-h-[82px] border-b border-r p-1.5 text-left transition ${
                                  hasRecords
                                    ? "cursor-pointer hover:bg-gray-100"
                                    : "cursor-default"
                                } ${
                                  isToday(
                                    monthIndex,
                                    day,
                                  )
                                    ? "bg-blue-50"
                                    : "bg-white"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span
                                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                                      isToday(
                                        monthIndex,
                                        day,
                                      )
                                        ? "bg-blue-600 text-white"
                                        : "text-black"
                                    }`}
                                  >
                                    {
                                      day
                                    }
                                  </span>

                                  {hasRecords && (
                                    <List
                                      size={14}
                                      className="text-blue-600"
                                    />
                                  )}
                                </div>

                                {hasRecords ? (
                                  <div className="mt-3 rounded-md border border-blue-200 bg-blue-50 px-2 py-2 text-center">
                                    <p className="text-sm font-bold text-blue-700">
                                      {
                                        records.length
                                      }
                                    </p>

                                    <p className="text-[9px] font-medium text-black">
                                      {records.length ===
                                      1
                                        ? "record"
                                        : "records"}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="mt-4 text-center text-[10px] text-black">
                                    —
                                  </p>
                                )}
                              </button>
                            );
                          }

                          /*
                           * SPECIFIC EMPLOYEE
                           *
                           * Show the detailed attendance
                           * information directly in the cell.
                           */
                          const record =
                            records[0];

                          return (
                            <button
                              key={
                                dateString
                              }
                              type="button"
                              disabled={
                                !record
                              }
                              onClick={() => {
                                if (
                                  record
                                ) {
                                  setSelectedDate(
                                    dateString,
                                  );
                                }
                              }}
                              className={`min-h-[82px] border-b border-r p-1.5 text-left transition ${
                                record
                                  ? "cursor-pointer hover:bg-gray-100"
                                  : "cursor-default"
                              } ${
                                isToday(
                                  monthIndex,
                                  day,
                                )
                                  ? "bg-blue-50"
                                  : "bg-white"
                              }`}
                            >
                              <div className="mb-1 flex items-center justify-between">
                                <span
                                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                                    isToday(
                                      monthIndex,
                                      day,
                                    )
                                      ? "bg-blue-600 text-white"
                                      : "text-black"
                                  }`}
                                >
                                  {
                                    day
                                  }
                                </span>

                                {record && (
                                  <span
                                    className={`h-2.5 w-2.5 rounded-full ${getStatusDot(
                                      record.status,
                                    )}`}
                                  />
                                )}
                              </div>

                              {record ? (
                                <div
                                  className={`rounded-md border px-1.5 py-1 ${getStatusColor(
                                    record.status,
                                  )}`}
                                >
                                  <p
                                    className={`text-[10px] font-bold ${getStatusText(
                                      record.status,
                                    )}`}
                                  >
                                    {
                                      record.status
                                    }
                                  </p>

                                  <p className="mt-0.5 truncate text-[10px] text-black">
                                    {formatTime(
                                      record.clockIn,
                                    )}
                                  </p>

                                  {record.hoursWorked !==
                                    null && (
                                    <p className="truncate text-[10px] font-medium text-black">
                                      {Number(
                                        record.hoursWorked,
                                      ).toFixed(
                                        1,
                                      )}{" "}
                                      hrs
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <p className="mt-4 text-center text-[10px] text-black">
                                  —
                                </p>
                              )}
                            </button>
                          );
                        },
                      )}
                    </div>
                  </div>
                );
              },
            )}
          </div>
        )}

        {/* Attendance Details Modal */}
        {selectedDate && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-4xl rounded-xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b px-6 py-4">
                <div>
                  <h2 className="text-lg font-bold text-black">
                    Attendance Details
                  </h2>

                  <p className="mt-1 text-sm text-black">
                    {selectedDate}
                  </p>

                  <p className="mt-1 text-xs text-black">
                    {selectedDateAttendance.length}{" "}
                    {selectedDateAttendance.length ===
                    1
                      ? "attendance record"
                      : "attendance records"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedDate(
                      null,
                    )
                  }
                  className="rounded-lg p-2 text-black hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto p-6">
                {selectedDateAttendance.length ===
                0 ? (
                  <div className="py-8 text-center text-black">
                    No attendance records found.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDateAttendance.map(
                      (record) => (
                        <div
                          key={record.id}
                          className="rounded-xl border bg-white p-4"
                        >
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="font-bold text-black">
                                {getEmployeeName(
                                  record.employeeId,
                                )}
                              </p>

                              <p className="mt-1 text-sm text-black">
                                Attendance Record #
                                {record.id}
                              </p>
                            </div>

                            <span
                              className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ${getStatusColor(
                                record.status,
                              )} ${getStatusText(
                                record.status,
                              )}`}
                            >
                              {record.status}
                            </span>
                          </div>

                          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="rounded-lg border bg-gray-50 p-3">
                              <p className="text-xs font-medium text-black">
                                Clock In
                              </p>

                              <p className="mt-1 font-semibold text-black">
                                {formatTime(
                                  record.clockIn,
                                )}
                              </p>
                            </div>

                            <div className="rounded-lg border bg-gray-50 p-3">
                              <p className="text-xs font-medium text-black">
                                Clock Out
                              </p>

                              <p className="mt-1 font-semibold text-black">
                                {formatTime(
                                  record.clockOut,
                                )}
                              </p>
                            </div>

                            <div className="rounded-lg border bg-gray-50 p-3">
                              <p className="text-xs font-medium text-black">
                                Hours Worked
                              </p>

                              <p className="mt-1 font-semibold text-black">
                                {record.hoursWorked !==
                                null
                                  ? Number(
                                      record.hoursWorked,
                                    ).toFixed(
                                      2,
                                    )
                                  : "—"}
                              </p>
                            </div>
                          </div>

                          {record.notes && (
                            <div className="mt-3 rounded-lg border p-3">
                              <p className="text-xs font-medium text-black">
                                Notes
                              </p>

                              <p className="mt-1 text-sm text-black">
                                {
                                  record.notes
                                }
                              </p>
                            </div>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end border-t px-6 py-4">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedDate(
                      null,
                    )
                  }
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
