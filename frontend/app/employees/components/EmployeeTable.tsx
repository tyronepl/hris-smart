"use client";

import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  UsersRound,
} from "lucide-react";

type Employee = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position?: string;
  department?: string;
};

type EmployeeTableProps = {
  employees: Employee[];
  loading: boolean;
  search: string;
  onAdd: () => void;
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (id: number) => void;
};

export default function EmployeeTable({
  employees,
  loading,
  search,
  onAdd,
  onView,
  onEdit,
  onDelete,
}: EmployeeTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* =========================
          TABLE HEADER
      ========================= */}

      <div className="flex items-center gap-3 border-b border-gray-200 p-6">
        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
          <UsersRound size={20} />
        </div>

        <div>
          <h3 className="font-semibold text-gray-900">
            Employee Records
          </h3>

          <p className="text-sm text-gray-500">
            {employees.length} employee
            {employees.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* =========================
          LOADING
      ========================= */}

      {loading ? (
        <div className="p-12 text-center text-gray-500">
          Loading employees...
        </div>
      ) : employees.length === 0 ? (
        /* =========================
           EMPTY STATE
        ========================= */

        <div className="p-12 text-center">
          <UsersRound
            size={42}
            className="mx-auto text-gray-300"
          />

          <h3 className="mt-4 font-semibold text-gray-900">
            {search
              ? "No employees found"
              : "No employees yet"}
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            {search
              ? "Try another search."
              : "Add your first employee to get started."}
          </p>

          {!search && (
            <button
              type="button"
              onClick={onAdd}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus size={17} />
              Add Employee
            </button>
          )}
        </div>
      ) : (
        /* =========================
           TABLE
        ========================= */

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                <th className="px-6 py-4">
                  Employee
                </th>

                <th className="px-6 py-4">
                  Position
                </th>

                <th className="px-6 py-4">
                  Department
                </th>

                <th className="px-6 py-4">
                  Contact
                </th>

                <th className="px-6 py-4 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {employees.map((employee) => (
                <tr
                  key={employee.id}
                  className="hover:bg-gray-50"
                >
                  {/* Employee */}

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                        {employee.firstName?.charAt(0)}
                        {employee.lastName?.charAt(0)}
                      </div>

                      <div>
                        <p className="font-medium text-gray-900">
                          {employee.firstName}{" "}
                          {employee.lastName}
                        </p>

                        <p className="text-sm text-gray-500">
                          {employee.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Position */}

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {employee.position || "—"}
                  </td>

                  {/* Department */}

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {employee.department || "—"}
                  </td>

                  {/* Contact */}

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {employee.phone || "—"}
                  </td>

                  {/* Actions */}

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          onView(employee)
                        }
                        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                        title="View employee"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onEdit(employee)
                        }
                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        title="Edit employee"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onDelete(employee.id)
                        }
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        title="Delete employee"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}