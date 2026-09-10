"use client";

import {
  FileText,
  X,
} from "lucide-react";

type Employee = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position?: string;
  department?: string;
  address?: string;
  skills?: string;
  experience?: string;
  education?: string;
  resumeOriginalName?: string;
};

type EmployeeViewModalProps = {
  employee: Employee | null;
  onClose: () => void;
};

export default function EmployeeViewModal({
  employee,
  onClose,
}: EmployeeViewModalProps) {
  // Do not render anything when no employee is selected.
  if (employee === null) {
    return null;
  }

  const firstInitial =
    employee.firstName?.charAt(0) || "";

  const lastInitial =
    employee.lastName?.charAt(0) || "";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* =========================
            HEADER
        ========================= */}

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-5">

          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Employee Details
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              View employee information
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={22} />
          </button>

        </div>

        {/* =========================
            CONTENT
        ========================= */}

        <div className="p-6">

          {/* =========================
              EMPLOYEE HEADER
          ========================= */}

          <div className="mb-7 flex items-center gap-4">

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">
              {firstInitial}
              {lastInitial}
            </div>

            <div>

              <h4 className="text-2xl font-bold text-gray-900">
                {employee.firstName}{" "}
                {employee.lastName}
              </h4>

              <p className="mt-1 text-sm text-gray-500">
                {employee.position ||
                  "No position"}
              </p>

            </div>

          </div>

          {/* =========================
              EMPLOYEE INFORMATION
          ========================= */}

          <div className="overflow-hidden rounded-xl border border-gray-200">

            {/* EMAIL */}

            <div className="grid grid-cols-3 border-b border-gray-200">

              <div className="bg-gray-50 px-5 py-4 text-sm font-semibold text-gray-600">
                Email
              </div>

              <div className="col-span-2 px-5 py-4 text-sm text-black">
                {employee.email || "—"}
              </div>

            </div>

            {/* PHONE */}

            <div className="grid grid-cols-3 border-b border-gray-200">

              <div className="bg-gray-50 px-5 py-4 text-sm font-semibold text-gray-600">
                Phone
              </div>

              <div className="col-span-2 px-5 py-4 text-sm text-black">
                {employee.phone || "—"}
              </div>

            </div>

            {/* POSITION */}

            <div className="grid grid-cols-3 border-b border-gray-200">

              <div className="bg-gray-50 px-5 py-4 text-sm font-semibold text-gray-600">
                Position
              </div>

              <div className="col-span-2 px-5 py-4 text-sm text-black">
                {employee.position || "—"}
              </div>

            </div>

            {/* DEPARTMENT */}

            <div className="grid grid-cols-3 border-b border-gray-200">

              <div className="bg-gray-50 px-5 py-4 text-sm font-semibold text-gray-600">
                Department
              </div>

              <div className="col-span-2 px-5 py-4 text-sm text-black">
                {employee.department || "—"}
              </div>

            </div>

            {/* ADDRESS */}

            <div className="grid grid-cols-3 border-b border-gray-200">

              <div className="bg-gray-50 px-5 py-4 text-sm font-semibold text-gray-600">
                Address
              </div>

              <div className="col-span-2 whitespace-pre-wrap px-5 py-4 text-sm text-black">
                {employee.address || "—"}
              </div>

            </div>

            {/* SKILLS */}

            <div className="grid grid-cols-3 border-b border-gray-200">

              <div className="bg-gray-50 px-5 py-4 text-sm font-semibold text-gray-600">
                Skills
              </div>

              <div className="col-span-2 whitespace-pre-wrap px-5 py-4 text-sm text-black">
                {employee.skills || "—"}
              </div>

            </div>

            {/* EXPERIENCE */}

            <div className="grid grid-cols-3 border-b border-gray-200">

              <div className="bg-gray-50 px-5 py-4 text-sm font-semibold text-gray-600">
                Experience
              </div>

              <div className="col-span-2 whitespace-pre-wrap px-5 py-4 text-sm text-black">
                {employee.experience || "—"}
              </div>

            </div>

            {/* EDUCATION */}

            <div className="grid grid-cols-3 border-b border-gray-200">

              <div className="bg-gray-50 px-5 py-4 text-sm font-semibold text-gray-600">
                Education
              </div>

              <div className="col-span-2 whitespace-pre-wrap px-5 py-4 text-sm text-black">
                {employee.education || "—"}
              </div>

            </div>

            {/* RESUME */}

            <div className="grid grid-cols-3">

              <div className="bg-gray-50 px-5 py-4 text-sm font-semibold text-gray-600">
                Resume
              </div>

              <div className="col-span-2 flex items-center gap-2 px-5 py-4 text-sm text-black">

                <FileText
                  size={18}
                  className="text-blue-600"
                />

                {employee.resumeOriginalName ||
                  "No resume uploaded"}

              </div>

            </div>

          </div>

          {/* =========================
              FOOTER
          ========================= */}

          <div className="mt-6 flex justify-end border-t border-gray-200 pt-5">

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Close
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}
