"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Check,
  Clock,
  Plus,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

import DashboardLayout from "../../components/DashboardLayout";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000";

type LeaveType =
  | "VACATION"
  | "SICK"
  | "EMERGENCY"
  | "OTHER";

type LeaveStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

type Leave = {
  id: number;
  employeeId: number;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
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

type LeaveForm = {
  employeeId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: string;
  reason: string;
};

const initialForm: LeaveForm = {
  employeeId: "",
  type: "VACATION",
  startDate: "",
  endDate: "",
  days: "",
  reason: "",
};

const getToken = () =>
  typeof window !== "undefined"
    ? localStorage.getItem("accessToken")
    : null;

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<Leave[]>(
    [],
  );

  const [employees, setEmployees] = useState<
    Employee[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [form, setForm] =
    useState<LeaveForm>(initialForm);

  const [saving, setSaving] =
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

      setEmployees(
        Array.isArray(data)
          ? data
          : data.data || [],
      );
    } catch (error) {
      console.error(error);
      alert("Failed to load employees.");
    }
  };

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
    const employee = employees.find(
      (item) => item.id === employeeId,
    );

    if (!employee) {
      return `#${employeeId}`;
    }

    return getEmployeeName(employee);
  };

  const fetchLeaves = async () => {
    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/leaves`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch leaves",
        );
      }

      const data = await response.json();

      setLeaves(
        Array.isArray(data)
          ? data
          : data.data || [],
      );
    } catch (error) {
      console.error(error);

      alert(
        "Failed to load leave requests.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
    fetchEmployees();
  }, []);

  const calculateDays = (
    startDate: string,
    endDate: string,
  ) => {
    if (!startDate || !endDate) {
      return "";
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return "";
    }

    const difference =
      end.getTime() - start.getTime();

    return String(
      Math.floor(
        difference /
          (1000 * 60 * 60 * 24),
      ) + 1,
    );
  };

  const handleDateChange = (
    field: "startDate" | "endDate",
    value: string,
  ) => {
    const updatedForm = {
      ...form,
      [field]: value,
    };

    const days = calculateDays(
      updatedForm.startDate,
      updatedForm.endDate,
    );

    setForm({
      ...updatedForm,
      days,
    });
  };

  const saveLeave = async () => {
    if (
      !form.employeeId ||
      !form.startDate ||
      !form.endDate ||
      !form.days ||
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

      const response = await fetch(
        `${API_URL}/leaves`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            employeeId: Number(
              form.employeeId,
            ),
            type: form.type,
            startDate: form.startDate,
            endDate: form.endDate,
            days: Number(form.days),
            reason: form.reason.trim(),
          }),
        },
      );

      if (!response.ok) {
        const errorData =
          await response.json().catch(
            () => null,
          );

        throw new Error(
          errorData?.message ||
            "Failed to submit leave request",
        );
      }

      setModalOpen(false);
      setForm(initialForm);

      await fetchLeaves();

      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to submit leave request.",
      );
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (
    id: number,
    status: "APPROVED" | "REJECTED",
    reason?: string,
  ) => {
    const scrollY = window.scrollY;

    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/leaves/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
            ...(reason
              ? {
                  rejectionReason: reason,
                }
              : {}),
          }),
        },
      );

      if (!response.ok) {
        const errorData =
          await response.json().catch(
            () => null,
          );

        throw new Error(
          errorData?.message ||
            "Failed to update leave status",
        );
      }

      setRejectingId(null);
      setRejectionReason("");

      await fetchLeaves();

      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to update leave status.",
      );
    }
  };

  const cancelLeave = async (
    id: number,
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this leave request?",
    );

    if (!confirmed) {
      return;
    }

    const scrollY = window.scrollY;

    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/leaves/${id}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData =
          await response.json().catch(
            () => null,
          );

        throw new Error(
          errorData?.message ||
            "Failed to cancel leave request",
        );
      }

      await fetchLeaves();

      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to cancel leave request.",
      );
    }
  };

  const deleteLeave = async (
    id: number,
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this leave request?",
    );

    if (!confirmed) {
      return;
    }

    const scrollY = window.scrollY;

    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/leaves/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData =
          await response.json().catch(
            () => null,
          );

        throw new Error(
          errorData?.message ||
            "Failed to delete leave request",
        );
      }

      await fetchLeaves();

      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete leave request.",
      );
    }
  };

  const getStatusClass = (
    status: LeaveStatus,
  ) => {
    switch (status) {
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

  const getTypeClass = (
    type: LeaveType,
  ) => {
    switch (type) {
      case "VACATION":
        return "bg-blue-100 text-blue-800";

      case "SICK":
        return "bg-red-100 text-red-800";

      case "EMERGENCY":
        return "bg-orange-100 text-orange-800";

      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  return (
    <DashboardLayout>
  
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">
              Leave Management
            </h1>

            <p className="mt-1 text-sm text-black">
              Manage employee leave requests,
              approvals, and cancellations.
            </p>
          </div>

          <button
            onClick={() => {
              setForm(initialForm);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Leave
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-black">
              Loading leave requests...
            </div>
          ) : leaves.length === 0 ? (
            <div className="p-8 text-center text-black">
              No leave requests found.
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-black">
                    Employee
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-black">
                    Type
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-black">
                    Dates
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-black">
                    Days
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-black">
                    Reason
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-black">
                    Status
                  </th>

                  <th className="px-4 py-3 text-right text-sm font-semibold text-black">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {leaves.map((leave) => (
                  <tr
                    key={leave.id}
                    className="border-b last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-4 text-sm font-medium text-black">
                      <div>
                        {getEmployeeDisplayName(
                          leave.employeeId,
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getTypeClass(
                          leave.type,
                        )}`}
                      >
                        {leave.type}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-sm text-black">
                      <div>
                        {leave.startDate}
                      </div>

                      <div className="text-xs text-black">
                        to {leave.endDate}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-sm font-semibold text-black">
                      {leave.days}
                    </td>

                    <td className="max-w-xs px-4 py-4 text-sm text-black">
                      <div className="truncate">
                        {leave.reason}
                      </div>

                      {leave.rejectionReason && (
                        <div className="mt-1 text-xs text-red-700">
                          Rejected:{" "}
                          {leave.rejectionReason}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                          leave.status,
                        )}`}
                      >
                        {leave.status}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        {leave.status ===
                          "PENDING" && (
                          <>
                            <button
                              title="Approve"
                              onClick={() =>
                                updateStatus(
                                  leave.id,
                                  "APPROVED",
                                )
                              }
                              className="rounded-md bg-green-600 p-2 text-white hover:bg-green-700"
                            >
                              <Check
                                size={16}
                              />
                            </button>

                            <button
                              title="Reject"
                              onClick={() => {
                                setRejectingId(
                                  leave.id,
                                );
                                setRejectionReason(
                                  "",
                                );
                              }}
                              className="rounded-md bg-red-600 p-2 text-white hover:bg-red-700"
                            >
                              <XCircle
                                size={16}
                              />
                            </button>

                            <button
                              title="Cancel"
                              onClick={() =>
                                cancelLeave(
                                  leave.id,
                                )
                              }
                              className="rounded-md bg-orange-500 p-2 text-white hover:bg-orange-600"
                            >
                              <Clock
                                size={16}
                              />
                            </button>
                          </>
                        )}

                        <button
                          title="Delete"
                          onClick={() =>
                            deleteLeave(
                              leave.id,
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
                ))}
              </tbody>
            </table>
          )}
        </div>
      

      {modalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-black">
                Add Leave Request
              </h2>

              <button
                onClick={() =>
                  setModalOpen(false)
                }
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
                  value={form.employeeId}
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
                        key={employee.id}
                        value={employee.id}
                      >
                        {getEmployeeName(employee)}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Leave Type
                </label>

                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      type: e.target
                        .value as LeaveType,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black outline-none focus:border-blue-500"
                >
                  <option value="VACATION">
                    Vacation
                  </option>

                  <option value="SICK">
                    Sick
                  </option>

                  <option value="EMERGENCY">
                    Emergency
                  </option>

                  <option value="OTHER">
                    Other
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-black">
                    Start Date
                  </label>

                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) =>
                      handleDateChange(
                        "startDate",
                        e.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-black">
                    End Date
                  </label>

                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) =>
                      handleDateChange(
                        "endDate",
                        e.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Days
                </label>

                <input
                  type="number"
                  min="1"
                  value={form.days}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      days: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-black outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Reason
                </label>

                <textarea
                  rows={4}
                  value={form.reason}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      reason: e.target.value,
                    })
                  }
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-black outline-none focus:border-blue-500"
                  placeholder="Enter reason for leave"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() =>
                  setModalOpen(false)
                }
                className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-black hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={saveLeave}
                disabled={
                  saving ||
                  employees.length === 0
                }
                className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Submitting..."
                  : "Submit Leave"}
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectingId !== null && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-black">
              Reject Leave Request
            </h2>

            <p className="mt-2 text-sm text-black">
              Please provide a reason for
              rejecting this leave request.
            </p>

            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) =>
                setRejectionReason(
                  e.target.value,
                )
              }
              className="mt-4 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-black outline-none focus:border-red-500"
              placeholder="Enter rejection reason"
            />

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => {
                  setRejectingId(null);
                  setRejectionReason("");
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-black hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  if (
                    !rejectionReason.trim()
                  ) {
                    alert(
                      "Rejection reason is required.",
                    );

                    return;
                  }

                  updateStatus(
                    rejectingId,
                    "REJECTED",
                    rejectionReason.trim(),
                  );
                }}
                className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
              >
                Reject Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
