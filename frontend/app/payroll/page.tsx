"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useMemo, useState } from "react";
import {
  Check,
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
};

type Payroll = {
  id: number;
  employeeId: number;
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

const emptyForm: PayrollForm = {
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

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPayroll, setEditingPayroll] =
    useState<Payroll | null>(null);

  const [form, setForm] =
    useState<PayrollForm>(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const authToken =
        localStorage.getItem("accessToken");

      const headers = {
        Authorization: `Bearer ${authToken}`,
      };

      const [payrollResponse, employeesResponse] =
        await Promise.all([
          fetch(`${API_URL}/payroll`, {
            headers,
          }),
          fetch(`${API_URL}/employees`, {
            headers,
          }),
        ]);

      console.log(
        "PAYROLL status:",
        payrollResponse.status,
      );

      console.log(
        "EMPLOYEES status:",
        employeesResponse.status,
      );

      const payrollText =
        await payrollResponse.text();

      const employeesText =
        await employeesResponse.text();

      console.log(
        "PAYROLL raw response:",
        payrollText,
      );

      console.log(
        "EMPLOYEES raw response:",
        employeesText,
      );

      let payrollData;
      let employeeData;

      try {
        payrollData =
          JSON.parse(payrollText);
      } catch (error) {
        console.error(
          "PAYROLL JSON parse error:",
          error,
        );

        throw new Error(
          `Payroll API did not return JSON: ${payrollText.substring(
            0,
            300,
          )}`,
        );
      }

      try {
        employeeData =
          JSON.parse(employeesText);
      } catch (error) {
        console.error(
          "EMPLOYEES JSON parse error:",
          error,
        );

        throw new Error(
          `Employees API did not return JSON: ${employeesText.substring(
            0,
            300,
          )}`,
        );
      }

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

  function getEmployeeName(employeeId: number) {
    const employee = employees.find(
      (item) => item.id === employeeId,
    );

    if (!employee) {
      return `Employee #${employeeId}`;
    }

    return `${employee.firstName} ${employee.lastName}`;
  }

  const filteredPayrolls = useMemo(() => {
    const searchValue =
      search.toLowerCase().trim();

    return payrolls.filter((payroll) => {
      const employeeName =
        getEmployeeName(
          payroll.employeeId,
        ).toLowerCase();

      const matchesSearch =
        employeeName.includes(searchValue) ||
        String(payroll.employeeId).includes(
          searchValue,
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

  function openCreateModal() {
    setEditingPayroll(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEditModal(payroll: Payroll) {
    setEditingPayroll(payroll);

    setForm({
      employeeId: String(
        payroll.employeeId,
      ),
      periodStart:
        payroll.periodStart?.substring(
          0,
          10,
        ) || "",
      periodEnd:
        payroll.periodEnd?.substring(
          0,
          10,
        ) || "",
      payDate:
        payroll.payDate?.substring(
          0,
          10,
        ) || "",
      basicPay: String(
        payroll.basicPay ?? 0,
      ),
      overtimePay: String(
        payroll.overtimePay ?? 0,
      ),
      holidayPay: String(
        payroll.holidayPay ?? 0,
      ),
      nightDifferential: String(
        payroll.nightDifferential ?? 0,
      ),
      allowances: String(
        payroll.allowances ?? 0,
      ),
      bonus: String(
        payroll.bonus ?? 0,
      ),
      sssRate: String(
        payroll.sssRate ?? 0,
      ),
      philhealthRate: String(
        payroll.philhealthRate ?? 0,
      ),
      pagibigRate: String(
        payroll.pagibigRate ?? 0,
      ),
      withholdingTaxRate: String(
        payroll.withholdingTaxRate ?? 0,
      ),
      otherDeductions: String(
        payroll.otherDeductions ?? 0,
      ),
    });

    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingPayroll(null);
    setForm(emptyForm);
  }

  function updateForm(
    field: keyof PayrollForm,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    if (!form.employeeId) {
      alert("Please select an employee.");
      return;
    }

    if (!form.periodStart) {
      alert("Please select the period start.");
      return;
    }

    if (!form.periodEnd) {
      alert("Please select the period end.");
      return;
    }

    if (!form.basicPay) {
      alert("Please enter basic pay.");
      return;
    }

    if (editingPayroll) {
      alert(
        "Payroll update is not available yet because the backend does not have a PATCH /payroll/:id endpoint.",
      );

      return;
    }

    try {
      setSaving(true);

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
            nightDifferential:
              Number(
                form.nightDifferential ||
                  0,
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
            philhealthRate:
              Number(
                form.philhealthRate ||
                  0,
              ),
            pagibigRate: Number(
              form.pagibigRate || 0,
            ),
            withholdingTaxRate:
              Number(
                form.withholdingTaxRate ||
                  0,
              ),
            otherDeductions:
              Number(
                form.otherDeductions ||
                  0,
              ),
          }),
        },
      );

      if (!response.ok) {
        const errorData =
          await response.json().catch(
            () => null,
          );

        console.error(errorData);

        throw new Error(
          "Failed to create payroll",
        );
      }

      closeModal();

      await loadData();

      alert(
        "Payroll created successfully.",
      );
    } catch (error) {
      console.error(error);

      alert(
        "Failed to create payroll.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function approvePayroll(
    payroll: Payroll,
  ) {
    if (
      !confirm(
        `Approve payroll for ${getEmployeeName(
          payroll.employeeId,
        )}?`,
      )
    ) {
      return;
    }

    try {
      const authToken =
        localStorage.getItem("accessToken");

      const response = await fetch(
        `${API_URL}/payroll/${payroll.id}/approve`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          "Failed to approve payroll",
        );
      }

      await loadData();
    } catch (error) {
      console.error(error);

      alert(
        "Failed to approve payroll.",
      );
    }
  }

  async function markAsPaid(
    payroll: Payroll,
  ) {
    if (
      !confirm(
        `Mark payroll for ${getEmployeeName(
          payroll.employeeId,
        )} as paid?`,
      )
    ) {
      return;
    }

    try {
      const authToken =
        localStorage.getItem("accessToken");

      const response = await fetch(
        `${API_URL}/payroll/${payroll.id}/paid`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          "Failed to mark payroll as paid",
        );
      }

      await loadData();
    } catch (error) {
      console.error(error);

      alert(
        "Failed to mark payroll as paid.",
      );
    }
  }

  async function deletePayroll(
    payroll: Payroll,
  ) {
    if (
      !confirm(
        `Delete payroll for ${getEmployeeName(
          payroll.employeeId,
        )}?`,
      )
    ) {
      return;
    }

    try {
      const authToken =
        localStorage.getItem("accessToken");

      const response = await fetch(
        `${API_URL}/payroll/${payroll.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          "Failed to delete payroll",
        );
      }

      await loadData();
    } catch (error) {
      console.error(error);

      alert(
        "Failed to delete payroll.",
      );
    }
  }

  function getStatusClass(status: string) {
    switch (status) {
      case "APPROVED":
        return "bg-blue-100 text-blue-800";

      case "PAID":
        return "bg-green-100 text-green-800";

      default:
        return "bg-yellow-100 text-yellow-800";
    }
  }

  function formatCurrency(
    value: number,
  ) {
    return `₱${Number(value || 0).toLocaleString(
      "en-PH",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    )}`;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-black">
              Payroll Management
            </h1>

            <p className="mt-1 text-sm text-black">
              Manage employee payroll,
              deductions, approvals, and
              payments.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Payroll
          </button>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium text-black">
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
                  placeholder="Search employee..."
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-black">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value,
                  )
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

            <table className="min-w-full divide-y divide-gray-200">

              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black">
                    Employee
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black">
                    Period
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-black">
                    Gross Pay
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-black">
                    Deductions
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-black">
                    Net Pay
                  </th>

                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-black">
                    Status
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-black">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">

                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-sm text-black"
                    >
                      Loading payroll records...
                    </td>
                  </tr>
                ) : filteredPayrolls.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-sm text-black"
                    >
                      No payroll records found.
                    </td>
                  </tr>
                ) : (
                  filteredPayrolls.map(
                    (payroll) => (
                      <tr
                        key={payroll.id}
                        className="hover:bg-gray-50"
                      >
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm font-semibold text-black">
                            {getEmployeeName(
                              payroll.employeeId,
                            )}
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm text-black">
                          {payroll.periodStart?.substring(
                            0,
                            10,
                          )}{" "}
                          -{" "}
                          {payroll.periodEnd?.substring(
                            0,
                            10,
                          )}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-black">
                          {formatCurrency(
                            payroll.grossPay,
                          )}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-black">
                          {formatCurrency(
                            payroll.totalDeductions,
                          )}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-bold text-black">
                          {formatCurrency(
                            payroll.netPay,
                          )}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-center">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                              payroll.status,
                            )}`}
                          >
                            {payroll.status}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center justify-end gap-2">

                            {payroll.status ===
                              "DRAFT" && (
                              <button
                                type="button"
                                onClick={() =>
                                  approvePayroll(
                                    payroll,
                                  )
                                }
                                title="Approve"
                                className="rounded-lg border border-green-300 p-2 text-green-700 transition hover:bg-green-50"
                              >
                                <Check
                                  size={17}
                                />
                              </button>
                            )}

                            {payroll.status ===
                              "APPROVED" && (
                              <button
                                type="button"
                                onClick={() =>
                                  markAsPaid(
                                    payroll,
                                  )
                                }
                                title="Mark as Paid"
                                className="rounded-lg border border-blue-300 p-2 text-blue-700 transition hover:bg-blue-50"
                              >
                                <Check
                                  size={17}
                                />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(
                                  payroll,
                                )
                              }
                              title="Edit"
                              className="rounded-lg border border-gray-300 p-2 text-black transition hover:bg-gray-100"
                            >
                              <Pencil
                                size={17}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deletePayroll(
                                  payroll,
                                )
                              }
                              title="Delete"
                              className="rounded-lg border border-red-300 p-2 text-red-700 transition hover:bg-red-50"
                            >
                              <Trash2
                                size={17}
                              />
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

          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl">

            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">

              <div>
                <h2 className="text-lg font-bold text-black">
                  {editingPayroll
                    ? "Edit Payroll"
                    : "Create Payroll"}
                </h2>

                <p className="mt-1 text-sm text-black">
                  Enter the employee payroll
                  details.
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
              onSubmit={handleSubmit}
              className="space-y-6 p-6"
            >

              <div>
                <h3 className="mb-4 text-sm font-bold text-black">
                  Payroll Period
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-black">
                      Employee
                    </label>

                    <select
                      value={form.employeeId}
                      onChange={(event) =>
                        updateForm(
                          "employeeId",
                          event.target.value,
                        )
                      }
                      disabled={
                        !!editingPayroll
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">
                        Select Employee
                      </option>

                      {employees.map(
                        (employee) => (
                          <option
                            key={employee.id}
                            value={employee.id}
                          >
                            {employee.firstName}{" "}
                            {employee.lastName}
                          </option>
                        ),
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-black">
                      Period Start
                    </label>

                    <input
                      type="date"
                      value={
                        form.periodStart
                      }
                      onChange={(event) =>
                        updateForm(
                          "periodStart",
                          event.target.value,
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-black">
                      Period End
                    </label>

                    <input
                      type="date"
                      value={form.periodEnd}
                      onChange={(event) =>
                        updateForm(
                          "periodEnd",
                          event.target.value,
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-black">
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
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                </div>
              </div>

              <div>
                <h3 className="mb-4 text-sm font-bold text-black">
                  Earnings
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                  <MoneyInput
                    label="Basic Pay"
                    value={form.basicPay}
                    onChange={(value) =>
                      updateForm(
                        "basicPay",
                        value,
                      )
                    }
                    required
                  />

                  <MoneyInput
                    label="Overtime Pay"
                    value={form.overtimePay}
                    onChange={(value) =>
                      updateForm(
                        "overtimePay",
                        value,
                      )
                    }
                  />

                  <MoneyInput
                    label="Holiday Pay"
                    value={form.holidayPay}
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
                    value={form.allowances}
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
                <h3 className="mb-4 text-sm font-bold text-black">
                  Deduction Rates
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                  <RateInput
                    label="SSS Rate (%)"
                    value={form.sssRate}
                    onChange={(value) =>
                      updateForm(
                        "sssRate",
                        value,
                      )
                    }
                  />

                  <RateInput
                    label="PhilHealth Rate (%)"
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
                    label="Pag-IBIG Rate (%)"
                    value={form.pagibigRate}
                    onChange={(value) =>
                      updateForm(
                        "pagibigRate",
                        value,
                      )
                    }
                  />

                  <RateInput
                    label="Withholding Tax Rate (%)"
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

                <p className="mt-3 text-xs text-black">
                  The contribution rates shown
                  here are configurable example
                  defaults. The backend calculates
                  the payroll values.
                </p>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">

                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-100"
                >
                  Cancel
                </button>

                {!editingPayroll && (
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving
                      ? "Creating..."
                      : "Create Payroll"}
                  </button>
                )}

              </div>

            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function MoneyInput({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-black">
        {label}

        {required && (
          <span className="ml-1 text-red-600">
            *
          </span>
        )}
      </label>

      <input
        type="number"
        min="0"
        step="0.01"
        value={value}
        required={required}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
      <label className="mb-2 block text-sm font-medium text-black">
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
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-10 text-sm text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-black">
          %
        </span>
      </div>
    </div>
  );
}
