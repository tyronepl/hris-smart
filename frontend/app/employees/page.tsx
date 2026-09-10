"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  CheckCircle,
  Plus,
  Search,
  XCircle,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import EmployeeViewModal from "./components/EmployeeViewModal";
import EmployeeFormModal from "./components/EmployeeFormModal";
import EmployeeTable from "./components/EmployeeTable";

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

const emptyForm: EmployeeForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  position: "",
  department: "",
  address: "",
  skills: "",
  experience: "",
  education: "",
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // NOTIFICATIONS
  // =========================

  const [success, setSuccess] = useState("");

  function showSuccess(message: string) {
    setSuccess(message);

    setTimeout(() => {
      setSuccess("");
    }, 4000);
  }

  function showError(message: string) {
    setError(message);

    setTimeout(() => {
      setError("");
    }, 5000);
  }

  // =========================
  // CREATE / EDIT MODAL
  // =========================

  const [modalOpen, setModalOpen] = useState(false);

  const [editingEmployee, setEditingEmployee] =
    useState<Employee | null>(null);

  // =========================
  // VIEW MODAL
  // =========================

  const [viewingEmployee, setViewingEmployee] =
    useState<Employee | null>(null);

  // =========================
  // FORM
  // =========================

  const [form, setForm] =
    useState<EmployeeForm>(emptyForm);

  const [resumeFile, setResumeFile] =
    useState<File | null>(null);

  const [saving, setSaving] =
    useState(false);

  const [parsingResume, setParsingResume] =
    useState(false);

  // =========================
  // LOAD EMPLOYEES
  // =========================

  async function loadEmployees() {
    const token =
      localStorage.getItem("accessToken");

    if (!token) {
      showError(
        "Your session has expired. Please log in again.",
      );

      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        "http://localhost:3000/employees",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setEmployees(
        Array.isArray(response.data)
          ? response.data
          : response.data.employees || [],
      );
    } catch (err) {
      console.error(
        "Load employees error:",
        err,
      );

      if (axios.isAxiosError(err)) {
        showError(
          err.response?.data?.message ||
            "Unable to load employees.",
        );
      } else {
        showError(
          "Unable to connect to the server.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  // =========================
  // CREATE MODAL
  // =========================

  function openCreateModal() {
    setEditingEmployee(null);
    setForm({ ...emptyForm });
    setResumeFile(null);
    setError("");
    setParsingResume(false);
    setModalOpen(true);
  }

  // =========================
  // EDIT MODAL
  // =========================

  function openEditModal(
    employee: Employee,
  ) {
    setEditingEmployee(employee);

    setForm({
      firstName:
        employee.firstName || "",
      lastName:
        employee.lastName || "",
      email:
        employee.email || "",
      phone:
        employee.phone || "",
      position:
        employee.position || "",
      department:
        employee.department || "",
      address:
        employee.address || "",
      skills:
        employee.skills || "",
      experience:
        employee.experience || "",
      education:
        employee.education || "",
    });

    setResumeFile(null);
    setError("");
    setParsingResume(false);
    setModalOpen(true);
  }

  // =========================
  // CLOSE MODAL
  // =========================

  function closeModal() {
    if (parsingResume) {
      return;
    }

    setModalOpen(false);
    setEditingEmployee(null);
    setForm({ ...emptyForm });
    setResumeFile(null);
    setError("");
    setParsingResume(false);
  }

  // =========================
  // FORM CHANGE
  // =========================

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } =
      event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  // =========================
  // RESUME CHANGE + AI PARSING
  // =========================

  async function handleResumeChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0] || null;

    if (!file) {
      setResumeFile(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (
      !allowedTypes.includes(file.type)
    ) {
      showError(
        "Please select a PDF, DOC, or DOCX resume.",
      );

      event.target.value = "";
      setResumeFile(null);

      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      showError(
        "Resume file must be 10 MB or smaller.",
      );

      event.target.value = "";
      setResumeFile(null);

      return;
    }

    const token =
      localStorage.getItem(
        "accessToken",
      );

    if (!token) {
      showError(
        "Your session has expired. Please log in again.",
      );

      event.target.value = "";
      setResumeFile(null);

      return;
    }

    setResumeFile(file);
    setError("");
    setParsingResume(true);

    try {
      const formData =
        new FormData();

      formData.append(
        "resume",
        file,
      );

      const response =
        await axios.post(
          "http://localhost:3000/employees/resume/parse",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

      const data =
        response.data;

      setForm((current) => ({
        ...current,

        firstName:
          data.firstName || "",

        lastName:
          data.lastName || "",

        email:
          data.email || "",

        phone:
          data.phone || "",

        position:
          data.position || "",

        department:
          data.department || "",

        address:
          data.address || "",

        skills:
          data.skills || "",

        experience:
          data.experience || "",

        education:
          data.education || "",
      }));

      setError("");

      showSuccess(
        "Resume analyzed successfully.",
      );
    } catch (err) {
      console.error(
        "Resume AI parsing error:",
        err,
      );

      if (axios.isAxiosError(err)) {
        showError(
          err.response?.data?.message ||
            "Unable to process the resume with AI.",
        );
      } else {
        showError(
          "Unable to process the resume.",
        );
      }
    } finally {
      setParsingResume(false);
    }
  }

  // =========================
  // UPLOAD RESUME
  // =========================

  async function uploadResume(
    employeeId: number,
    token: string,
  ) {
    if (!resumeFile) {
      return null;
    }

    const formData =
      new FormData();

    formData.append(
      "resume",
      resumeFile,
    );

    const response =
      await axios.post(
        `http://localhost:3000/employees/${employeeId}/resume`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

    return response.data;
  }

  // =========================
  // CREATE / UPDATE
  // =========================

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const token =
      localStorage.getItem(
        "accessToken",
      );

    if (!token) {
      showError(
        "Your session has expired.",
      );

      return;
    }

    if (parsingResume) {
      showError(
        "Please wait for the resume analysis to finish.",
      );

      return;
    }

    setSaving(true);
    setError("");

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      let employee: Employee;

      // =========================
      // UPDATE
      // =========================

      if (editingEmployee) {
        const response =
          await axios.patch(
            `http://localhost:3000/employees/${editingEmployee.id}`,
            form,
            config,
          );

        employee =
          response.data;

        if (resumeFile) {
          const resumeResponse =
            await uploadResume(
              employee.id,
              token,
            );

          if (resumeResponse) {
            employee = {
              ...employee,
              ...resumeResponse,
            };
          }
        }

        setEmployees(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                employee.id
                  ? employee
                  : item,
            ),
        );

        closeModal();

        showSuccess(
          "Employee updated successfully.",
        );
      }

      // =========================
      // CREATE
      // =========================

      else {
        const response =
          await axios.post(
            "http://localhost:3000/employees",
            form,
            config,
          );

        employee =
          response.data;

        if (resumeFile) {
          const resumeResponse =
            await uploadResume(
              employee.id,
              token,
            );

          if (resumeResponse) {
            employee = {
              ...employee,
              ...resumeResponse,
            };
          }
        }

        setEmployees(
          (current) => [
            employee,
            ...current,
          ],
        );

        closeModal();

        showSuccess(
          "Employee created successfully.",
        );
      }
    } catch (err) {
      console.error(
        "Save employee error:",
        err,
      );

      if (axios.isAxiosError(err)) {
        showError(
          err.response?.data?.message ||
            "Unable to save employee.",
        );
      } else {
        showError(
          "Unable to connect to the server.",
        );
      }
    } finally {
      setSaving(false);
    }
  }

  // =========================
  // DELETE
  // =========================

  async function handleDelete(
    id: number,
  ) {
    if (
      !window.confirm(
        "Are you sure you want to delete this employee?",
      )
    ) {
      return;
    }

    const token =
      localStorage.getItem(
        "accessToken",
      );

    if (!token) {
      showError(
        "Your session has expired.",
      );

      return;
    }

    try {
      await axios.delete(
        `http://localhost:3000/employees/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setEmployees(
        (current) =>
          current.filter(
            (employee) =>
              employee.id !== id,
          ),
      );

      showSuccess(
        "Employee deleted successfully.",
      );
    } catch (err) {
      console.error(
        "Delete employee error:",
        err,
      );

      if (axios.isAxiosError(err)) {
        showError(
          err.response?.data?.message ||
            "Unable to delete employee.",
        );
      } else {
        showError(
          "Unable to delete employee.",
        );
      }
    }
  }

  // =========================
  // SEARCH
  // =========================

  const filteredEmployees =
    employees.filter(
      (employee) => {
        const value =
          search.toLowerCase();

        return (
          `${employee.firstName} ${employee.lastName}`
            .toLowerCase()
            .includes(value) ||
          employee.email
            .toLowerCase()
            .includes(value) ||
          employee.position
            ?.toLowerCase()
            .includes(value) ||
          employee.department
            ?.toLowerCase()
            .includes(value)
        );
      },
    );

  return (
    <DashboardLayout>
      {/* =========================
          NOTIFICATIONS
      ========================= */}

      {(success || error) && (
        <div className="fixed right-6 top-6 z-[100] w-full max-w-sm">
          {success && (
            <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-white p-4 shadow-lg">
              <CheckCircle
                size={22}
                className="mt-0.5 shrink-0 text-green-500"
              />

              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  Success
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  {success}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSuccess("")
                }
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={18} />
              </button>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-white p-4 shadow-lg">
              <XCircle
                size={22}
                className="mt-0.5 shrink-0 text-red-500"
              />

              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  Error
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={18} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">
            HR Management
          </p>

          <h2 className="mt-1 text-3xl font-bold text-gray-900">
            Employees
          </h2>

          <p className="mt-2 text-gray-500">
            Manage employee records and resumes.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      {/* =========================
          SEARCH
      ========================= */}

      <div className="mb-4 flex justify-end">
        <div className="relative w-full sm:w-80">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search employees..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-black outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* =========================
          EMPLOYEE TABLE
      ========================= */}

      <EmployeeTable
        employees={filteredEmployees}
        loading={loading}
        search={search}
        onAdd={openCreateModal}
        onView={setViewingEmployee}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      {/* =========================
          VIEW EMPLOYEE MODAL
      ========================= */}

      <EmployeeViewModal
        employee={viewingEmployee}
        onClose={() =>
          setViewingEmployee(null)
        }
      />

      {/* =========================
          CREATE / EDIT MODAL
      ========================= */}

      <EmployeeFormModal
        open={modalOpen}
        employee={editingEmployee}
        form={form}
        resumeFile={resumeFile}
        saving={saving}
        parsingResume={parsingResume}
        error={error}
        onClose={closeModal}
        onChange={handleChange}
        onResumeChange={
          handleResumeChange
        }
        onSubmit={handleSubmit}
      />
    </DashboardLayout>
  );
}
