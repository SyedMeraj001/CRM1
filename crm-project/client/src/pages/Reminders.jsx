import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [newReminder, setNewReminder] = useState({
    task: '',
    due: '',
    type: 'Report Submission',
    done: false,
  });
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchReminders = async () => {
    try {
      try {
        const response = await axios.get('/api/reminders');
        setReminders(response.data);
      } catch (err) {
        console.error('Error fetching reminders', err);
      }
    } catch (err) {
      console.error('Error fetching reminders', err);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleAddReminder = async () => {
    if (!newReminder.task || !newReminder.due) return;
    try {
      const reminderToSend = { ...newReminder, done: false };
      const response = await axios.post('/api/reminders', reminderToSend);
      setReminders([...reminders, response.data]);
      setNewReminder({ task: '', due: '', type: 'Report Submission', done: false });
    } catch (err) {
      console.error('Error adding reminder', err);
    }
  };

    const updateStatus = async (id) => {
      try {
        await axios.patch(`/api/reminders/${id}`, { done: true });
        // Always fetch fresh reminders after update
        const response = await axios.get('/api/reminders');
        setReminders(response.data);
      } catch (err) {
        console.error('Error updating status', err);
      }
    };

    const deleteReminder = async (id) => {
      try {
        await axios.delete(`/api/reminders/${id}`);
        // Always fetch fresh reminders after delete
        const response = await axios.get('/api/reminders');
        setReminders(response.data);
      } catch (err) {
        console.error('Error deleting reminder', err);
      }
    };

  const filteredReminders = reminders.filter(
    r =>
      r &&
      ((r.task && typeof r.task === 'string' && r.task.toLowerCase().includes(search.toLowerCase())) ||
       (r.due && typeof r.due === 'string' && r.due.toLowerCase().includes(search.toLowerCase())) ||
       (r.type && typeof r.type === 'string' && r.type.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460] p-8 text-white font-sans">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-extrabold text-[#00ADB5] drop-shadow-lg flex items-center">
            Reminders & Notifications
          </h2>
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder="Search reminders..." />
        <div className="mb-6 glass-card border border-[#FF5722] shadow-xl rounded-2xl">
          <h3 className="text-xl font-bold mb-4 text-[#FF5722]">Add New Reminder</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left rounded-xl glass-table mb-2">
              <thead>
                <tr className="bg-gradient-to-r from-[#23234e] via-[#1a1a2e] to-[#16213e] text-[#00ADB5] font-bold text-base">
                  <th className="py-2 px-3">Title</th>
                  <th className="py-2 px-3">Due Date</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      placeholder="Reminder Task"
                      value={newReminder.task}
                      onChange={(e) => setNewReminder({ ...newReminder, task: e.target.value })}
                      className="p-2 rounded w-full bg-white/10 text-white placeholder-purple-300 border border-purple-700 focus:outline-none"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="date"
                      value={newReminder.due}
                      onChange={(e) => setNewReminder({ ...newReminder, due: e.target.value })}
                      className="p-2 rounded w-full bg-white/10 text-white border border-purple-700 focus:outline-none"
                    />
                  </td>
                  <td className="py-2 px-3">
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
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value="Pending"
                      disabled
                      className="p-2 rounded w-full bg-yellow-500/80 text-white border border-yellow-400 font-bold text-center cursor-not-allowed"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <button
                      onClick={handleAddReminder}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition-all duration-150"
                    >
                      Add Reminder
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left rounded-2xl overflow-hidden shadow-xl glass-table">
            <thead>
              <tr className="bg-gradient-to-r from-[#23234e] via-[#1a1a2e] to-[#16213e] text-[#00ADB5] font-bold text-base">
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReminders.map((reminder) => (
                <tr
                  key={reminder.id}
                  className="border-t border-[#23234e] text-sm glass-row hover:bg-[#23234e]/60 transition-all duration-150"
                >
                  <td className="py-3 px-4 font-semibold text-white/90">{reminder.task}</td>
                  <td className="py-3 px-4 text-purple-300">{reminder.due ? new Date(reminder.due).toLocaleDateString() : ''}</td>
                  <td className="py-3 px-4 text-[#FF5722] font-medium">{reminder.type && reminder.type.trim() ? reminder.type : 'N/A'}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-lg text-white font-bold shadow-md ${
                        reminder.done === true
                          ? 'bg-green-600/80 border border-green-400'
                          : 'bg-yellow-500/80 border border-yellow-400'
                      }`}
                    >
                      {reminder.done === true ? 'Completed' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 px-4 space-x-2">
                    <button
                      onClick={() => updateStatus(reminder.id)}
                      className="text-sm bg-blue-600/80 text-white px-3 py-1 rounded-lg shadow hover:bg-blue-700/90 transition-all duration-150"
                    >
                      Mark Done
                    </button>
                    <button
                      onClick={() => deleteReminder(reminder.id)}
                      className="text-sm bg-red-600/80 text-white px-3 py-1 rounded-lg shadow hover:bg-red-700/90 transition-all duration-150"
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
  .glass-table {
    background: rgba(36, 36, 62, 0.6);
    border-radius: 1.25rem;
    box-shadow: 0 4px 24px 0 rgba(31, 38, 135, 0.25);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    border: 1px solid rgba(255,255,255,0.10);
    overflow: hidden;
  }
  .glass-row {
    transition: background 0.2s, box-shadow 0.2s;
  }
  .glass-row:hover {
    background: rgba(36, 36, 62, 0.8);
    box-shadow: 0 2px 8px 0 rgba(255, 0, 128, 0.10);
  }
`}</style>
    </div>
  );
};

export default Reminders;
