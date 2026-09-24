"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import DashboardLayout from "../../components/DashboardLayout";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000";

type AbsenceStatus =
  | "UNEXCUSED"
  | "EXCUSED";

type Absence = {
  id: number;
  employeeId: number;
  date: string;
  status: AbsenceStatus;
  reason: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

type Employee = {
  id: number;
  name?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  firstname?: string;
  lastname?: string;
};

type AbsenceForm = {
  employeeId: string;
  date: string;
  status: AbsenceStatus;
  reason: string;
  notes: string;
};

const initialForm: AbsenceForm = {
  employeeId: "",
  date: "",
  status: "UNEXCUSED",
  reason: "",
  notes: "",
};

const getToken = () =>
  typeof window !== "undefined"
    ? localStorage.getItem("accessToken")
    : null;

export default function AbsencesPage() {
  const [absences, setAbsences] =
    useState<Absence[]>([]);

  const [employees, setEmployees] =
    useState<Employee[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<AbsenceForm>(
      initialForm,
    );

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<"ALL" | AbsenceStatus>(
      "ALL",
    );

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

      const data =
        await response.json();

      setEmployees(
        Array.isArray(data)
          ? data
          : data.data || [],
      );
    } catch (error) {
      console.error(error);

      alert(
        "Failed to load employees.",
      );
    }
  };

  const fetchAbsences = async () => {
    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/absences`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch absences",
        );
      }

      const data =
        await response.json();

      setAbsences(
        Array.isArray(data)
          ? data
          : data.data || [],
      );
    } catch (error) {
      console.error(error);

      alert(
        "Failed to load absence records.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbsences();
    fetchEmployees();
  }, []);

  const getEmployeeName = (
    employee: Employee,
  ) => {
    if (employee.name) {
      return employee.name;
    }

    if (employee.fullName) {
      return employee.fullName;
    }

    const firstName =
      employee.firstName ||
      employee.firstname ||
      "";

    const lastName =
      employee.lastName ||
      employee.lastname ||
      "";

    const fullName =
      `${firstName} ${lastName}`.trim();

    if (fullName) {
      return fullName;
    }

    return `Employee #${employee.id}`;
  };

  const getEmployeeDisplayName = (
    employeeId: number,
  ) => {
    const employee =
      employees.find(
        (item) =>
          item.id === employeeId,
      );

    if (!employee) {
      return `Employee #${employeeId}`;
    }

    return getEmployeeName(employee);
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEditModal = (
    absence: Absence,
  ) => {
    setEditingId(absence.id);

    setForm({
      employeeId: String(
        absence.employeeId,
      ),
      date: absence.date,
      status: absence.status,
      reason: absence.reason,
      notes: absence.notes || "",
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingId(null);
    setForm(initialForm);
  };

  const saveAbsence = async () => {
    if (
      !form.employeeId ||
      !form.date ||
      !form.reason.trim()
    ) {
      alert(
        "Please complete all required fields.",
      );

      return;
    }

    const scrollY = window.scrollY;

    try {
      setSaving(true);

      const token = getToken();

      const payload = {
        employeeId: Number(
          form.employeeId,
        ),
        date: form.date,
        status: form.status,
        reason: form.reason.trim(),
        notes:
          form.notes.trim() || undefined,
      };

      const url = editingId
        ? `${API_URL}/absences/${editingId}`
        : `${API_URL}/absences`;

      const method = editingId
        ? "PATCH"
        : "POST";

      const response = await fetch(
        url,
        {
          method,
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(
            payload,
          ),
        },
      );

      if (!response.ok) {
        const errorData =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          Array.isArray(
            errorData?.message,
          )
            ? errorData.message.join(
                ", ",
              )
            : errorData?.message ||
                "Failed to save absence record",
        );
      }

      closeModal();

      await fetchAbsences();

      requestAnimationFrame(() => {
        window.scrollTo(
          0,
          scrollY,
        );
      });
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to save absence record.",
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteAbsence = async (
    id: number,
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to permanently delete this absence record?",
      );

    if (!confirmed) {
      return;
    }

    const scrollY = window.scrollY;

    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/absences/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          errorData?.message ||
            "Failed to delete absence record",
        );
      }

      await fetchAbsences();

      requestAnimationFrame(() => {
        window.scrollTo(
          0,
          scrollY,
        );
      });
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete absence record.",
      );
    }
  };

  const filteredAbsences =
    absences.filter((absence) => {
      const employeeName =
        getEmployeeDisplayName(
          absence.employeeId,
        ).toLowerCase();

      const searchTerm =
        search
          .trim()
          .toLowerCase();

      const matchesSearch =
        !searchTerm ||
        employeeName.includes(
          searchTerm,
        ) ||
        absence.reason
          .toLowerCase()
          .includes(searchTerm) ||
        absence.date.includes(
          searchTerm,
        );

      const matchesStatus =
        statusFilter === "ALL" ||
        absence.status ===
          statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  const getStatusClass = (
    status: AbsenceStatus,
  ) => {
    switch (status) {
      case "EXCUSED":
        return "bg-green-100 text-green-800";

      default:
        return "bg-red-100 text-red-800";
    }
  };

  return (
    <DashboardLayout>
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">
              Absence Management
            </h1>

            <p className="mt-1 text-sm text-black">
              Track and manage employee
              absences.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Absence
          </button>
        </div>

        <div className="mb-4 flex flex-col gap-3 rounded-lg border bg-white p-4 shadow-sm md:flex-row">
          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search employee, reason, or date..."
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-black outline-none focus:border-blue-500"
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as
                  | "ALL"
                  | AbsenceStatus,
              )
            }
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-black outline-none focus:border-blue-500"
          >
            <option value="ALL">
              All Statuses
            </option>

            <option value="UNEXCUSED">
              Unexcused
            </option>

            <option value="EXCUSED">
              Excused
            </option>
          </select>
        </div>

        <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-black">
              Loading absence records...
            </div>
          ) : filteredAbsences.length ===
            0 ? (
            <div className="p-8 text-center text-black">
              No absence records found.
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-black">
                    Employee
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-black">
                    Date
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-black">
                    Status
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-black">
                    Reason
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-black">
                    Notes
                  </th>

                  <th className="px-4 py-3 text-right text-sm font-semibold text-black">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredAbsences.map(
                  (absence) => (
                    <tr
                      key={absence.id}
                      className="border-b last:border-b-0 hover:bg-gray-50"
                    >
                      <td className="px-4 py-4 text-sm font-medium text-black">
                        <div>
                          {getEmployeeDisplayName(
                            absence.employeeId,
                          )}
                        </div>

                        <div className="text-xs text-black">
                          #
                          {
                            absence.employeeId
                          }
                        </div>
                      </td>

                      <td className="px-4 py-4 text-sm text-black">
                        {absence.date}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                            absence.status,
                          )}`}
                        >
                          {absence.status}
                        </span>
                      </td>

                      <td className="max-w-xs px-4 py-4 text-sm text-black">
                        {absence.reason}
                      </td>

                      <td className="max-w-xs px-4 py-4 text-sm text-black">
                        {absence.notes ||
                          "—"}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            title="Edit"
                            onClick={() =>
                              openEditModal(
                                absence,
                              )
                            }
                            className="rounded-md bg-blue-600 p-2 text-white hover:bg-blue-700"
                          >
                            <Pencil
                              size={16}
                            />
                          </button>

                          <button
                            type="button"
                            title="Delete"
                            onClick={() =>
                              deleteAbsence(
                                absence.id,
                              )
                            }
                            className="rounded-md bg-gray-700 p-2 text-white hover:bg-gray-800"
                          >
                            <Trash2
                              size={16}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-black">
                {editingId
                  ? "Edit Absence"
                  : "Add Absence"}
              </h2>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-md p-1 text-black hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Employee
                </label>

                <select
                  value={
                    form.employeeId
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      employeeId:
                        e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-black outline-none focus:border-blue-500"
                  required
                >
                  <option value="">
                    Select an employee
                  </option>

                  {employees.map(
                    (employee) => (
                      <option
                        key={
                          employee.id
                        }
                        value={
                          employee.id
                        }
                      >
                        {getEmployeeName(employee)}
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
                  onChange={(e) =>
                    setForm({
                      ...form,
                      date: e.target
                        .value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Status
                </label>

                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status:
                        e.target
                          .value as AbsenceStatus,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-black outline-none focus:border-blue-500"
                >
                  <option value="UNEXCUSED">
                    Unexcused
                  </option>

                  <option value="EXCUSED">
                    Excused
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Reason
                </label>

                <input
                  type="text"
                  value={form.reason}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      reason:
                        e.target.value,
                    })
                  }
                  placeholder="e.g. Sick, personal emergency, no show"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Notes
                </label>

                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      notes:
                        e.target.value,
                    })
                  }
                  placeholder="Additional information..."
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-black outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-black hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveAbsence}
                disabled={
                  saving ||
                  employees.length === 0
                }
                className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Add Absence"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
