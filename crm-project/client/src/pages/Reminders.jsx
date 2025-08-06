import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const remindersData = [
  { task: "Call Client", due: "Tomorrow" },
  { task: "Send ESG Update", due: "2 days" },
  // ...
];

const Reminders = ({ search = "" }) => {
  const [reminders, setReminders] = useState([]);
  const [newReminder, setNewReminder] = useState({
    title: '',
    dueDate: '',
    status: 'Pending',
    type: 'Report Submission',
  });
  const navigate = useNavigate();

  const fetchReminders = async () => {
    try {
      const response = await axios.get('/api/reminders');
      setReminders(response.data);
    } catch (err) {
      console.error('Error fetching reminders', err);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleAddReminder = async () => {
    try {
      const response = await axios.post('/api/reminders', newReminder);
      setReminders([...reminders, response.data]);
      setNewReminder({ title: '', dueDate: '', status: 'Pending', type: 'Report Submission' });
    } catch (err) {
      console.error('Error adding reminder', err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/api/reminders/${id}`, { status });
      fetchReminders();
    } catch (err) {
      console.error('Error updating status', err);
    }
  };

  const deleteReminder = async (id) => {
    try {
      await axios.delete(`/api/reminders/${id}`);
      setReminders(reminders.filter(r => r.id !== id));
    } catch (err) {
      console.error('Error deleting reminder', err);
    }
  };

  const filteredReminders = remindersData.filter(
    r => r.task.toLowerCase().includes(search.toLowerCase()) ||
         r.due.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#232946]/80 to-[#0f2027]/90 p-8 text-white">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-pink-400 flex items-center">
            Reminders & Notifications
          </h2>
        </div>
        <div className="mb-6 glass-card">
          <h3 className="text-lg font-medium mb-2 text-white">Add New Reminder</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Reminder Title"
              value={newReminder.title}
              onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
              className="p-2 rounded w-full bg-white/10 text-white placeholder-purple-300 border border-purple-700 focus:outline-none"
            />
            <input
              type="date"
              value={newReminder.dueDate}
              onChange={(e) => setNewReminder({ ...newReminder, dueDate: e.target.value })}
              className="p-2 rounded w-full bg-white/10 text-white border border-purple-700 focus:outline-none"
            />
            <select
              value={newReminder.type}
              onChange={(e) => setNewReminder({ ...newReminder, type: e.target.value })}
              className="p-2 rounded w-full bg-white/10 text-white border border-purple-700 focus:outline-none"
            >
              <option>Report Submission</option>
              <option>Compliance Deadline</option>
              <option>Follow-up</option>
              <option>Other</option>
            </select>
            <button
              onClick={handleAddReminder}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Add Reminder
            </button>
          </div>
        </div>
        

        <div className="overflow-x-auto glass-card">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-700 font-semibold">
                <th className="py-2">Title</th>
                <th className="py-2">Due Date</th>
                <th className="py-2">Type</th>
                <th className="py-2">Status</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReminders.map((reminder) => (
                <tr key={reminder.id} className="border-t text-sm">
                  <td className="py-2">{reminder.title}</td>
                  <td className="py-2">{reminder.dueDate}</td>
                  <td className="py-2">{reminder.type}</td>
                  <td className="py-2">
                    <span
                      className={`px-3 py-1 rounded text-white ${
                        reminder.status === 'Pending'
                          ? 'bg-yellow-500'
                          : reminder.status === 'Completed'
                          ? 'bg-green-600'
                          : 'bg-red-500'
                      }`}
                    >
                      {reminder.status}
                    </span>
                  </td>
                  <td className="py-2 space-x-2">
                    <button
                      onClick={() => updateStatus(reminder.id, 'Completed')}
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Mark Done
                    </button>
                    <button
                      onClick={() => deleteReminder(reminder.id)}
                      className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredReminders.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center">
                    <div className="glass-card bg-gradient-to-r from-pink-500/10 to-purple-600/10 text-pink-400 rounded-xl shadow-inner">
                      <span className="text-lg font-semibold">No reminders available.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
  );
};

export default Reminders;
