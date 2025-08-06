import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ActivityTracker() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([
    {
      id: 1,
      type: "Meeting",
      title: "Kickoff with ABC Corp",
      notes: "Discussed ESG goals, next steps: send ESG Update.",
      outcome: "Follow-up scheduled",
      timestamp: "2025-07-24 10:00",
    },
    {
      id: 2,
      type: "Call",
      title: "Call with XYZ Pvt Ltd",
      notes: "Clarified compliance requirements.",
      outcome: "Send compliance checklist",
      timestamp: "2025-07-25 14:30",
    },
  ]);
  const [reminders, setReminders] = useState([
    { id: 1, task: "Call Client", due: "2025-07-26", done: false },
    { id: 2, task: "Send ESG Update", due: "2025-07-27", done: false },
  ]);
  const [newActivity, setNewActivity] = useState({
    type: "Meeting",
    title: "",
    notes: "",
    outcome: "",
  });
  const [newReminder, setNewReminder] = useState({ task: "", due: "" });

  // Add activity
  const handleAddActivity = () => {
    if (!newActivity.title || !newActivity.notes) return;
    setActivities([
      {
        ...newActivity,
        id: Date.now(),
        timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
      },
      ...activities,
    ]);
    setNewActivity({ type: "Meeting", title: "", notes: "", outcome: "" });
  };

  // Add reminder
  const handleAddReminder = () => {
    if (!newReminder.task || !newReminder.due) return;
    setReminders([
      { ...newReminder, id: Date.now(), done: false },
      ...reminders,
    ]);
    setNewReminder({ task: "", due: "" });
  };

  // Mark reminder done
  const toggleReminder = (id) => {
    setReminders(reminders =>
      reminders.map(r =>
        r.id === id ? { ...r, done: !r.done } : r
      )
    );
  };

  // Delete reminder
  const deleteReminder = (id) => {
    setReminders(reminders => reminders.filter(r => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#232946]/80 to-[#0f2027]/90 p-8 text-white">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-pink-400 flex items-center">
            📝 Activity Tracker & CRM Log
          </h1>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Add Activity */}
          <section className="mb-10 glass-card">
            <h2 className="text-xl font-bold text-pink-400 mb-4">Log Meeting / Activity</h2>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <select
                className="rounded px-3 py-2 border border-purple-700 bg-white/10 text-white"
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
                className="rounded px-3 py-2 border border-purple-700 bg-white/10 text-white flex-1 placeholder-purple-300 focus:outline-none"
                value={newActivity.title}
                onChange={e => setNewActivity(a => ({ ...a, title: e.target.value }))}
              />
            </div>
            <textarea
              placeholder="Discussion points / notes"
              className="rounded px-3 py-2 border border-purple-700 bg-white/10 text-white w-full mb-3 placeholder-purple-300 focus:outline-none"
              value={newActivity.notes}
              onChange={e => setNewActivity(a => ({ ...a, notes: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Outcome / follow-up"
              className="rounded px-3 py-2 border border-purple-700 bg-white/10 text-white w-full mb-3 placeholder-purple-300 focus:outline-none"
              value={newActivity.outcome}
              onChange={e => setNewActivity(a => ({ ...a, outcome: e.target.value }))}
            />
            <button
              onClick={handleAddActivity}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold shadow transition w-full md:w-auto"
            >
              Add Activity
            </button>
          </section>

          {/* Activity Timeline */}
          <section className="mb-10 glass-card">
            <h2 className="text-lg font-bold text-pink-400 mb-4">Activity Timeline</h2>
            <div className="space-y-4">
              {activities.length === 0 && (
                <div className="text-gray-400 text-center">No activities logged yet.</div>
              )}
              {activities.map(a => (
                <div key={a.id} className="rounded-xl shadow p-4 border-l-4 border-blue-400 bg-[#232946]/60 text-white">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-pink-400">{a.type}: {a.title}</span>
                    <span className="text-xs text-purple-200">{a.timestamp}</span>
                  </div>
                  <div className="text-purple-100 mb-1">{a.notes}</div>
                  {a.outcome && (
                    <div className="text-xs text-purple-300">Outcome: {a.outcome}</div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Task Reminders */}
          <section className="mb-10 glass-card">
            <h2 className="text-xl font-bold text-pink-400 mb-4">Task Reminders</h2>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <input
                type="text"
                placeholder="Task (e.g. Call Client)"
                className="rounded px-3 py-2 border border-purple-700 bg-white/10 text-white flex-1 placeholder-purple-300 focus:outline-none"
                value={newReminder.task}
                onChange={e => setNewReminder(r => ({ ...r, task: e.target.value }))}
              />
              <input
                type="date"
                className="rounded px-3 py-2 border border-purple-700 bg-white/10 text-white focus:outline-none"
                value={newReminder.due}
                onChange={e => setNewReminder(r => ({ ...r, due: e.target.value }))}
              />
              <button
                onClick={handleAddReminder}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-bold shadow transition"
              >
                Add Reminder
              </button>
            </div>
            <ul className="divide-y">
              {reminders.length === 0 && (
                <li className="text-gray-400 py-2 text-center">No reminders set.</li>
              )}
              {reminders.map(r => (
                <li key={r.id} className="flex items-center justify-between py-2">
                  <div>
                    <input
                      type="checkbox"
                      checked={r.done}
                      onChange={() => toggleReminder(r.id)}
                      className="mr-2"
                    />
                    <span className={r.done ? "line-through text-gray-400" : ""}>
                      {r.task}
                    </span>
                    <span className="ml-3 text-xs text-gray-500">
                      Due: {r.due}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteReminder(r.id)}
                    className="text-red-600 hover:underline text-xs"
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