"use client";

import {
  FileText,
  Upload,
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

type EmployeeForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  address: string;
  skills: string;
  experience: string;
  education: string;
};

type EmployeeFormModalProps = {
  open: boolean;
  employee: Employee | null;
  form: EmployeeForm;
  resumeFile: File | null;
  saving: boolean;
  parsingResume: boolean;
  error: string;
  onClose: () => void;
  onChange: (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >,
  ) => void;
  onResumeChange: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  onSubmit: (
    event: React.FormEvent<HTMLFormElement>,
  ) => void;
};

export default function EmployeeFormModal({
  open,
  employee,
  form,
  resumeFile,
  saving,
  parsingResume,
  error,
  onClose,
  onChange,
  onResumeChange,
  onSubmit,
}: EmployeeFormModalProps) {
  if (!open) {
    return null;
  }

  const isEditing = !!employee;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-5">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {isEditing
                ? "Update Employee"
                : "Add Employee"}
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {isEditing
                ? "Update employee information"
                : "Add a new employee to the system"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving || parsingResume}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={22} />
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="p-6"
        >
          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex items-start gap-3">
              <FileText
                size={22}
                className="mt-0.5 shrink-0 text-blue-600"
              />

              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-900">
                  AI Resume Import
                </h4>

                <p className="mt-1 text-sm text-blue-700">
                  Upload a resume and the system will
                  automatically extract employee information
                  using AI.
                </p>

                <label className="mt-4 flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-blue-300 bg-white px-4 py-4 transition hover:border-blue-500 hover:bg-blue-50">
                  <div className="text-center">
                    <Upload
                      size={22}
                      className="mx-auto text-blue-600"
                    />

                    <p className="mt-2 text-sm font-medium text-gray-700">
                      {resumeFile
                        ? resumeFile.name
                        : "Click to upload resume"}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      PDF, DOC, or DOCX — maximum 10 MB
                    </p>
                  </div>

                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={onResumeChange}
                    disabled={saving || parsingResume}
                    className="hidden"
                  />
                </label>

                {parsingResume && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-blue-700">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
                    Analyzing resume with AI...
                  </div>
                )}

                {resumeFile &&
                  !parsingResume && (
                    <p className="mt-3 text-xs text-green-700">
                      Resume processed. Please review the
                      extracted information before saving.
                    </p>
                  )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="mb-4 text-sm font-semibold text-gray-900">
                Personal Information
              </h4>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    First Name
                  </label>

                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={onChange}
                    required
                    disabled={saving || parsingResume}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Last Name
                  </label>

                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={onChange}
                    required
                    disabled={saving || parsingResume}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    required
                    disabled={saving || parsingResume}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Phone
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={onChange}
                    disabled={saving || parsingResume}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-semibold text-gray-900">
                Employment Information
              </h4>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Position
                  </label>

                  <input
                    type="text"
                    name="position"
                    value={form.position}
                    onChange={onChange}
                    disabled={saving || parsingResume}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Department
                  </label>

                  <input
                    type="text"
                    name="department"
                    value={form.department}
                    onChange={onChange}
                    disabled={saving || parsingResume}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-semibold text-gray-900">
                Additional Information
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Address
                  </label>

                  <textarea
                    name="address"
                    value={form.address}
                    onChange={onChange}
                    rows={3}
                    disabled={saving || parsingResume}
                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Skills
                  </label>

                  <textarea
                    name="skills"
                    value={form.skills}
                    onChange={onChange}
                    rows={3}
                    disabled={saving || parsingResume}
                    placeholder="e.g. PHP, Laravel, JavaScript, React"
                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Experience
                  </label>

                  <textarea
                    name="experience"
                    value={form.experience}
                    onChange={onChange}
                    rows={4}
                    disabled={saving || parsingResume}
                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Education
                  </label>

                  <textarea
                    name="education"
                    value={form.education}
                    onChange={onChange}
                    rows={3}
                    disabled={saving || parsingResume}
                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-7 flex justify-end gap-3 border-t border-gray-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving || parsingResume}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || parsingResume}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? isEditing
                  ? "Updating..."
                  : "Saving..."
                : isEditing
                  ? "Update Employee"
                  : "Add Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}