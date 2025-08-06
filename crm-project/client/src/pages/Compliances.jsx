import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Dummy user role: "officer" (full access) or "auditor" (view only)
const USER_ROLE = "officer"; // Change to "auditor" to test view-only

// Dummy data for demonstration
const DUMMY_DOCS = [
  {
    id: 1,
    name: "ESG_Report_July2025.pdf",
    type: "SEBI",
    department: "Sustainability",
    owner: "Ali",
    status: "Under Review",
    reviewer: "Jane Doe",
    submitted: "2025-07-20",
    remarks: "Awaiting additional data",
    attachments: ["ESG_Report_July2025.pdf"],
    history: [
      { action: "Uploaded", user: "Ali", time: "2025-07-20 10:12" },
      { action: "Reviewed", user: "Jane Doe", time: "2025-07-21 09:00" },
    ],
    deadline: "2025-07-25",
  },
  {
    id: 2,
    name: "GHG_Compliance.xlsx",
    type: "BRSR",
    department: "Finance",
    owner: "Ali",
    status: "Approved",
    reviewer: "John Smith",
    submitted: "2025-07-10",
    remarks: "All clear",
    attachments: ["GHG_Compliance.xlsx", "GHG_Supporting.zip"],
    history: [
      { action: "Uploaded", user: "Ali", time: "2025-07-10 14:22" },
      { action: "Reviewed", user: "John Smith", time: "2025-07-11 11:00" },
      { action: "Approved", user: "John Smith", time: "2025-07-11 11:05" },
    ],
    deadline: "2025-07-20",
  },
];

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
  const [docs, setDocs] = useState(DUMMY_DOCS);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [filters, setFilters] = useState({ type: "", status: "", date: "", department: "", owner: "" });
  const [search, setSearch] = useState("");
  const [calendarMonth, setCalendarMonth] = useState("2025-07");
  const [selectedDate, setSelectedDate] = useState("");
  const fileInput = useRef();

  // Compliance Score Calculation
  const complianceScore = Math.round(
    (docs.filter(d => d.status === "Approved").length / docs.length) * 100
  );
  const scoreColor =
    complianceScore > 80
      ? "bg-green-100 text-green-800"
      : complianceScore >= 50
      ? "bg-yellow-100 text-yellow-800"
      : "bg-red-100 text-red-800";

  // File upload handler (simulate progress)
  const handleFileUpload = (e) => {
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
    // Simulate upload
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          setDocs(prevDocs => [
            {
              id: prevDocs.length + 1,
              name: files[0].name,
              type: "Unknown",
              department: "Unknown",
              owner: "You",
              status: "Pending",
              reviewer: "",
              submitted: new Date().toISOString().slice(0, 10),
              remarks: "",
              attachments: files.map(f => f.name),
              history: [
                { action: "Uploaded", user: "You", time: new Date().toLocaleString() },
              ],
              deadline: "",
            },
            ...prevDocs,
          ]);
          return 100;
        }
        return prev + 20;
      });
    }, 300);
  };

  // Filtered docs
  const filteredDocs = docs.filter(doc =>
    (!filters.type || doc.type === filters.type) &&
    (!filters.status || doc.status === filters.status) &&
    (!filters.date || doc.submitted.startsWith(filters.date)) &&
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
    <div className="min-h-screen bg-gradient-to-tr from-[#232946]/80 to-[#0f2027]/90 p-0 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 w-full flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-pink-400 mb-2">
            Compliance Management
          </h1>
          {/* Removed Back to Dashboard button */}
        </header>

        {/* Dashboard Widgets */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card flex flex-col items-center">
            <span className="text-3xl font-bold text-pink-400">{totalSubmissions}</span>
            <span className="text-sm text-purple-200 mt-2">Total Submissions</span>
          </div>
          <div className="glass-card flex flex-col items-center">
            <span className="text-3xl font-bold text-yellow-400">{pendingReviews}</span>
            <span className="text-sm text-purple-200 mt-2">Pending Reviews</span>
          </div>
          <div className={`glass-card flex flex-col items-center ${scoreColor}`}>
            <span className="text-3xl font-bold">{complianceScore}%</span>
            <span className="text-sm mt-2 text-purple-200">Compliance Score</span>
          </div>
          <div className="glass-card flex flex-col items-center">
            <span className="text-3xl font-bold text-red-400">{upcomingDeadlines}</span>
            <span className="text-sm text-purple-200 mt-2">Upcoming Deadlines</span>
          </div>
        </section>

        {/* Compliance Calendar */}
        <section className="glass-card mb-8">
          <h2 className="text-lg font-bold mb-4 text-pink-400">Compliance Calendar</h2>
          <input
            type="month"
            value={calendarMonth}
            onChange={e => {
              setCalendarMonth(e.target.value);
              setSelectedDate("");
            }}
            className="mb-4 border rounded px-2 py-1 bg-[#232946]/60 text-white"
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
                    ${isToday ? "border-pink-400" : ""}
                    ${docsForDay.length === 0 ? "bg-[#232946]/40 border-purple-700 text-purple-200" : isOverdue ? "bg-pink-400/20 border-pink-400 text-pink-400" : "bg-green-400/20 border-green-400 text-green-400"}
                    ${selectedDate === dateStr ? "ring-2 ring-pink-400" : ""}
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
              <h3 className="text-md font-semibold mb-2 text-pink-400">
                Deadlines for {selectedDate}:
              </h3>
              {calendarDocs.filter(d => d.deadline === selectedDate).length === 0 ? (
                <div className="text-purple-300 text-sm">No deadlines.</div>
              ) : (
                <ul className="space-y-1">
                  {calendarDocs
                    .filter(d => d.deadline === selectedDate)
                    .map(d => (
                      <li key={d.id} className="flex items-center gap-2">
                        <span className="font-semibold text-pink-400">{d.name}</span>
                        <span className="text-xs bg-[#232946]/60 rounded px-2 py-0.5 text-purple-200">{d.type}</span>
                        <span className="text-xs text-purple-200">Owner: {d.owner}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS[d.status] || "bg-[#232946]/40 text-purple-200"}`}>{d.status}</span>
                        {new Date(d.deadline) < new Date(today) && (
                          <span className="text-xs text-pink-400 font-bold">Overdue</span>
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
          <h2 className="text-lg font-bold mb-4 text-pink-400">Upload Document</h2>
          <input
            ref={fileInput}
            type="file"
            accept={FILE_TYPES.map(f => f.accept).join(",")}
            className="mb-2 bg-[#232946]/60 text-white"
            onChange={handleFileUpload}
            disabled={uploading || USER_ROLE !== "officer"}
            multiple
          />
          {uploadError && <div className="text-pink-400 mb-2">{uploadError}</div>}
          {uploading && (
            <div className="w-full bg-purple-200 rounded h-3 mb-2">
              <div
                className="bg-pink-400 h-3 rounded"
                style={{ width: `${progress}%`, transition: "width 0.3s" }}
              />
            </div>
          )}
          <div className="text-xs text-purple-200">
            Allowed: PDF, Excel, Word, ZIP. Max size: 10MB. {USER_ROLE !== "officer" && <span className="text-pink-400">View only</span>}
          </div>
        </section>

        {/* Filters/Search */}
        <section className="flex flex-col md:flex-row gap-4 items-center mb-6">
          <input
            type="text"
            placeholder="Smart search by file name..."
            className="rounded px-3 py-2 border border-pink-400 bg-[#232946]/60 text-white"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="rounded px-3 py-2 border border-pink-400 bg-[#232946]/60 text-white"
            value={filters.type}
            onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
          >
            <option value="">All Regulations</option>
            {REG_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select
            className="rounded px-3 py-2 border border-pink-400 bg-[#232946]/60 text-white"
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
            className="rounded px-3 py-2 border border-pink-400 bg-[#232946]/60 text-white"
            value={filters.department}
            onChange={e => setFilters(f => ({ ...f, department: e.target.value }))}
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <input
            type="date"
            className="rounded px-3 py-2 border border-pink-400 bg-[#232946]/60 text-white"
            value={filters.date}
            onChange={e => setFilters(f => ({ ...f, date: e.target.value }))}
          />
        </section>

        {/* Document List */}
        <section className="glass-card">
          <h2 className="text-lg font-bold mb-4 text-pink-400">Submitted Documents</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-[#232946]/40 text-pink-400">
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
                    <td className="p-2 text-purple-100">{doc.name}</td>
                    <td className="p-2 text-purple-100">{doc.type}</td>
                    <td className="p-2 text-purple-100">{doc.department}</td>
                    <td className="p-2 text-purple-100">{doc.owner}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${STATUS_COLORS[doc.status] || "bg-[#232946]/40 text-purple-200"}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="p-2 text-purple-100">{doc.reviewer || <span className="text-purple-300">—</span>}</td>
                    <td className="p-2 text-purple-100">{doc.submitted}</td>
                    <td className="p-2 text-purple-100">{doc.deadline || <span className="text-purple-300">—</span>}</td>
                    <td className="p-2 text-purple-100">{doc.remarks || <span className="text-purple-300">—</span>}</td>
                    <td className="p-2">
                      {doc.attachments.map((a, i) => (
                        <span key={i} className="inline-block bg-[#232946]/40 rounded px-2 py-1 text-xs text-purple-200 mr-1">{a}</span>
                      ))}
                    </td>
                    <td className="p-2 flex gap-2">
                      <button className="text-pink-400 hover:underline">View</button>
                      <button className="text-green-400 hover:underline">Download</button>
                      {USER_ROLE === "officer" && (
                        <>
                          <button className="text-yellow-400 hover:underline">Edit</button>
                          <button className="text-red-400 hover:underline">Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredDocs.length === 0 && (
                  <tr>
                    <td colSpan={11} className="text-center text-purple-300 py-6">
                      No documents found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Export Buttons */}
          <div className="flex gap-3 mt-4 justify-center">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow font-semibold">
              Export CSV
            </button>
            <button className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded shadow font-semibold">
              Export XLSX
            </button>
            <button className="bg-purple-900 hover:bg-purple-800 text-white px-4 py-2 rounded shadow font-semibold">
              Export PDF
            </button>
          </div>
        </section>

        {/* History Log / Audit Trail */}
        <section className="glass-card mt-8">
          <h2 className="text-lg font-bold mb-4 text-pink-400">Audit Trail</h2>
          <div className="space-y-4">
            {filteredDocs.map(doc => (
              <div key={doc.id}>
                <div className="font-semibold text-pink-400">{doc.name}</div>
                <ul className="text-xs text-purple-200 ml-4 mt-1 space-y-1">
                  {doc.history.map((h, i) => (
                    <li key={i}>
                      [{h.time}] {h.action} by {h.user}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {filteredDocs.length === 0 && (
              <div className="text-purple-300 text-sm">No history to show.</div>
            )}
          </div>
        </section>
      </div>
      {/* Footer */}
      <footer className="w-full mt-12 py-6 flex justify-center items-center">
        <p className="text-purple-200 text-center text-sm font-semibold glow-text">
          Upload, track, and manage all compliance-related files and deadlines.
        </p>
      </footer>``
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