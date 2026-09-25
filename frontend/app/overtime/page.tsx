"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Check,
  Clock3,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import DashboardLayout from "../../components/DashboardLayout";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000";

type OvertimeStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

type Overtime = {
  id: number;
  employeeId: number;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  reason: string;
  status: OvertimeStatus;
  notes: string | null;
  rejectionReason: string | null;
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

type OvertimeForm = {
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: string;
  reason: string;
  notes: string;
};

const initialForm: OvertimeForm = {
  employeeId: "",
  date: "",
  startTime: "",
  endTime: "",
  hours: "",
  reason: "",
  notes: "",
};

const getToken = () =>
  typeof window !== "undefined"
    ? localStorage.getItem("accessToken")
    : null;

export default function OvertimePage() {
  const [overtime, setOvertime] = useState<Overtime[]>(
    [],
  );

  const [employees, setEmployees] = useState<Employee[]>(
    [],
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);

  const [editingId, setEditingId] = useState<
    number | null
  >(null);

  const [form, setForm] =
    useState<OvertimeForm>(initialForm);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<"ALL" | OvertimeStatus>("ALL");

  const [rejectionModalOpen, setRejectionModalOpen] =
    useState(false);

  const [rejectingId, setRejectingId] =
    useState<number | null>(null);

  const [rejectionReason, setRejectionReason] =
    useState("");

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

  const fetchOvertime = async () => {
    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/overtime`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch overtime records",
        );
      }

      const data = await response.json();

      setOvertime(data);
    } catch (error) {
      console.error(error);
      alert(
        "Failed to load overtime records.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchOvertime();
  }, []);

  const getEmployeeName = (
    employeeId: number,
  ) => {
    const employee = employees.find(
      (item) => item.id === employeeId,
    );

    if (!employee) {
      return "Unknown Employee";
    }

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

    return fullName || "Unknown Employee";
  };

  const getEmployeeDisplayName = (
    employeeId: number,
  ) => {
    const name =
      getEmployeeName(employeeId);

    return name;
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEditModal = (
    record: Overtime,
  ) => {
    setEditingId(record.id);

    setForm({
      employeeId: String(
        record.employeeId,
      ),
      date: record.date,
      startTime: record.startTime.slice(
        0,
        5,
      ),
      endTime: record.endTime.slice(
        0,
        5,
      ),
      hours: String(record.hours),
      reason: record.reason,
      notes: record.notes || "",
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

  const saveOvertime = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    if (
      !form.employeeId ||
      !form.date ||
      !form.startTime ||
      !form.endTime ||
      !form.hours ||
      !form.reason.trim()
    ) {
      alert(
        "Please complete all required fields.",
      );

      return;
    }

    const hours = Number(form.hours);

    if (
      Number.isNaN(hours) ||
      hours <= 0
    ) {
      alert(
        "Hours must be greater than 0.",
      );

      return;
    }

    if (
      form.endTime <=
      form.startTime
    ) {
      alert(
        "End time must be later than start time.",
      );

      return;
    }

    const scrollY = window.scrollY;

    setSaving(true);

    try {
      const token = getToken();

      const payload = {
        employeeId: Number(
          form.employeeId,
        ),
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        hours,
        reason: form.reason.trim(),
        notes:
          form.notes.trim() || undefined,
      };

      const url = editingId
        ? `${API_URL}/overtime/${editingId}`
        : `${API_URL}/overtime`;

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
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const data =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          data?.message ||
            "Failed to save overtime record.",
        );
      }

      await fetchOvertime();

      setModalOpen(false);
      setEditingId(null);
      setForm(initialForm);

      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to save overtime record.",
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteOvertime = async (
    id: number,
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this overtime record?",
      );

    if (!confirmed) {
      return;
    }

    const scrollY = window.scrollY;

    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/overtime/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          "Failed to delete overtime record.",
        );
      }

      await fetchOvertime();

      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    } catch (error) {
      console.error(error);

      alert(
        "Failed to delete overtime record.",
      );
    }
  };

  const approveOvertime = async (
    id: number,
  ) => {
    const scrollY = window.scrollY;

    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/overtime/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "APPROVED",
          }),
        },
      );

      if (!response.ok) {
        const data =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          data?.message ||
            "Failed to approve overtime record.",
        );
      }

      await fetchOvertime();

      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to approve overtime record.",
      );
    }
  };

  const openRejectModal = (
    id: number,
  ) => {
    setRejectingId(id);
    setRejectionReason("");
    setRejectionModalOpen(true);
  };

  const closeRejectModal = () => {
    setRejectingId(null);
    setRejectionReason("");
    setRejectionModalOpen(false);
  };

  const rejectOvertime = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    if (!rejectionReason.trim()) {
      alert(
        "Please enter a rejection reason.",
      );

      return;
    }

    if (!rejectingId) {
      return;
    }

    const scrollY = window.scrollY;

    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/overtime/${rejectingId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "REJECTED",
            rejectionReason:
              rejectionReason.trim(),
          }),
        },
      );

      if (!response.ok) {
        const data =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          data?.message ||
            "Failed to reject overtime record.",
        );
      }

      await fetchOvertime();

      closeRejectModal();

      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to reject overtime record.",
      );
    }
  };

  const filteredOvertime =
    useMemo(() => {
      const searchValue =
        search
          .trim()
          .toLowerCase();

      return overtime.filter(
        (record) => {
          const employeeName =
            getEmployeeName(
              record.employeeId,
            ).toLowerCase();

          const matchesSearch =
            !searchValue ||
            employeeName.includes(
              searchValue,
            ) ||
            String(
              record.employeeId,
            ).includes(searchValue) ||
            record.reason
              .toLowerCase()
              .includes(searchValue) ||
            record.date.includes(
              searchValue,
            );

          const matchesStatus =
            statusFilter === "ALL" ||
            record.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        },
      );
    }, [
      overtime,
      employees,
      search,
      statusFilter,
    ]);

  const getStatusClass = (
    status: OvertimeStatus,
  ) => {
    if (status === "APPROVED") {
      return "bg-green-100 text-green-800";
    }

    if (status === "REJECTED") {
      return "bg-red-100 text-red-800";
    }

    return "bg-yellow-100 text-yellow-800";
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">
            Overtime
          </h1>

          <p className="mt-1 text-sm text-black">
            Manage employee overtime records.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />

          Add Overtime
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm mb-2">
        <div className="grid gap-4 md:grid-cols-2">
          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search employee, ID, reason, or date..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm text-black outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target
                  .value as
                  | "ALL"
                  | OvertimeStatus,
              )
            }
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-black outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">
              All Statuses
            </option>

            <option value="PENDING">
              Pending
            </option>

            <option value="APPROVED">
              Approved
            </option>

            <option value="REJECTED">
              Rejected
            </option>
          </select>
        </div>
      </div>
    
      {/* Table */}
      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-black">
            Loading overtime records...
          </div>
        ) : filteredOvertime.length ===
          0 ? (
          <div className="p-8 text-center text-black">
            No overtime records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-black">
                    Employee
                  </th>

                  <th className="px-4 py-3 font-semibold text-black">
                    Date
                  </th>

                  <th className="px-4 py-3 font-semibold text-black">
                    Time
                  </th>

                  <th className="px-4 py-3 font-semibold text-black">
                    Hours
                  </th>

                  <th className="px-4 py-3 font-semibold text-black">
                    Reason
                  </th>

                  <th className="px-4 py-3 font-semibold text-black">
                    Status
                  </th>

                  <th className="px-4 py-3 text-right font-semibold text-black">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredOvertime.map(
                  (record) => (
                    <tr
                      key={record.id}
                      className="border-b last:border-b-0"
                    >
                      <td className="px-4 py-4">
                        <div className="font-medium text-black">
                          {getEmployeeName(
                            record.employeeId,
                          )}
                        </div>

                      </td>

                      <td className="px-4 py-4 text-black">
                        {record.date}
                      </td>

                      <td className="px-4 py-4 text-black">
                        {record.startTime.slice(
                          0,
                          5,
                        )}{" "}
                        -{" "}
                        {record.endTime.slice(
                          0,
                          5,
                        )}
                      </td>

                      <td className="px-4 py-4 text-black">
                        {Number(
                          record.hours,
                        ).toFixed(2)}{" "}
                        hrs
                      </td>

                      <td className="max-w-xs px-4 py-4 text-black">
                        <div>
                          {record.reason}
                        </div>

                        {record.notes && (
                          <div className="mt-1 text-xs text-black">
                            Notes:{" "}
                            {
                              record.notes
                            }
                          </div>
                        )}

                        {record.rejectionReason && (
                          <div className="mt-1 text-xs text-red-700">
                            Rejected:{" "}
                            {
                              record.rejectionReason
                            }
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                            record.status,
                          )}`}
                        >
                          {
                            record.status
                          }
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          {record.status ===
                            "PENDING" && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  approveOvertime(
                                    record.id,
                                  )
                                }
                                title="Approve"
                                className="rounded-lg p-2 text-green-700 transition hover:bg-green-50"
                              >
                                <Check
                                  size={
                                    17
                                  }
                                />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openRejectModal(
                                    record.id,
                                  )
                                }
                                title="Reject"
                                className="rounded-lg p-2 text-red-700 transition hover:bg-red-50"
                              >
                                <X
                                  size={
                                    17
                                  }
                                />
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(
                                record,
                              )
                            }
                            title="Edit"
                            className="rounded-lg p-2 text-blue-700 transition hover:bg-blue-50"
                          >
                            <Pencil
                              size={
                                17
                              }
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteOvertime(
                                record.id,
                              )
                            }
                            title="Delete"
                            className="rounded-lg p-2 text-red-700 transition hover:bg-red-50"
                          >
                            <Trash2
                              size={
                                17
                              }
                            />
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

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-black">
                  {editingId
                    ? "Edit Overtime"
                    : "Add Overtime"}
                </h2>

                <p className="mt-1 text-sm text-black">
                  Enter the overtime details.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-black transition hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={saveOvertime}
              className="space-y-5 p-6"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Employee
                </label>

                <select
                  value={form.employeeId}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      employeeId:
                        event.target
                          .value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="">
                    Select employee
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
                        {getEmployeeDisplayName(
                          employee.id,
                        )}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-black">
                    Date
                  </label>

                  <input
                    type="date"
                    value={form.date}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        date:
                          event.target
                            .value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-black">
                    Hours
                  </label>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.hours}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        hours:
                          event.target
                            .value,
                      })
                    }
                    placeholder="e.g. 2.5"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-black">
                    Start Time
                  </label>

                  <input
                    type="time"
                    value={
                      form.startTime
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        startTime:
                          event.target
                            .value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-black">
                    End Time
                  </label>

                  <input
                    type="time"
                    value={
                      form.endTime
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        endTime:
                          event.target
                            .value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Reason
                </label>

                <input
                  type="text"
                  value={form.reason}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      reason:
                        event.target
                          .value,
                    })
                  }
                  placeholder="Enter overtime reason"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Notes
                </label>

                <textarea
                  value={form.notes}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      notes:
                        event.target
                          .value,
                    })
                  }
                  placeholder="Optional notes"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 border-t pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-black transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Overtime"
                      : "Save Overtime"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectionModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-black">
                  Reject Overtime
                </h2>

                <p className="mt-1 text-sm text-black">
                  Provide a reason for rejecting this request.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeRejectModal
                }
                className="rounded-lg p-2 text-black transition hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={
                rejectOvertime
              }
              className="space-y-5 p-6"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Rejection Reason
                </label>

                <textarea
                  value={
                    rejectionReason
                  }
                  onChange={(event) =>
                    setRejectionReason(
                      event.target
                        .value,
                    )
                  }
                  rows={4}
                  placeholder="Enter rejection reason"
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={
                    closeRejectModal
                  }
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-black transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                >
                  Reject Overtime
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
