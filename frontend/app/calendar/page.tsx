"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Gift,
  Plus,
  X,
} from "lucide-react";

import DashboardLayout from "@/components/DashboardLayout";
import { API_URL } from "@/lib/api";

type CalendarEventType = "EVENT" | "HOLIDAY";

type CalendarEvent = {
  id: number;
  title: string;
  description: string | null;
  date: string;
  type: CalendarEventType;
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

export default function CalendarPage() {
  const year = new Date().getFullYear();

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] =
    useState<CalendarEventType>("EVENT");

  const getToken = () => {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem("accessToken");
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);

      const token = getToken();

      const response = await fetch(
        `${API_URL}/calendar/year/${year}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load calendar events",
        );
      }

      const data = await response.json();

      setEvents(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openDate = (date: string) => {
    setSelectedDate(date);
    setTitle("");
    setDescription("");
    setType("EVENT");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDate(null);
    setTitle("");
    setDescription("");
    setType("EVENT");
  };

  const saveEvent = async () => {
    if (!selectedDate || !title.trim()) {
      return;
    }

    // Remember current scroll position
    const scrollY = window.scrollY;

    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/calendar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: title.trim(),
            description:
              description.trim() || null,
            date: selectedDate,
            type,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          "Failed to save calendar item",
        );
      }

      // Refresh calendar data
      await fetchEvents();

      // Close modal
      closeModal();

      // Restore scroll position
      requestAnimationFrame(() => {
        window.scrollTo({
          top: scrollY,
          behavior: "instant",
        });
      });
    } catch (error) {
      console.error(error);

      alert("Failed to save calendar item.");
    }
  };

  const deleteEvent = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this calendar item?",
    );

    if (!confirmed) {
      return;
    }

    // Save current scroll position
    const scrollY = window.scrollY;

    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/calendar/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          "Failed to delete calendar item",
        );
      }

      await fetchEvents();

      // Restore scroll position after rerender
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    } catch (error) {
      console.error(error);

      alert("Failed to delete calendar item.");
    }
  };

  const getDateString = (
    month: number,
    day: number,
  ) => {
    return `${year}-${String(month + 1).padStart(
      2,
      "0",
    )}-${String(day).padStart(2, "0")}`;
  };

  const getEventsForDate = (date: string) => {
    return events.filter(
      (event) => event.date === date,
    );
  };

  const isWeekend = (
    month: number,
    day: number,
  ) => {
    const date = new Date(year, month, day);
    const weekday = date.getDay();

    return weekday === 0 || weekday === 6;
  };

  const today = useMemo(() => {
    const now = new Date();

    if (now.getFullYear() !== year) {
      return null;
    }

    return getDateString(
      now.getMonth(),
      now.getDate(),
    );
  }, [year]);

  const renderMonth = (month: number) => {
    const daysInMonth = new Date(
      year,
      month + 1,
      0,
    ).getDate();

    const firstDay = new Date(
      year,
      month,
      1,
    ).getDay();

    const cells = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(
        <div
          key={`empty-${i}`}
          className="min-h-[75px] bg-gray-50"
        />,
      );
    }

    for (
      let day = 1;
      day <= daysInMonth;
      day++
    ) {
      const dateString = getDateString(
        month,
        day,
      );

      const weekend = isWeekend(
        month,
        day,
      );

      const dayEvents =
        getEventsForDate(dateString);

      const holidayEvents =
        dayEvents.filter(
          (event) =>
            event.type === "HOLIDAY",
        );

      const regularEvents =
        dayEvents.filter(
          (event) =>
            event.type === "EVENT",
        );

      const isToday =
        today === dateString;

      cells.push(
        <div
          key={dateString}
          onClick={() =>
            openDate(dateString)
          }
          className={`group relative min-h-[75px] cursor-pointer border-r border-b p-1.5 transition hover:bg-blue-50 ${
            weekend
              ? "bg-gray-100"
              : "bg-white"
          }`}
        >
          {/* Date + Add Button */}
          <div className="flex items-start justify-between">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                isToday
                  ? "bg-blue-600 text-white"
                  : weekend
                    ? "text-gray-500"
                    : "text-gray-700"
              }`}
            >
              {day}
            </span>

            <button
              type="button"
              className="hidden rounded p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 group-hover:block"
              onClick={(event) => {
                event.stopPropagation();

                openDate(dateString);
              }}
              title="Add event or holiday"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Weekend */}
          {weekend && (
            <div className="mt-1 text-[8px] font-semibold text-gray-400">
              WEEKEND
            </div>
          )}

          {/* Calendar Icons */}
          <div className="mt-1 flex flex-wrap gap-1">
            {/* Holiday Icons */}
            {holidayEvents.map(
              (holiday) => (
                <div
                  key={holiday.id}
                  className="group/holiday relative"
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-yellow-100 text-yellow-700">
                    <Gift size={12} />
                  </div>

                  {/* Holiday Tooltip */}
                  <div className="pointer-events-none absolute bottom-full left-0 z-30 mb-2 hidden w-48 rounded-lg border bg-white p-2 text-left shadow-lg group-hover/holiday:block">
                    <div className="font-semibold text-black">
                      {holiday.title}
                    </div>

                    {holiday.description && (
                      <div className="mt-1 text-xs text-black">
                        {holiday.description}
                      </div>
                    )}

                    <div className="mt-1 text-[10px] font-medium text-yellow-700">
                      HOLIDAY
                    </div>
                  </div>

                  {/* Delete Holiday */}
                  <button
                    type="button"
                    className="absolute -right-1.5 -top-1.5 hidden h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white shadow group-hover/holiday:flex"
                    onClick={() =>
                      deleteEvent(
                        holiday.id,
                      )
                    }
                    title="Delete holiday"
                  >
                    <X size={9} />
                  </button>
                </div>
              ),
            )}

            {/* Event Icons */}
            {regularEvents.map(
              (event) => (
                <div
                  key={event.id}
                  className="group/event relative"
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-red-100 text-red-700">
                    <CalendarDays size={12} />
                  </div>

                  {/* Event Tooltip */}
                  <div className="pointer-events-none absolute bottom-full left-0 z-30 mb-2 hidden w-48 rounded-lg border bg-white p-2 text-left shadow-lg group-hover/event:block">
                    <div className="font-semibold text-black">
                      {event.title}
                    </div>

                    {event.description && (
                      <div className="mt-1 text-xs text-black">
                        {event.description}
                      </div>
                    )}

                    <div className="mt-1 text-[10px] font-medium text-red-700">
                      EVENT
                    </div>
                  </div>

                  {/* Delete Event */}
                  <button
                    type="button"
                    className="absolute -right-1.5 -top-1.5 hidden h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white shadow group-hover/event:flex"
                    onClick={() =>
                      deleteEvent(
                        event.id,
                      )
                    }
                    title="Delete event"
                  >
                    <X size={9} />
                  </button>
                </div>
              ),
            )}
          </div>
        </div>,
      );
    }

    return (
      <div className="relative overflow-visible rounded-lg border bg-white shadow-sm">
        {/* Month Header */}
        <div className="border-b bg-gray-50 px-3 py-2">
          <h2 className="text-sm font-semibold text-gray-800">
            {MONTHS[month]}
          </h2>
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 border-b bg-gray-50">
          {WEEKDAYS.map(
            (weekday) => (
              <div
                key={weekday}
                className="border-r px-0.5 py-1.5 text-center text-[9px] font-semibold text-gray-500 last:border-r-0"
              >
                {weekday}
              </div>
            ),
          )}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {cells}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <CalendarDays
                className="text-blue-600"
                size={26}
              />

              <h1 className="text-2xl font-bold text-gray-800">
                Calendar {year}
              </h1>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Manage events, holidays,
              and office working days.
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-gray-700">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-gray-200 text-gray-600">
                <span className="text-[8px]">
                  W
                </span>
              </span>
              Weekend
            </div>

            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-yellow-100 text-yellow-700">
                <Gift size={12} />
              </span>
              Holiday
            </div>

            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-red-100 text-red-700">
                <CalendarDays size={12} />
              </span>
              Event
            </div>
          </div>
        </div>

        {/* Calendar */}
        {loading ? (
          <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
            Loading calendar...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            {MONTHS.map(
              (_, month) => (
                <div key={month}>
                  {renderMonth(month)}
                </div>
              ),
            )}
          </div>
        )}

        {/* Add Modal */}
        {showModal &&
          selectedDate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                  <div>
                    <h2 className="font-semibold text-black">
                      Add Calendar Item
                    </h2>

                    <p className="text-sm text-black">
                      {selectedDate}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-lg p-2 text-black hover:bg-gray-100"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="space-y-4 p-6">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-black">
                      Type
                    </label>

                    <select
                      value={type}
                      onChange={(e) =>
                        setType(
                          e.target
                            .value as CalendarEventType,
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-blue-500"
                    >
                      <option
                        value="EVENT"
                        className="text-black"
                      >
                        Event
                      </option>

                      <option
                        value="HOLIDAY"
                        className="text-black"
                      >
                        Holiday / No Office Work
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-black">
                      Title
                    </label>

                    <input
                      type="text"
                      value={title}
                      onChange={(e) =>
                        setTitle(
                          e.target.value,
                        )
                      }
                      placeholder="e.g. Team Meeting"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-black">
                      Description
                    </label>

                    <textarea
                      value={description}
                      onChange={(e) =>
                        setDescription(
                          e.target.value,
                        )
                      }
                      placeholder="Optional description"
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-3 border-t px-6 py-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-black hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={saveEvent}
                    disabled={!title.trim()}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
      </div>
    </DashboardLayout>
  );
}
