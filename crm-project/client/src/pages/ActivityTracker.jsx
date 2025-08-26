import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SearchBar from '../components/SearchBar';

export default function ActivityTracker() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [newActivity, setNewActivity] = useState({
    type: "Meeting",
    title: "",
    notes: "",
    outcome: "",
  });
  const [newReminder, setNewReminder] = useState({ task: "", due: "" });
  const [search, setSearch] = useState("");

  // Fetch activities and reminders from backend
  useEffect(() => {
    fetchActivities();
    fetchReminders();
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await axios.get("/api/activities");
      setActivities(res.data);
    } catch (err) {
      setActivities([]);
      console.error("Failed to fetch activities", err);
    }
  };

  const fetchReminders = async () => {
    try {
      const res = await axios.get("/api/reminders");
      setReminders(res.data);
    } catch (err) {
      setReminders([]);
      console.error("Failed to fetch reminders", err);
    }
  };

  // Add activity
  const handleAddActivity = async () => {
    if (!newActivity.title || !newActivity.notes) return;
    try {
      await axios.post("/api/activities", newActivity);
      fetchActivities();
      setNewActivity({ type: "Meeting", title: "", notes: "", outcome: "" });
    } catch (err) {
      console.error("Failed to add activity", err);
    }
  };

  // Add reminder
  const handleAddReminder = async () => {
    if (!newReminder.task || !newReminder.due) return;
    try {
      await axios.post("/api/reminders", newReminder);
      fetchReminders();
      setNewReminder({ task: "", due: "" });
    } catch (err) {
      console.error("Failed to add reminder", err);
    }
  };

  // Mark reminder done
  const toggleReminder = async (id, done) => {
    try {
      await axios.put(`/api/reminders/${id}`, { done: !done });
      fetchReminders();
    } catch (err) {
      console.error("Failed to update reminder", err);
    }
  };

  // Delete reminder
  const deleteReminder = async (id) => {
    try {
      await axios.delete(`/api/reminders/${id}`);
      fetchReminders();
    } catch (err) {
      console.error("Failed to delete reminder", err);
    }
  };

  // Filter activities and reminders by search
  const filteredActivities = activities.filter(a =>
    a && (
      (a.title && a.title.toLowerCase().includes(search.toLowerCase())) ||
      (a.notes && a.notes.toLowerCase().includes(search.toLowerCase())) ||
      (a.type && a.type.toLowerCase().includes(search.toLowerCase()))
    )
  );
  const filteredReminders = reminders.filter(r =>
    r && (
      (r.task && r.task.toLowerCase().includes(search.toLowerCase())) ||
      (r.due && r.due.toLowerCase().includes(search.toLowerCase()))
    )
  );

  return (
  <div className="min-h-screen bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460] p-8 text-white">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#00ADB5] flex items-center">
            📝 Activity Tracker & CRM Log
          </h1>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Add Activity */}
          <section className="mb-10 glass-card">
            <h2 className="text-xl font-bold text-[#00ADB5] mb-4">Log Meeting / Activity</h2>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <select
                className="rounded px-3 py-2 border border-[#00ADB5] bg-[#16213E] text-white"
                value={newActivity.type}
                onChange={e => setNewActivity(a => ({ ...a, type: e.target.value }))}
              >
                <option>Meeting</option>
                <option>Call</option>
                <option>Email</option>
                <option>Task</option>
                <option>Other</option>
              </select>
              <input
                type="text"
                placeholder="Title"
                className="rounded px-3 py-2 border border-[#00ADB5] bg-[#16213E] text-white flex-1 placeholder-[#B8C1EC] focus:outline-none"
                value={newActivity.title}
                onChange={e => setNewActivity(a => ({ ...a, title: e.target.value }))}
              />
            </div>
            <textarea
              placeholder="Discussion points / notes"
              className="rounded px-3 py-2 border border-[#00ADB5] bg-[#16213E] text-white w-full mb-3 placeholder-[#B8C1EC] focus:outline-none"
              value={newActivity.notes}
              onChange={e => setNewActivity(a => ({ ...a, notes: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Outcome / follow-up"
              className="rounded px-3 py-2 border border-[#00ADB5] bg-[#16213E] text-white w-full mb-3 placeholder-[#B8C1EC] focus:outline-none"
              value={newActivity.outcome}
              onChange={e => setNewActivity(a => ({ ...a, outcome: e.target.value }))}
            />
            <button
              onClick={handleAddActivity}
              className="bg-[#00ADB5] hover:bg-[#FF5722] text-white px-6 py-2 rounded-full font-bold shadow transition w-full md:w-auto"
            >
              Add Activity
            </button>
          </section>

          {/* Activity Timeline */}
          <section className="mb-10 glass-card">
            <h2 className="text-lg font-bold text-[#00ADB5] mb-4">Activity Timeline</h2>
            <div className="space-y-4">
              {activities.length === 0 && (
                <div className="text-gray-400 text-center">No activities logged yet.</div>
              )}
              {activities.map(a => (
                <div key={a.id} className="rounded-xl shadow p-4 border-l-4 border-[#00ADB5] bg-[#16213E]/60 text-white">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-[#00ADB5]">{a.type}: {a.title}</span>
                    <span className="text-xs text-[#B8C1EC]">{a.timestamp}</span>
                  </div>
                  <div className="text-[#B8C1EC] mb-1">{a.notes}</div>
                  {a.outcome && (
                    <div className="text-xs text-[#FF5722]">Outcome: {a.outcome}</div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Task Reminders */}
          <section className="mb-10 glass-card">
            <h2 className="text-xl font-bold text-[#00ADB5] mb-4">Task Reminders</h2>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <input
                type="text"
                placeholder="Task (e.g. Call Client)"
                className="rounded px-3 py-2 border border-[#00ADB5] bg-[#16213E] text-white flex-1 placeholder-[#B8C1EC] focus:outline-none"
                value={newReminder.task}
                onChange={e => setNewReminder(r => ({ ...r, task: e.target.value }))}
              />
              <input
                type="date"
                className="rounded px-3 py-2 border border-[#00ADB5] bg-[#16213E] text-white focus:outline-none"
                value={newReminder.due}
                onChange={e => setNewReminder(r => ({ ...r, due: e.target.value }))}
              />
              <button
                onClick={handleAddReminder}
                className="bg-[#00ADB5] hover:bg-[#FF5722] text-white px-6 py-2 rounded-full font-bold shadow transition"
              >
                Add Reminder
              </button>
            </div>
            <ul className="divide-y">
              {reminders.length === 0 && (
                <li className="text-[#B8C1EC] py-2 text-center">No reminders set.</li>
              )}
              {reminders.map(r => (
                <li key={r.id} className="flex items-center justify-between py-2">
                  <div>
                    <input
                      type="checkbox"
                      checked={r.done}
                      onChange={() => toggleReminder(r.id, r.done)}
                      className="mr-2 accent-[#00ADB5]"
                    />
                    <span className={r.done ? "line-through text-[#B8C1EC]" : "text-white"}>
                      {r.task}
                    </span>
                    <span className="ml-3 text-xs text-[#B8C1EC]">
                      Due: {r.due}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteReminder(r.id)}
                    className="text-[#FF5722] hover:underline text-xs"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <style>{`
          .glass-card {
            background: rgba(36, 36, 62, 0.7);
            border-radius: 1.5rem;
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border: 1px solid rgba(255,255,255,0.18);
            padding: 2rem;
            margin-bottom: 2rem;
            transition: box-shadow 0.3s, transform 0.3s;
          }
          .glass-card:hover {
            box-shadow: 0 12px 40px 0 rgba(255, 0, 128, 0.25), 0 8px 32px 0 rgba(31, 38, 135, 0.37);
            transform: translateY(-4px) scale(1.02);
          }
        `}</style>
      </div>
    </div>
  );
}