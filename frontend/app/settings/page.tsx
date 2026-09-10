"use client";

import { FormEvent, useEffect, useState } from "react";
import axios from "axios";
import {
  LockKeyhole,
  Mail,
  Save,
  UserRound,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (!user) {
      return;
    }

    try {
      const parsedUser = JSON.parse(user);

      setName(parsedUser.name || "");
      setEmail(parsedUser.email || "");
    } catch {
      localStorage.removeItem("user");
    }
  }, []);

  async function handleProfileSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setProfileMessage("");
    setProfileError("");

    const token = localStorage.getItem("accessToken");

    if (!token) {
      setProfileError("Your session has expired. Please log in again.");
      return;
    }

    if (!name.trim()) {
      setProfileError("Name cannot be empty.");
      return;
    }

    setProfileLoading(true);

    try {
      const response = await axios.patch(
        "http://localhost:3000/auth/profile",
        {
          name: name.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user),
      );

      setName(response.data.user.name);

      setProfileMessage(
        "Your profile has been updated successfully.",
      );
    } catch (error) {
      console.error("Profile update error:", error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setProfileError(
            "Your session has expired. Please log in again.",
          );
        } else {
          const backendMessage =
            error.response?.data?.message;

          setProfileError(
            Array.isArray(backendMessage)
              ? backendMessage.join(", ")
              : backendMessage ||
                  "Unable to update your profile.",
          );
        }
      } else {
        setProfileError(
          "Unable to connect to the server.",
        );
      }
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "New passwords do not match.",
      );
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        "New password must be at least 8 characters.",
      );
      return;
    }

    const token = localStorage.getItem("accessToken");

    if (!token) {
      setPasswordError(
        "Your session has expired. Please log in again.",
      );
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await axios.patch(
        "http://localhost:3000/auth/password",
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      setPasswordMessage(
        response.data.message ||
          "Password changed successfully.",
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Password change error:", error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setPasswordError(
            error.response?.data?.message ||
              "Current password is incorrect.",
          );
        } else {
          const backendMessage =
            error.response?.data?.message;

          setPasswordError(
            Array.isArray(backendMessage)
              ? backendMessage.join(", ")
              : backendMessage ||
                  "Unable to change your password.",
          );
        }
      } else {
        setPasswordError(
          "Unable to connect to the server.",
        );
      }
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <p className="text-sm font-medium text-blue-600">
          Account
        </p>

        <h2 className="mt-1 text-3xl font-bold text-gray-900">
          Account Settings
        </h2>

        <p className="mt-2 text-gray-500">
          Manage your HR administrator account.
        </p>
      </div>

      <div className="grid max-w-4xl gap-6">
        {/* Profile */}
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <UserRound size={20} />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">
                  Profile Information
                </h3>

                <p className="text-sm text-gray-500">
                  Update your HR account information.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleProfileSubmit}
            className="space-y-5 p-6"
          >
            {profileMessage && (
              <div className="rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
                {profileMessage}
              </div>
            )}

            {profileError && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {profileError}
              </div>
            )}

            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700"
              >
                <Mail size={16} />
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                disabled
                className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500"
              />

              <p className="mt-1 text-xs text-gray-400">
                Email cannot be changed from this page.
              </p>
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} />

              {profileLoading
                ? "Saving..."
                : "Save Changes"}
            </button>
          </form>
        </section>

        {/* Password */}
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <LockKeyhole size={20} />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">
                  Change Password
                </h3>

                <p className="text-sm text-gray-500">
                  Update your account password.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handlePasswordSubmit}
            className="space-y-5 p-6"
          >
            {passwordMessage && (
              <div className="rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
                {passwordMessage}
              </div>
            )}

            {passwordError && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {passwordError}
              </div>
            )}

            <div>
              <label
                htmlFor="currentPassword"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Current Password
              </label>

              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(event) =>
                  setCurrentPassword(event.target.value)
                }
                placeholder="Enter current password"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                New Password
              </label>

              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(event.target.value)
                }
                placeholder="Minimum 8 characters"
                minLength={8}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Confirm New Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Re-enter new password"
                minLength={8}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LockKeyhole size={18} />

              {passwordLoading
                ? "Changing..."
                : "Change Password"}
            </button>
          </form>
        </section>
      </div>
    </DashboardLayout>
  );
}
