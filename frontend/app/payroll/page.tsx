"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Download,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000";

type Employee = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  position?: string;
  department?: string;
};

type Payroll = {
  id: number;
  employeeId: number;
  employee?: Employee;

  periodStart: string;
  periodEnd: string;
  payDate: string | null;

  basicPay: number;
  overtimePay: number;
  holidayPay: number;
  nightDifferential: number;
  allowances: number;
  bonus: number;

  grossPay: number;

  sssRate: number;
  sss: number;

  philhealthRate: number;
  philhealth: number;

  pagibigRate: number;
  pagibig: number;

  withholdingTaxRate: number;
  withholdingTax: number;

  otherDeductions: number;
  totalDeductions: number;
  netPay: number;

  status: "DRAFT" | "APPROVED" | "PAID";
};

type PayrollForm = {
  employeeId: string;
  periodStart: string;
  periodEnd: string;
  payDate: string;

  basicPay: string;
  overtimePay: string;
  holidayPay: string;
  nightDifferential: string;
  allowances: string;
  bonus: string;

  sssRate: string;
  philhealthRate: string;
  pagibigRate: string;
  withholdingTaxRate: string;

  otherDeductions: string;
};

const initialForm: PayrollForm = {
  employeeId: "",
  periodStart: "",
  periodEnd: "",
  payDate: "",

  basicPay: "",
  overtimePay: "0",
  holidayPay: "0",
  nightDifferential: "0",
  allowances: "0",
  bonus: "0",

  sssRate: "5",
  philhealthRate: "2.5",
  pagibigRate: "2",
  withholdingTaxRate: "0",

  otherDeductions: "0",
};

function formatMoney(value: number) {
  return `₱${Number(value || 0).toLocaleString(
    "en-PH",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )}`;
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return value.slice(0, 10);
}

function getEmployeeName(
  payroll: Payroll,
  employees: Employee[],
) {
  if (payroll.employee) {
    return `${payroll.employee.firstName} ${payroll.employee.lastName}`;
  }

  const employee = employees.find(
    (item) => item.id === payroll.employeeId,
  );

  if (!employee) {
    return `Employee #${payroll.employeeId}`;
  }

  return `${employee.firstName} ${employee.lastName}`;
}

function MoneyInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-black">
        {label}
      </label>

      <input
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function RateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-black">
        {label}
      </label>

      <div className="relative">
        <input
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-8 text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        <span className="absolute right-3 top-2 text-sm text-black">
          %
        </span>
      </div>
    </div>
  );
}

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<
    Payroll[]
  >([]);

  const [employees, setEmployees] = useState<
    Employee[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingPayroll, setEditingPayroll] =
    useState<Payroll | null>(null);

  const [form, setForm] =
    useState<PayrollForm>(initialForm);

  async function loadData() {
    try {
      setLoading(true);

      const authToken =
        localStorage.getItem("accessToken");

      const headers = {
        Authorization: `Bearer ${authToken}`,
      };

      const [
        payrollResponse,
        employeesResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/payroll`, {
          headers,
        }),
        fetch(`${API_URL}/employees`, {
          headers,
        }),
      ]);

      if (!payrollResponse.ok) {
        throw new Error(
          "Failed to load payroll data.",
        );
      }

      if (!employeesResponse.ok) {
        throw new Error(
          "Failed to load employees.",
        );
      }

      const payrollData =
        await payrollResponse.json();

      const employeeData =
        await employeesResponse.json();

      setPayrolls(payrollData);
      setEmployees(employeeData);
    } catch (error) {
      console.error(
        "Payroll load error:",
        error,
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to load payroll data.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredPayrolls = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return payrolls.filter((payroll) => {
      const employeeName =
        getEmployeeName(
          payroll,
          employees,
        ).toLowerCase();

      const matchesSearch =
        !query ||
        employeeName.includes(query) ||
        String(payroll.employeeId).includes(
          query,
        );

      const matchesStatus =
        statusFilter === "ALL" ||
        payroll.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    payrolls,
    employees,
    search,
    statusFilter,
  ]);

  function updateForm(
    field: keyof PayrollForm,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function openCreateModal() {
    setEditingPayroll(null);

    setForm(initialForm);

    setModalOpen(true);
  }

  function handleEdit(payroll: Payroll) {
    setEditingPayroll(payroll);

    setForm({
      employeeId: String(
        payroll.employeeId,
      ),
      periodStart: payroll.periodStart,
      periodEnd: payroll.periodEnd,
      payDate: payroll.payDate || "",

      basicPay: String(payroll.basicPay),
      overtimePay: String(
        payroll.overtimePay,
      ),
      holidayPay: String(
        payroll.holidayPay,
      ),
      nightDifferential: String(
        payroll.nightDifferential,
      ),
      allowances: String(
        payroll.allowances,
      ),
      bonus: String(payroll.bonus),

      sssRate: String(payroll.sssRate),
      philhealthRate: String(
        payroll.philhealthRate,
      ),
      pagibigRate: String(
        payroll.pagibigRate,
      ),
      withholdingTaxRate: String(
        payroll.withholdingTaxRate,
      ),

      otherDeductions: String(
        payroll.otherDeductions,
      ),
    });

    setModalOpen(true);
  }

  async function handleSubmit(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    if (editingPayroll) {
      alert(
        "Payroll update is not available yet because the backend does not have a PATCH /payroll/:id endpoint.",
      );

      return;
    }

    try {
      const authToken =
        localStorage.getItem("accessToken");

      const response = await fetch(
        `${API_URL}/payroll`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            employeeId: Number(
              form.employeeId,
            ),

            periodStart:
              form.periodStart,

            periodEnd:
              form.periodEnd,

            payDate:
              form.payDate || undefined,

            basicPay: Number(
              form.basicPay,
            ),

            overtimePay: Number(
              form.overtimePay || 0,
            ),

            holidayPay: Number(
              form.holidayPay || 0,
            ),

            nightDifferential: Number(
              form.nightDifferential || 0,
            ),

            allowances: Number(
              form.allowances || 0,
            ),

            bonus: Number(
              form.bonus || 0,
            ),

            sssRate: Number(
              form.sssRate || 0,
            ),

            philhealthRate: Number(
              form.philhealthRate || 0,
            ),

            pagibigRate: Number(
              form.pagibigRate || 0,
            ),

            withholdingTaxRate: Number(
              form.withholdingTaxRate || 0,
            ),

            otherDeductions: Number(
              form.otherDeductions || 0,
            ),
          }),
        },
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        throw new Error(
          errorText ||
            "Failed to create payroll.",
        );
      }

      const scrollY = window.scrollY;

      setModalOpen(false);

      setForm(initialForm);

      await loadData();

      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    } catch (error) {
      console.error(
        "Payroll create error:",
        error,
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to create payroll.",
      );
    }
  }

  async function handleApprove(
    id: number,
  ) {
    try {
      const authToken =
        localStorage.getItem("accessToken");

      const response = await fetch(
        `${API_URL}/payroll/${id}/approve`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        throw new Error(
          errorText ||
            "Failed to approve payroll.",
        );
      }

      const scrollY = window.scrollY;

      await loadData();

      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    } catch (error) {
      console.error(
        "Payroll approval error:",
        error,
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to approve payroll.",
      );
    }
  }

  async function handleMarkPaid(
    id: number,
  ) {
    try {
      const authToken =
        localStorage.getItem("accessToken");

      const response = await fetch(
        `${API_URL}/payroll/${id}/paid`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        throw new Error(
          errorText ||
            "Failed to mark payroll as paid.",
        );
      }

      const scrollY = window.scrollY;

      await loadData();

      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    } catch (error) {
      console.error(
        "Payroll paid error:",
        error,
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to mark payroll as paid.",
      );
    }
  }

  async function handleDelete(
    id: number,
  ) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this payroll record?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const authToken =
        localStorage.getItem("accessToken");

      const response = await fetch(
        `${API_URL}/payroll/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        throw new Error(
          errorText ||
            "Failed to delete payroll.",
        );
      }

      const scrollY = window.scrollY;

      await loadData();

      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    } catch (error) {
      console.error(
        "Payroll delete error:",
        error,
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete payroll.",
      );
    }
  }

  async function downloadPayslip(
    payrollId: number,
  ) {
    try {
      const authToken =
        localStorage.getItem("accessToken");

      const response = await fetch(
        `${API_URL}/payroll/${payrollId}/payslip`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        throw new Error(
          errorText ||
            "Failed to download payslip.",
        );
      }

      const blob =
        await response.blob();

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `payslip-${payrollId}.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        "Payslip download error:",
        error,
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to download payslip.",
      );
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-black">
              Payroll
            </h1>

            <p className="mt-1 text-sm text-black">
              Manage employee payroll,
              deductions, approvals, and
              payslips.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Payroll
          </button>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
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
                  placeholder="Search employee..."
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-black placeholder:text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value,
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="ALL">
                  All Statuses
                </option>

                <option value="DRAFT">
                  Draft
                </option>

                <option value="APPROVED">
                  Approved
                </option>

                <option value="PAID">
                  Paid
                </option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-black">
                    Employee
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-black">
                    Pay Period
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-black">
                    Gross Pay
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-black">
                    Deductions
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-black">
                    Net Pay
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-black">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-black">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-sm text-black"
                    >
                      Loading payroll...
                    </td>
                  </tr>
                ) : filteredPayrolls.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-sm text-black"
                    >
                      No payroll records
                      found.
                    </td>
                  </tr>
                ) : (
                  filteredPayrolls.map(
                    (payroll) => (
                      <tr
                        key={payroll.id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium text-black">
                            {getEmployeeName(
                              payroll,
                              employees,
                            )}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-sm text-black">
                          <div>
                            {formatDate(
                              payroll.periodStart,
                            )}
                          </div>

                          <div>
                            to{" "}
                            {formatDate(
                              payroll.periodEnd,
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-right text-sm font-medium text-black">
                          {formatMoney(
                            payroll.grossPay,
                          )}
                        </td>

                        <td className="px-6 py-4 text-right text-sm text-black">
                          {formatMoney(
                            payroll.totalDeductions,
                          )}
                        </td>

                        <td className="px-6 py-4 text-right text-sm font-semibold text-black">
                          {formatMoney(
                            payroll.netPay,
                          )}
                        </td>

                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              payroll.status ===
                              "PAID"
                                ? "bg-green-100 text-green-800"
                                : payroll.status ===
                                    "APPROVED"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {payroll.status}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-wrap justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(
                                  payroll,
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-black hover:bg-gray-50"
                            >
                              <Pencil
                                size={15}
                              />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                downloadPayslip(
                                  payroll.id,
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-600 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-50"
                            >
                              <Download
                                size={15}
                              />
                              Payslip
                            </button>

                            {payroll.status ===
                              "DRAFT" && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleApprove(
                                    payroll.id,
                                  )
                                }
                                className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700"
                              >
                                Approve
                              </button>
                            )}

                            {payroll.status ===
                              "APPROVED" && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleMarkPaid(
                                    payroll.id,
                                  )
                                }
                                className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
                              >
                                Mark Paid
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  payroll.id,
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50"
                            >
                              <Trash2
                                size={15}
                              />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-black">
                  {editingPayroll
                    ? "Edit Payroll"
                    : "Create Payroll"}
                </h2>

                <p className="mt-1 text-sm text-black">
                  Enter payroll earnings
                  and deduction information.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setModalOpen(false)
                }
                className="rounded-lg p-2 text-black hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6 p-6"
            >
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-black">
                    Employee
                  </label>

                  <select
                    required
                    value={form.employeeId}
                    onChange={(event) =>
                      updateForm(
                        "employeeId",
                        event.target.value,
                      )
                    }
                    disabled={
                      Boolean(editingPayroll)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                          {employee.firstName}{" "}
                          {
                            employee.lastName
                          }
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-black">
                    Period Start
                  </label>

                  <input
                    required
                    type="date"
                    value={form.periodStart}
                    onChange={(event) =>
                      updateForm(
                        "periodStart",
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-black">
                    Period End
                  </label>

                  <input
                    required
                    type="date"
                    value={form.periodEnd}
                    onChange={(event) =>
                      updateForm(
                        "periodEnd",
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-black">
                    Pay Date
                  </label>

                  <input
                    type="date"
                    value={form.payDate}
                    onChange={(event) =>
                      updateForm(
                        "payDate",
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-base font-bold text-black">
                  Earnings
                </h3>

                <div className="grid gap-4 md:grid-cols-3">
                  <MoneyInput
                    label="Basic Pay"
                    value={form.basicPay}
                    onChange={(value) =>
                      updateForm(
                        "basicPay",
                        value,
                      )
                    }
                  />

                  <MoneyInput
                    label="Overtime Pay"
                    value={
                      form.overtimePay
                    }
                    onChange={(value) =>
                      updateForm(
                        "overtimePay",
                        value,
                      )
                    }
                  />

                  <MoneyInput
                    label="Holiday Pay"
                    value={
                      form.holidayPay
                    }
                    onChange={(value) =>
                      updateForm(
                        "holidayPay",
                        value,
                      )
                    }
                  />

                  <MoneyInput
                    label="Night Differential"
                    value={
                      form.nightDifferential
                    }
                    onChange={(value) =>
                      updateForm(
                        "nightDifferential",
                        value,
                      )
                    }
                  />

                  <MoneyInput
                    label="Allowances"
                    value={
                      form.allowances
                    }
                    onChange={(value) =>
                      updateForm(
                        "allowances",
                        value,
                      )
                    }
                  />

                  <MoneyInput
                    label="Bonus"
                    value={form.bonus}
                    onChange={(value) =>
                      updateForm(
                        "bonus",
                        value,
                      )
                    }
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-base font-bold text-black">
                  Contribution & Tax Rates
                </h3>

                <div className="grid gap-4 md:grid-cols-4">
                  <RateInput
                    label="SSS Rate"
                    value={form.sssRate}
                    onChange={(value) =>
                      updateForm(
                        "sssRate",
                        value,
                      )
                    }
                  />

                  <RateInput
                    label="PhilHealth Rate"
                    value={
                      form.philhealthRate
                    }
                    onChange={(value) =>
                      updateForm(
                        "philhealthRate",
                        value,
                      )
                    }
                  />

                  <RateInput
                    label="Pag-IBIG Rate"
                    value={
                      form.pagibigRate
                    }
                    onChange={(value) =>
                      updateForm(
                        "pagibigRate",
                        value,
                      )
                    }
                  />

                  <RateInput
                    label="Withholding Tax Rate"
                    value={
                      form.withholdingTaxRate
                    }
                    onChange={(value) =>
                      updateForm(
                        "withholdingTaxRate",
                        value,
                      )
                    }
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-base font-bold text-black">
                  Other Deductions
                </h3>

                <div className="max-w-sm">
                  <MoneyInput
                    label="Other Deductions"
                    value={
                      form.otherDeductions
                    }
                    onChange={(value) =>
                      updateForm(
                        "otherDeductions",
                        value,
                      )
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
                <button
                  type="button"
                  onClick={() =>
                    setModalOpen(false)
                  }
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-black hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  {editingPayroll
                    ? "Update Payroll"
                    : "Create Payroll"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
