"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import DashboardLayout from "../../components/DashboardLayout";
import { API_URL } from "../../lib/api";

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

type AttendanceForm = {
  employeeId: string;
  date: string;
  clockIn: string;
  clockOut: string;
  hoursWorked: string;
  status: AttendanceStatus;
  notes: string;
};

const emptyForm: AttendanceForm = {
  employeeId: "",
  date: "",
  clockIn: "",
  clockOut: "",
  hoursWorked: "",
  status: "PRESENT",
  notes: "",
};

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState<AttendanceForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"ALL" | AttendanceStatus>("ALL");
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

  const fetchAttendance = async () => {
    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/attendance`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch attendance records",
        );
      }

      const data = await response.json();

      setAttendance(data);
    } catch (error) {
      console.error(error);

      alert(
        "Failed to load attendance records.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/employees`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch employees",
        );
      }

      const data = await response.json();

      setEmployees(data);
    } catch (error) {
      console.error(error);

      alert("Failed to load employees.");
    }
  };

  useEffect(() => {
    fetchAttendance();
    fetchEmployees();
  }, []);

  const filteredAttendance = useMemo(() => {
    const searchValue =
      search.toLowerCase().trim();

    return attendance.filter((record) => {
      const employeeName =
        getEmployeeName(
          record.employeeId,
        ).toLowerCase();

      const matchesSearch =
        !searchValue ||
        employeeName.includes(searchValue) ||
        record.date.includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" ||
        record.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    attendance,
    employees,
    search,
    statusFilter,
  ]);

  const openCreateModal = () => {
    setEditingId(null);

    setForm({
      ...emptyForm,
      date: new Date()
        .toISOString()
        .split("T")[0],
    });

    setShowModal(true);
  };

  const openEditModal = (
    record: Attendance,
  ) => {
    setEditingId(record.id);

    setForm({
      employeeId: String(
        record.employeeId,
      ),
      date: record.date,
      clockIn:
        record.clockIn?.slice(0, 5) || "",
      clockOut:
        record.clockOut?.slice(0, 5) || "",
      hoursWorked:
        record.hoursWorked !== null
          ? String(record.hoursWorked)
          : "",
      status: record.status,
      notes: record.notes || "",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleChange = (
    field: keyof AttendanceForm,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const saveAttendance = async () => {
    if (!form.employeeId) {
      alert("Please select an employee.");
      return;
    }

    if (!form.date) {
      alert("Please select a date.");
      return;
    }

    const scrollY = window.scrollY;

    try {
      const token = getToken();

      const payload = {
        employeeId: Number(
          form.employeeId,
        ),
        date: form.date,
        clockIn:
          form.clockIn || undefined,
        clockOut:
          form.clockOut || undefined,
        hoursWorked:
          form.hoursWorked !== ""
            ? Number(form.hoursWorked)
            : undefined,
        status: form.status,
        notes:
          form.notes.trim() || undefined,
      };

      const url = editingId
        ? `${API_URL}/attendance/${editingId}`
        : `${API_URL}/attendance`;

      const method = editingId
        ? "PATCH"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type":
            "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData =
          await response.json().catch(
            () => null,
          );

        throw new Error(
          errorData?.message ||
            "Failed to save attendance.",
        );
      }

      await fetchAttendance();

      closeModal();

      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to save attendance.",
      );
    }
  };

  const deleteAttendance = async (
    id: number,
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this attendance record?",
    );

    if (!confirmed) {
      return;
    }

    const scrollY = window.scrollY;

    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/attendance/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          "Failed to delete attendance record.",
        );
      }

      await fetchAttendance();

      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    } catch (error) {
      console.error(error);

      alert(
        "Failed to delete attendance record.",
      );
    }
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
      <div className="min-h-full">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">
              Attendance
            </h1>

            <p className="mt-1 text-sm text-black">
              Manage employee attendance records.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Attendance
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-lg border bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search employee or date..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm text-black outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | "ALL"
                    | AttendanceStatus,
                )
              }
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">
                All Statuses
              </option>

              <option value="PRESENT">
                Present
              </option>

              <option value="LATE">
                Late
              </option>

              <option value="ABSENT">
                Absent
              </option>
            </select>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-black">
              Loading attendance records...
            </div>
          ) : filteredAttendance.length === 0 ? (
            <div className="p-8 text-center text-black">
              No attendance records found.
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
                      Hours
                    </th>

                    <th className="px-6 py-4 font-semibold text-black">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right font-semibold text-black">
                      Actions
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
                          {record.clockIn
                            ? record.clockIn.slice(
                                0,
                                5,
                              )
                            : "—"}
                        </td>

                        <td className="px-6 py-4 text-black">
                          {record.clockOut
                            ? record.clockOut.slice(
                                0,
                                5,
                              )
                            : "—"}
                        </td>

                        <td className="px-6 py-4 text-black">
                          {record.hoursWorked !==
                          null
                            ? Number(
                                record.hoursWorked,
                              ).toFixed(2)
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

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(
                                  record,
                                )
                              }
                              className="rounded-lg border border-gray-300 p-2 text-black transition hover:bg-gray-100"
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteAttendance(
                                  record.id,
                                )
                              }
                              className="rounded-lg border border-red-300 p-2 text-red-600 transition hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b px-6 py-4">
                <h2 className="text-lg font-bold text-black">
                  {editingId
                    ? "Edit Attendance"
                    : "Add Attendance"}
                </h2>

                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg p-2 text-black hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-black">
                    Employee
                  </label>

                  <select
                    value={form.employeeId}
                    onChange={(event) =>
                      handleChange(
                        "employeeId",
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">
                      Select employee
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
                    Date
                  </label>

                  <input
                    type="date"
                    value={form.date}
                    onChange={(event) =>
                      handleChange(
                        "date",
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-black">
                    Clock In
                  </label>

                  <input
                    type="time"
                    value={form.clockIn}
                    onChange={(event) =>
                      handleChange(
                        "clockIn",
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-black">
                    Clock Out
                  </label>

                  <input
                    type="time"
                    value={form.clockOut}
                    onChange={(event) =>
                      handleChange(
                        "clockOut",
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-black">
                    Hours Worked
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.hoursWorked}
                    onChange={(event) =>
                      handleChange(
                        "hoursWorked",
                        event.target.value,
                      )
                    }
                    placeholder="e.g. 8"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-black">
                    Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(event) =>
                      handleChange(
                        "status",
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="PRESENT">
                      Present
                    </option>

                    <option value="LATE">
                      Late
                    </option>

                    <option value="ABSENT">
                      Absent
                    </option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-black">
                    Notes
                  </label>

                  <textarea
                    value={form.notes}
                    onChange={(event) =>
                      handleChange(
                        "notes",
                        event.target.value,
                      )
                    }
                    rows={3}
                    placeholder="Optional notes..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t px-6 py-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-black hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={saveAttendance}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  {editingId
                    ? "Update Attendance"
                    : "Save Attendance"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}