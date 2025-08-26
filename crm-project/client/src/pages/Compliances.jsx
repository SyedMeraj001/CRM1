import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const USER_ROLE = "officer"; // Change to "auditor" to test view-only

const STATUS_COLORS = {
  "Pending": "bg-yellow-100 text-yellow-800",
  "Under Review": "bg-blue-100 text-blue-800",
  "Approved": "bg-green-100 text-green-800",
  "Rejected": "bg-red-100 text-red-800",
};

const FILE_TYPES = [
  { label: "PDF", accept: ".pdf" },
  { label: "Excel", accept: ".xlsx,.xls" },
  { label: "Word", accept: ".doc,.docx" },
  { label: "ZIP", accept: ".zip" },
];

const REG_TYPES = ["SEBI", "BRSR", "ISO", "GRI"];
const DEPARTMENTS = ["HR", "Legal", "Sustainability", "Finance"];


export default function Compliances() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [filters, setFilters] = useState({ type: "", status: "", date: "", department: "", owner: "" });
  const [search, setSearch] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedDate, setSelectedDate] = useState("");
  const fileInput = useRef();

  // Fetch compliance docs from backend
  const fetchDocs = async () => {
    try {
      const res = await axios.get("/api/compliances");
      setDocs(res.data);
    } catch (err) {
      console.error("Failed to fetch compliance docs", err);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  // Compliance Score Calculation
  const complianceScore = docs.length > 0 ? Math.round(
    (docs.filter(d => d.status === "Approved").length / docs.length) * 100
  ) : 0;
  const scoreColor =
    complianceScore > 80
      ? "bg-green-100 text-green-800"
      : complianceScore >= 50
      ? "bg-yellow-100 text-yellow-800"
      : "bg-red-100 text-red-800";
  const handleFileUpload = async (e) => {
    if (USER_ROLE !== "officer") return;
    const files = Array.from(e.target.files);
    setUploadError("");
    if (!files.length) return;
    // Validate all files
    for (const file of files) {
      const validTypes = FILE_TYPES.flatMap(f => f.accept.split(","));
      if (!validTypes.some(type => file.name.endsWith(type.replace(".", "")))) {
        setUploadError("Invalid file type.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadError("File too large (max 10MB).");
        return;
      }
    }
    setUploading(true);
    setProgress(0);
    const formData = new FormData();
    files.forEach(file => formData.append("files", file));
    try {
      await axios.post("/api/compliances/upload", formData, {
        onUploadProgress: (progressEvent) => {
          setProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      });
      setUploading(false);
      setProgress(100);
      fetchDocs();
    } catch (err) {
      setUploading(false);
      setUploadError("Upload failed.");
    }
  };

  // Filtered docs
  const filteredDocs = docs.filter(doc =>
    (!filters.type || doc.type === filters.type) &&
    (!filters.status || doc.status === filters.status) &&
    (!filters.date || (doc.submitted && doc.submitted.startsWith(filters.date))) &&
    (!filters.department || doc.department === filters.department) &&
    (!filters.owner || doc.owner === filters.owner) &&
    (!search || doc.name.toLowerCase().includes(search.toLowerCase()))
  );

  // Dashboard widgets
  const totalSubmissions = docs.length;
  const pendingReviews = docs.filter(d => d.status === "Pending" || d.status === "Under Review").length;
  const upcomingDeadlines = docs.filter(d => d.deadline && new Date(d.deadline) > new Date()).length;

  // Calendar days (simple month grid)
  const daysInMonth = new Date(Number(calendarMonth.split("-")[0]), Number(calendarMonth.split("-")[1]), 0).getDate();
  const calendarDocs = docs.filter(d => d.deadline && d.deadline.startsWith(calendarMonth));
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460] p-0 md:p-8 text-white">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 w-full flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-[#00ADB5] mb-2">
            Compliance Management
          </h1>
          {/* Removed Back to Dashboard button */}
        </header>

        {/* Dashboard Widgets */}
  <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card flex flex-col items-center">
            <span className="text-3xl font-bold text-[#00ADB5]">{totalSubmissions}</span>
            <span className="text-sm text-[#B8C1EC] mt-2">Total Submissions</span>
          </div>
          <div className="glass-card flex flex-col items-center">
            <span className="text-3xl font-bold text-[#FF5722]">{pendingReviews}</span>
            <span className="text-sm text-[#B8C1EC] mt-2">Pending Reviews</span>
          </div>
          <div className={`glass-card flex flex-col items-center ${scoreColor}`}>
            <span className="text-3xl font-bold text-[#00ADB5]">{complianceScore}%</span>
            <span className="text-sm mt-2 text-[#B8C1EC]">Compliance Score</span>
          </div>
          <div className="glass-card flex flex-col items-center">
            <span className="text-3xl font-bold text-[#FF5722]">{upcomingDeadlines}</span>
            <span className="text-sm text-[#B8C1EC] mt-2">Upcoming Deadlines</span>
          </div>
        </section>

        {/* Compliance Calendar */}
        <section className="glass-card mb-8">
          <h2 className="text-lg font-bold mb-4 text-[#00ADB5]">Compliance Calendar</h2>
          <input
            type="month"
            value={calendarMonth}
            onChange={e => {
              setCalendarMonth(e.target.value);
              setSelectedDate("");
            }}
            className="mb-4 border rounded px-2 py-1 bg-[#16213E]/60 text-white border-[#00ADB5]"
          />
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {[...Array(daysInMonth)].map((_, i) => {
              const day = String(i + 1).padStart(2, "0");
              const dateStr = `${calendarMonth}-${day}`;
              const docsForDay = calendarDocs.filter(d => d.deadline === dateStr);
              const isToday = dateStr === today;
              const isOverdue = docsForDay.some(d => new Date(d.deadline) < new Date(today));
              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-16 w-full flex flex-col justify-start items-center rounded border focus:outline-none
                    ${isToday ? "border-[#00ADB5]" : ""}
                    ${docsForDay.length === 0 ? "bg-[#16213E]/40 border-[#B8C1EC] text-[#B8C1EC]" : isOverdue ? "bg-[#FF5722]/20 border-[#FF5722] text-[#FF5722]" : "bg-[#00ADB5]/20 border-[#00ADB5] text-[#00ADB5]"}
                    ${selectedDate === dateStr ? "ring-2 ring-[#00ADB5]" : ""}
                  `}
                >
                  <span className="font-bold">{i + 1}</span>
                  {docsForDay.length > 0 && (
                    <span className="text-[10px] mt-1 font-semibold">
                      {docsForDay.length} deadline{docsForDay.length > 1 ? "s" : ""}
                    </span>
                  )}
                  {isOverdue && <span className="text-xs text-pink-400 font-bold">Overdue</span>}
                  {isToday && <span className="text-xs text-pink-400 font-bold">Today</span>}
                </button>
              );
            })}
          </div>
          {selectedDate && (
            <div className="mt-4">
              <h3 className="text-md font-semibold mb-2 text-[#00ADB5]">
                Deadlines for {selectedDate}:
              </h3>
              {calendarDocs.filter(d => d.deadline === selectedDate).length === 0 ? (
                <div className="text-[#B8C1EC] text-sm">No deadlines.</div>
              ) : (
                <ul className="space-y-1">
                  {calendarDocs
                    .filter(d => d.deadline === selectedDate)
                    .map(d => (
                      <li key={d.id} className="flex items-center gap-2">
                        <span className="font-semibold text-[#00ADB5]">{d.name}</span>
                        <span className="text-xs bg-[#16213E]/60 rounded px-2 py-0.5 text-[#B8C1EC]">{d.type}</span>
                        <span className="text-xs text-[#B8C1EC]">Owner: {d.owner}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS[d.status] || "bg-[#16213E]/40 text-[#B8C1EC]"}`}>{d.status}</span>
                        {new Date(d.deadline) < new Date(today) && (
                          <span className="text-xs text-[#FF5722] font-bold">Overdue</span>
                        )}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          )}
        </section>

        {/* Upload Section */}
        <section className="glass-card mb-8">
          <h2 className="text-lg font-bold mb-4 text-[#00ADB5]">Upload Document</h2>
          <input
            ref={fileInput}
            type="file"
            accept={FILE_TYPES.map(f => f.accept).join(",")}
            className="mb-2 bg-[#16213E]/60 text-white border-[#00ADB5]"
            onChange={handleFileUpload}
            disabled={uploading || USER_ROLE !== "officer"}
            multiple
          />
          {uploadError && <div className="text-[#FF5722] mb-2">{uploadError}</div>}
          {uploading && (
            <div className="w-full bg-[#B8C1EC] rounded h-3 mb-2">
              <div
                className="bg-[#00ADB5] h-3 rounded"
                style={{ width: `${progress}%`, transition: "width 0.3s" }}
              />
            </div>
          )}
          <div className="text-xs text-[#B8C1EC]">
            Allowed: PDF, Excel, Word, ZIP. Max size: 10MB. {USER_ROLE !== "officer" && <span className="text-[#FF5722]">View only</span>}
          </div>
        </section>

        {/* Filters/Search */}
        <section className="flex flex-col md:flex-row gap-4 items-center mb-6">
          <input
            type="text"
            placeholder="Smart search by file name..."
            className="rounded px-3 py-2 border border-[#00ADB5] bg-[#16213E]/60 text-white"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="rounded px-3 py-2 border border-[#00ADB5] bg-[#16213E]/60 text-white"
            value={filters.type}
            onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
          >
            <option value="">All Regulations</option>
            {REG_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select
            className="rounded px-3 py-2 border border-[#00ADB5] bg-[#16213E]/60 text-white"
            value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <select
            className="rounded px-3 py-2 border border-[#00ADB5] bg-[#16213E]/60 text-white"
            value={filters.department}
            onChange={e => setFilters(f => ({ ...f, department: e.target.value }))}
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <input
            type="date"
            className="rounded px-3 py-2 border border-[#00ADB5] bg-[#16213E]/60 text-white"
            value={filters.date}
            onChange={e => setFilters(f => ({ ...f, date: e.target.value }))}
          />
        </section>

        {/* Document List */}
        <section className="glass-card">
          <h2 className="text-lg font-bold mb-4 text-[#00ADB5]">Submitted Documents</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-[#16213E]/40 text-[#00ADB5]">
                  <th className="p-2 text-left">File Name</th>
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-left">Department</th>
                  <th className="p-2 text-left">Owner</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Reviewer</th>
                  <th className="p-2 text-left">Submitted</th>
                  <th className="p-2 text-left">Deadline</th>
                  <th className="p-2 text-left">Remarks</th>
                  <th className="p-2 text-left">Attachments</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map(doc => (
                  <tr key={doc.id} className="border-b last:border-b-0">
                    <td className="p-2 text-[#B8C1EC]">{doc.name}</td>
                    <td className="p-2 text-[#B8C1EC]">{doc.type}</td>
                    <td className="p-2 text-[#B8C1EC]">{doc.department}</td>
                    <td className="p-2 text-[#B8C1EC]">{doc.owner}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${STATUS_COLORS[doc.status] || "bg-[#16213E]/40 text-[#B8C1EC]"}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="p-2 text-[#B8C1EC]">{doc.reviewer || <span className="text-[#B8C1EC]">—</span>}</td>
                    <td className="p-2 text-[#B8C1EC]">{doc.submitted}</td>
                    <td className="p-2 text-[#B8C1EC]">{doc.deadline || <span className="text-[#B8C1EC]">—</span>}</td>
                    <td className="p-2 text-[#B8C1EC]">{doc.remarks || <span className="text-[#B8C1EC]">—</span>}</td>
                    <td className="p-2">
                      {doc.attachments.map((a, i) => (
                        <span key={i} className="inline-block bg-[#16213E]/40 rounded px-2 py-1 text-xs text-[#B8C1EC] mr-1">{a}</span>
                      ))}
                    </td>
                    <td className="p-2 flex gap-2">
                      <button className="text-[#00ADB5] hover:underline">View</button>
                      <button className="text-[#FF5722] hover:underline">Download</button>
                      {USER_ROLE === "officer" && (
                        <>
                          <button className="text-[#B8C1EC] hover:underline">Edit</button>
                          <button className="text-[#FF5722] hover:underline">Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredDocs.length === 0 && (
                  <tr>
                    <td colSpan={11} className="text-center text-[#B8C1EC] py-6">
                      No documents found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Export Buttons */}
          <div className="flex gap-3 mt-4 justify-center">
            <button className="bg-[#00ADB5] hover:bg-[#FF5722] text-white px-4 py-2 rounded shadow font-semibold">
              Export CSV
            </button>
            <button className="bg-[#FF5722] hover:bg-[#00ADB5] text-white px-4 py-2 rounded shadow font-semibold">
              Export XLSX
            </button>
            <button className="bg-[#B8C1EC] hover:bg-[#00ADB5] text-white px-4 py-2 rounded shadow font-semibold">
              Export PDF
            </button>
          </div>
        </section>

        {/* History Log / Audit Trail */}
        <section className="glass-card mt-8">
          <h2 className="text-lg font-bold mb-4 text-[#00ADB5]">Audit Trail</h2>
          <div className="space-y-4">
            {filteredDocs.map(doc => (
              <div key={doc.id}>
                <div className="font-semibold text-[#00ADB5]">{doc.name}</div>
                <ul className="text-xs text-[#B8C1EC] ml-4 mt-1 space-y-1">
                  {doc.history.map((h, i) => (
                    <li key={i}>
                      [{h.time}] {h.action} by {h.user}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {filteredDocs.length === 0 && (
              <div className="text-[#B8C1EC] text-sm">No history to show.</div>
            )}
          </div>
        </section>
      </div>
      {/* Footer */}
      <footer className="w-full mt-12 py-6 flex justify-center items-center">
  <p className="text-[#B8C1EC] text-center text-sm font-semibold glow-text">
          Upload, track, and manage all compliance-related files and deadlines.
        </p>
      </footer>
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
        .glow-text {
          text-shadow: 0 0 8px #e879f9, 0 0 16px #a78bfa;
        }
      `}</style>
    </div>
  );
}