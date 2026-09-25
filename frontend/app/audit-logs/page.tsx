"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Eye,
  RefreshCw,
  Search,
  X,
  FileText,
} from "lucide-react";

import axios from "axios";

import DashboardLayout from "@/components/DashboardLayout";

type AuditLog = {
  id: number;

  userId?: number | null;

  userName?: string | null;

  action?: string | null;

  module?: string | null;

  // Employee name returned by the backend when available.
  employeeName?: string | null;

  description?: string | null;

  oldData?: string | null;

  newData?: string | null;

  ipAddress?: string | null;

  userAgent?: string | null;

  createdAt: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000";

const ACTIONS = [
  "ALL",
  "CREATE",
  "UPDATE",
  "DELETE",
  "APPROVE",
  "REJECT",
  "CANCEL",
  "PAID",
  "LOGIN",
  "LOGOUT",
  "REGISTER",
  "PROFILE_UPDATE",
  "PASSWORD_CHANGE",
  "RESUME_UPLOAD",
];

const MODULES = [
  "ALL",
  "EMPLOYEE",
  "ATTENDANCE",
  "LEAVE",
  "ABSENCE",
  "OVERTIME",
  "PAYROLL",
  "CALENDAR",
  "AUTH",
  "SYSTEM",
];

function formatDate(
  value: string,
) {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleString(
    "en-PH",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

function formatJson(
  value?: string | null,
) {
  if (!value) {
    return null;
  }

  try {
    return JSON.stringify(
      JSON.parse(value),
      null,
      2,
    );
  } catch {
    return value;
  }
}

function getActionClass(
  action?: string | null,
) {
  switch (
    action?.toUpperCase()
  ) {
    case "CREATE":
      return "bg-green-100 text-green-800";

    case "UPDATE":
      return "bg-blue-100 text-blue-800";

    case "DELETE":
      return "bg-red-100 text-red-800";

    case "APPROVE":
      return "bg-emerald-100 text-emerald-800";

    case "REJECT":
      return "bg-orange-100 text-orange-800";

    case "CANCEL":
      return "bg-orange-100 text-orange-800";

    case "PAID":
      return "bg-green-100 text-green-800";

    case "LOGIN":
      return "bg-purple-100 text-purple-800";

    case "LOGOUT":
      return "bg-gray-100 text-gray-800";

    case "REGISTER":
      return "bg-indigo-100 text-indigo-800";

    case "PROFILE_UPDATE":
      return "bg-blue-100 text-blue-800";

    case "PASSWORD_CHANGE":
      return "bg-yellow-100 text-yellow-800";

    case "RESUME_UPLOAD":
      return "bg-cyan-100 text-cyan-800";

    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getEmployeeName(
  log: AuditLog,
) {
  // Preferred: backend-provided employee name.
  if (
    log.employeeName &&
    log.employeeName.trim()
  ) {
    return log.employeeName;
  }

  // Fallback: try to get the employee name
  // from newData.
  if (log.newData) {
    try {
      const data =
        JSON.parse(log.newData);

      if (
        data?.firstName ||
        data?.lastName
      ) {
        return [
          data.firstName,
          data.lastName,
        ]
          .filter(Boolean)
          .join(" ");
      }

      if (
        data?.employee?.firstName ||
        data?.employee?.lastName
      ) {
        return [
          data.employee.firstName,
          data.employee.lastName,
        ]
          .filter(Boolean)
          .join(" ");
      }
    } catch {
      // Ignore invalid JSON.
    }
  }

  return "-";
}

export default function AuditLogsPage() {
  const [logs, setLogs] =
    useState<AuditLog[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [actionFilter, setActionFilter] =
    useState("ALL");

  const [moduleFilter, setModuleFilter] =
    useState("ALL");

  const [dateFrom, setDateFrom] =
    useState("");

  const [dateTo, setDateTo] =
    useState("");

  const [selectedLog, setSelectedLog] =
    useState<AuditLog | null>(null);

  const [error, setError] =
    useState("");

  async function loadAuditLogs() {
    const token =
      localStorage.getItem(
        "accessToken",
      );

    if (!token) {
      setError(
        "Your session has expired. Please log in again.",
      );

      setLoading(false);

      return;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await axios.get(
          `${API_URL}/audit-logs`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

      setLogs(
        Array.isArray(
          response.data,
        )
          ? response.data
          : [],
      );
    } catch (err) {
      console.error(
        "Load audit logs error:",
        err,
      );

      if (
        axios.isAxiosError(err)
      ) {
        setError(
          err.response?.data?.message ||
            "Unable to load audit logs.",
        );
      } else {
        setError(
          "Unable to connect to the server.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const filteredLogs =
    useMemo(() => {
      const searchTerm =
        search
          .toLowerCase()
          .trim();

      return logs.filter(
        (log) => {
          const employeeName =
            getEmployeeName(log);

          const matchesSearch =
            !searchTerm ||
            log.userName
              ?.toLowerCase()
              .includes(
                searchTerm,
              ) ||
            employeeName
              .toLowerCase()
              .includes(
                searchTerm,
              ) ||
            log.action
              ?.toLowerCase()
              .includes(
                searchTerm,
              ) ||
            log.module
              ?.toLowerCase()
              .includes(
                searchTerm,
              ) ||
            log.description
              ?.toLowerCase()
              .includes(
                searchTerm,
              );

          const matchesAction =
            actionFilter ===
              "ALL" ||
            log.action?.toUpperCase() ===
              actionFilter;

          const matchesModule =
            moduleFilter ===
              "ALL" ||
            log.module?.toUpperCase() ===
              moduleFilter;

          const logDate =
            log.createdAt
              ? new Date(
                  log.createdAt,
                )
              : null;

          const matchesDateFrom =
            !dateFrom ||
            !logDate ||
            logDate >=
              new Date(
                `${dateFrom}T00:00:00`,
              );

          const matchesDateTo =
            !dateTo ||
            !logDate ||
            logDate <=
              new Date(
                `${dateTo}T23:59:59`,
              );

          return (
            matchesSearch &&
            matchesAction &&
            matchesModule &&
            matchesDateFrom &&
            matchesDateTo
          );
        },
      );
    }, [
      logs,
      search,
      actionFilter,
      moduleFilter,
      dateFrom,
      dateTo,
    ]);

  return (
    <DashboardLayout>
      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">
            Audit Logs
          </h1>

          <p className="mt-1 text-sm text-black">
            Monitor system activity and changes.
          </p>
        </div>

        <button
          type="button"
          onClick={loadAuditLogs}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-black shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>
      </div>

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* =========================
          FILTERS
      ========================= */}

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative mb-4">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search by user, employee, action, module, or description..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-black outline-none placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-black">
              Action
            </label>

            <select
              value={actionFilter}
              onChange={(event) =>
                setActionFilter(
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {ACTIONS.map(
                (action) => (
                  <option
                    key={action}
                    value={action}
                  >
                    {action === "ALL"
                      ? "All Actions"
                      : action}
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-black">
              Module
            </label>

            <select
              value={moduleFilter}
              onChange={(event) =>
                setModuleFilter(
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {MODULES.map(
                (module) => (
                  <option
                    key={module}
                    value={module}
                  >
                    {module === "ALL"
                      ? "All Modules"
                      : module}
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-black">
              Date From
            </label>

            <input
              type="date"
              value={dateFrom}
              onChange={(event) =>
                setDateFrom(
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-black">
              Date To
            </label>

            <input
              type="date"
              value={dateTo}
              onChange={(event) =>
                setDateTo(
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {(search ||
          actionFilter !== "ALL" ||
          moduleFilter !== "ALL" ||
          dateFrom ||
          dateTo) && (
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActionFilter("ALL");
                setModuleFilter("ALL");
                setDateFrom("");
                setDateTo("");
              }}
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              <X size={16} />
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* =========================
          TABLE
      ========================= */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-black">
              Activity History
            </h2>

            <p className="mt-1 text-sm text-black">
              {filteredLogs.length}{" "}
              record
              {filteredLogs.length !==
              1
                ? "s"
                : ""}{" "}
              found
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-sm text-black">
              Loading audit logs...
            </div>
          </div>
        ) : filteredLogs.length ===
          0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <FileText
              size={42}
              className="mb-3 text-gray-400"
            />

            <h3 className="text-lg font-semibold text-black">
              No audit logs found
            </h3>

            <p className="mt-1 text-sm text-black">
              No activity matches your
              current filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black">
                    User
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black">
                    Employee
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black">
                    Action
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black">
                    Module
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black">
                    Description
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black">
                    Date
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-black">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredLogs.map(
                  (log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium text-black">
                          {log.userName ||
                            "System"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium text-black">
                          {getEmployeeName(
                            log,
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getActionClass(
                            log.action,
                          )}`}
                        >
                          {log.action ||
                            "-"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-black">
                        {log.module ||
                          "-"}
                      </td>

                      <td className="max-w-[300px] px-5 py-4 text-sm text-black">
                        <div className="truncate">
                          {log.description ||
                            "-"}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-black">
                        {formatDate(
                          log.createdAt,
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedLog(
                              log,
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-black hover:bg-gray-50"
                        >
                          <Eye
                            size={16}
                          />

                          View
                        </button>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================
          DETAILS MODAL
      ========================= */}

      {selectedLog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-black">
                  Audit Log Details
                </h2>

                <p className="mt-1 text-sm text-black">
                  Activity Details
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedLog(null)
                }
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-black"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-black">
                    User
                  </p>

                  <p className="mt-1 text-sm text-black">
                    {selectedLog.userName ||
                      "System"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-black">
                    Employee
                  </p>

                  <p className="mt-1 text-sm text-black">
                    {getEmployeeName(
                      selectedLog,
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-black">
                    Action
                  </p>

                  <span
                    className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getActionClass(
                      selectedLog.action,
                    )}`}
                  >
                    {selectedLog.action ||
                      "-"}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-medium text-black">
                    Module
                  </p>

                  <p className="mt-1 text-sm text-black">
                    {selectedLog.module ||
                      "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-black">
                    IP Address
                  </p>

                  <p className="mt-1 text-sm text-black">
                    {selectedLog.ipAddress ||
                      "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-black">
                    Created At
                  </p>

                  <p className="mt-1 text-sm text-black">
                    {formatDate(
                      selectedLog.createdAt,
                    )}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-black">
                  Description
                </p>

                <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-black">
                  {selectedLog.description ||
                    "No description available."}
                </div>
              </div>

              {selectedLog.oldData && (
                <div>
                  <p className="mb-2 text-sm font-medium text-black">
                    Previous Data
                  </p>

                  <pre className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs text-black">
                    {formatJson(
                      selectedLog.oldData,
                    )}
                  </pre>
                </div>
              )}

              {selectedLog.newData && (
                <div>
                  <p className="mb-2 text-sm font-medium text-black">
                    New Data
                  </p>

                  <pre className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs text-black">
                    {formatJson(
                      selectedLog.newData,
                    )}
                  </pre>
                </div>
              )}

              {selectedLog.userAgent && (
                <div>
                  <p className="text-sm font-medium text-black">
                    User Agent
                  </p>

                  <p className="mt-1 break-all text-xs text-black">
                    {selectedLog.userAgent}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                onClick={() =>
                  setSelectedLog(null)
                }
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}