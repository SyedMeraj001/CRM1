// client/src/pages/ESGReports.jsx

import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Cell } from "recharts";
import Modal from "../components/Modal";

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_TYPES = ["application/pdf"];



const Reports = () => {
  const [editingId, setEditingId] = useState(null);
  const [editReport, setEditReport] = useState({ company: '', year: '', metrics: '', summary: '' });
  const [updateStatus, setUpdateStatus] = useState('');

  // Start editing a report
  function handleEdit(report) {
    setEditingId(report.id);
    setEditReport({
      company: report.company || "",
      year: report.year || "",
      standard: report.standard || "",
      status: report.status || "",
    });
    setUpdateStatus('');
  }

  // Cancel editing
  function handleCancelEdit() {
    setEditingId(null);
    setEditReport({ company: '', year: '', standard: '', status: '' });
    setUpdateStatus('');
  }

  // Save updated report
  async function handleSaveEdit(id) {
    setUpdateStatus('Updating...');
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editReport),
      });
      if (res.ok) {
        setUpdateStatus('Update successful!');
        setEditingId(null);
        fetchReports();
      } else {
        setUpdateStatus('Update failed.');
      }
    } catch (err) {
      setUpdateStatus('Update failed.');
    }
  }
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filter, setFilter] = useState("all");
  const [uploadStatus, setUploadStatus] = useState("");
  const [search, setSearch] = useState("");
  const [benchmarkOpen, setBenchmarkOpen] = useState(false);
  const [error, setError] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/reports");
      const data = await res.json();
      // Add fileUrl for preview/download
      setReports(data.map(r => ({
        ...r,
        fileUrl: r.filename ? `http://localhost:5000/uploads/${r.filename}` : null
      })));
    } catch (err) {
      console.error("Failed to fetch reports", err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setError("No file selected.");
      setSelectedFile(null);
      return;
    }
    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      setSelectedFile(null);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Max file size is 10MB.");
      setSelectedFile(null);
      return;
    }
    setError("");
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("No file selected.");
      return;
    }
    const formData = new FormData();
    formData.append("file", selectedFile);

    const response = await fetch("http://localhost:5000/api/upload", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    if (result.ok) {
      setUploadedFile(result);
      setError("");
      fetchReports();
    } else {
      setError(result.message || "Upload failed.");
    }
  };

  // Export functions only called on button click
  const exportToCSV = () => {
    console.log("exportToCSV called");
    const csv = Papa.unparse(reports);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "esg_reports.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    console.log("exportToPDF called");
    const doc = new jsPDF();
    doc.text("ESG Report Summary", 14, 16);
    doc.autoTable({
      head: [["Company", "Year", "Standard", "Status", "Timestamp"]],
      body: reports.map((r) => [
        r.company,
        r.year,
        r.standard,
        r.status,
        r.timestamp,
      ]),
    });
    doc.save("esg_reports.pdf");
  };

  const filteredReports = reports
    .filter((r) => {
      if (filter === "all") return true;
      const year = r.year || null;
      const now = new Date().getFullYear();
      if (filter === "monthly" && r.uploaded_at) {
        const thisMonth = new Date().getMonth();
        return (
          new Date(r.uploaded_at).getMonth() === thisMonth && year === now
        );
      } else if (filter === "quarterly" && r.uploaded_at) {
        const month = new Date(r.uploaded_at).getMonth();
        const quarter = Math.floor(month / 3);
        const currentQuarter = Math.floor(new Date().getMonth() / 3);
        return quarter === currentQuarter && year === now;
      } else if (filter === "yearly") {
        return year === now;
      }
      return false;
    })
    .filter((r) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        (r.company && r.company.toLowerCase().includes(q)) ||
        (r.metrics && r.metrics.toLowerCase().includes(q)) ||
        (r.year && String(r.year).toLowerCase().includes(q))
      );
    });

  // --- Analytics UI Components ---
  function LinkedReportGraph({ reports }) {
    // Define a color palette for non-null bars
    const vibrantColors = [
      "#00ADB5", // teal
      "#FF5722", // orange
      "#A78BFA", // purple
      "#22d3ee", // cyan
      "#F59E42", // gold
      "#FF4081", // pink
      "#4ADE80", // green
    ];
    const nullColor = "#888888"; // gray for null/zero/NaN

    // Helper to check if score is valid
    const isValidScore = (score) => {
      const n = Number(score);
      return n || n === 0 ? !isNaN(n) : false;
    };

    // If no data or all companies are missing, show a message
    if (!reports || !Array.isArray(reports) || reports.length === 0 || reports.every(r => !r.company)) {
      return (
        <div className="glass-card mb-8 border-t-4 border-green-500 flex items-center justify-center min-h-[180px]">
          <h2 className="text-xl font-bold text-green-400">Linked CMR Reports</h2>
          <div className="w-full text-center text-gray-400 mt-4">No data available for graph.</div>
        </div>
      );
    }

    return (
      <div className="glass-card mb-8 border-t-4 border-green-500">
        <h2 className="text-xl font-bold mb-4 text-green-400">Linked CMR Reports</h2>
        <div className="text-xs text-gray-400 mb-2">Gray bars = No Data</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={reports}>
            <XAxis dataKey="company" stroke="#22d3ee" />
            <YAxis stroke="#a78bfa" />
            <RechartsTooltip />
            <Bar dataKey="score" radius={[8,8,0,0]}>
              {reports.map((entry, index) => {
                const n = Number(entry.score);
                const fill = isValidScore(entry.score)
                  ? vibrantColors[index % vibrantColors.length]
                  : nullColor;
                return <Cell key={`cell-${index}`} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  function BenchmarkModal({ open, onClose, benchmarks }) {
    if (!open) return null;
    return (
      <Modal onClose={onClose}>
        <h2 className="text-xl font-bold mb-4 text-cyan-400">Benchmark Comparison</h2>
        <table className="min-w-full text-sm mb-4">
          <thead>
            <tr className="text-purple-400">
              <th className="p-2 text-left">Company</th>
              <th className="p-2 text-left">ESG Score</th>
              <th className="p-2 text-left">Peer Avg</th>
            </tr>
          </thead>
          <tbody>
            {benchmarks.map((b, i) => (
              <tr key={i}>
                <td className="p-2">{b.company}</td>
                <td className="p-2">{b.score}</td>
                <td className="p-2">{b.peerAvg}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-4 py-2 rounded shadow font-semibold"
          onClick={onClose}
        >
          Close
        </button>
      </Modal>
    );
  }

  function CompanyReportSummary({ summary }) {
    return (
      <div className="glass-card mb-8 border-t-4 border-purple-500">
        <h2 className="text-xl font-bold mb-4 text-purple-400">Company Report Summary</h2>
        <div className="text-purple-200 mb-2">Company: <span className="font-bold">{summary.company}</span></div>
        <div className="text-purple-200 mb-2">Metrics: <span className="font-bold">{summary.metrics.join(", ")}</span></div>
        <div className="text-purple-200 mb-2">Summary: <span className="font-bold">{summary.text}</span></div>
      </div>
    );
  }

  // Example analytics data (replace with real data as needed)
  const linkedReports = reports.map(r => ({
    company: r.company,
    score: r.esg_score || 0 // Use real ESG score if available
  }));
  const benchmarks = linkedReports.map(r => ({
    company: r.company,
    score: r.score,
    peerAvg: 75
  }));
  const companySummary = {
    company: reports[0]?.company || "N/A",
    metrics: reports[0]?.metrics ? reports[0].metrics.split(',').map(m => m.trim()) : ["Environment", "Social", "Governance"],
    text: reports[0]?.summary || `${reports[0]?.company || "This company"} is above peer average in Environment, meets Social and Governance standards.`
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460] p-8 text-white font-sans flex flex-col items-center">
      {/* Page Title */}
      <div className="flex items-center justify-between mb-8 w-full max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-[#00ADB5] drop-shadow-lg flex items-center tracking-tight">
          📄 ESG Report Management
        </h1>
      </div>

      {/* Upload Section */}
      <section className="max-w-2xl mx-auto mb-12 w-full flex justify-center">
        <div className="glass-card shadow-xl border border-[#FF5722] p-10 flex flex-col gap-6 items-center w-full">
          <h2 className="text-2xl font-extrabold text-[#FF5722] mb-4 w-full text-center drop-shadow-lg">
            Upload ESG Report
          </h2>
          <div className="flex flex-col md:flex-row w-full gap-4 items-center justify-center">
            <input
              type="file"
              className="block w-full text-sm text-white border border-[#00ADB5] rounded-lg cursor-pointer bg-[#16213E] focus:outline-none placeholder-[#B8C1EC]"
              accept="application/pdf"
              onChange={handleFileChange}
            />
            <button
              onClick={handleUpload}
              className="bg-gradient-to-r from-[#00ADB5] to-[#FF5722] hover:from-[#00ADB5] hover:to-[#FF5722] text-white px-6 py-2 rounded-full font-bold shadow transition w-full md:w-auto"
            >
              Upload
            </button>
          </div>
          <div className="w-full text-center">
            {selectedFile && (
              <span className="text-xs text-purple-300 block">{selectedFile.name}</span>
            )}
            {uploadStatus && (
              <div
                className={`mt-1 text-sm font-semibold ${
                  uploadStatus.includes("success")
                    ? "text-[#00ADB5]"
                    : uploadStatus.includes("Uploading")
                    ? "text-[#B8C1EC]"
                    : "text-[#FF5722]"
                }`}
              >
                {uploadStatus}
              </div>
            )}
            <div className="text-xs text-purple-200 mt-1">
              Only PDF files, max size 10MB.
            </div>
          </div>
          {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
          {uploadedFile && (
            <div className="mt-4">
              <p className="text-sm text-purple-200">Uploaded: {uploadedFile.originalname}</p>
              <a
                href={`http://localhost:5000/uploads/${uploadedFile.filename}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-cyan-400 underline"
              >
                View PDF
              </a>
              <br />
              <embed
                src={`http://localhost:5000/uploads/${uploadedFile.filename}`}
                width="100%"
                height="180px"
                type="application/pdf"
                className="rounded border mt-2"
              />
            </div>
          )}
        </div>
      </section>

      {/* Filters, Search, Export */}
      <section className="max-w-7xl mx-auto mb-10 w-full flex flex-col items-center">
        <div className="glass-card shadow-xl border border-[#00ADB5] p-8 flex flex-col md:flex-row items-center justify-center gap-6 w-full mb-6">
          <div className="flex gap-2 md:gap-3 justify-center">
            {["all", "monthly", "quarterly", "yearly"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1 rounded-full border font-semibold transition ${
                  filter === f
                    ? "bg-purple-600 text-white shadow"
                    : "border-purple-700 text-purple-300 hover:bg-purple-700/20"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search company, standard, year..."
            className="rounded-full px-4 py-2 border border-[#00ADB5] bg-[#16213E] text-white focus:outline-none focus:ring-2 focus:ring-[#00ADB5] transition w-full md:w-80 placeholder-[#B8C1EC] text-center"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {/* Export options at bottom center */}
  <div className="flex gap-2 md:gap-3 justify-center mt-6">
          <button
            onClick={exportToCSV}
            className="bg-gradient-to-r from-[#00ADB5] to-[#FF5722] hover:from-[#00ADB5] hover:to-[#FF5722] px-4 py-2 rounded-full font-semibold shadow transition text-white"
          >
            Export CSV
          </button>
          <button
            onClick={exportToPDF}
            className="bg-gradient-to-r from-[#FF5722] to-[#00ADB5] hover:from-[#FF5722] hover:to-[#00ADB5] px-4 py-2 rounded-full font-semibold shadow transition text-white"
          >
            Export PDF
          </button>
        </div>
      </section>

      {/* Report Cards */}
      <section className="max-w-7xl mx-auto w-full flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 w-full justify-items-center">
          {filteredReports.length === 0 && (
            <div className="col-span-3 text-center text-purple-300 py-8 text-lg">
              No reports found.
            </div>
          )}
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className={`relative glass-card border-l-4 shadow-xl flex flex-col transition hover:scale-[1.03] hover:shadow-2xl ${
                report.status === "Submitted"
                  ? "border-[#00ADB5]"
                  : "border-[#FF5722]"
              }`}
            >
              {editingId === report.id ? (
                <>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-2">
                    <input
                      type="text"
                      className="text-2xl font-extrabold text-[#00ADB5] text-center w-full drop-shadow bg-[#16213E] rounded px-2 py-1 mb-2"
                      value={editReport.company}
                      onChange={e => setEditReport({ ...editReport, company: e.target.value })}
                      placeholder="Company"
                    />
                    <select
                      className="px-4 py-1 rounded-full text-sm font-bold shadow-lg bg-[#232946] text-[#00ADB5]"
                      value={editReport.status}
                      onChange={e => setEditReport({ ...editReport, status: e.target.value })}
                    >
                      <option value="Submitted">Submitted</option>
                      <option value="Draft">Draft</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                  <div className="mb-1 text-[#B8C1EC] text-center text-lg">
                    Year: <input
                      type="text"
                      className="font-semibold text-white bg-[#16213E] rounded px-2 py-1"
                      value={editReport.year || ""}
                      onChange={e => setEditReport({ ...editReport, year: e.target.value })}
                      placeholder="Year"
                    />
                  </div>
                  <div className="mb-1 text-[#B8C1EC] text-center text-lg">
                    Standard: <input
                      type="text"
                      className="font-semibold text-white bg-[#16213E] rounded px-2 py-1"
                      value={editReport.standard || ""}
                      onChange={e => setEditReport({ ...editReport, standard: e.target.value })}
                      placeholder="Standard"
                    />
                  </div>
                  <div className="text-sm text-[#B8C1EC] mb-2 text-center">
                    Submitted on: {report.timestamp}
                  </div>
                  <div className="mt-2 mb-3 flex justify-center">
                    {report.fileUrl ? (
                      <embed
                        src={report.fileUrl}
                        type="application/pdf"
                        width="100%"
                        height="180px"
                        className="rounded border"
                      />
                    ) : (
                      <div className="bg-[#16213E]/40 text-[#B8C1EC] rounded p-4 text-center text-xs">
                        PDF preview not available.
                      </div>
                    )}
                  </div>
                  <div className="flex gap-4 mt-auto justify-center">
                    <button
                      className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-2 rounded-full text-base font-bold shadow-lg transition"
                      onClick={() => handleSaveEdit(report.id)}
                    >
                      Save
                    </button>
                    <button
                      className="bg-gradient-to-r from-gray-500 to-gray-700 text-white px-6 py-2 rounded-full text-base font-bold shadow-lg transition"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                  {updateStatus && (
                    <div className="text-center text-sm mt-2 font-semibold text-[#00ADB5]">{updateStatus}</div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-2">
                    <h3 className="text-2xl font-extrabold text-[#00ADB5] text-center w-full drop-shadow">
                      {report.company}
                    </h3>
                    <span
                      className={`px-4 py-1 rounded-full text-sm font-bold shadow-lg ${
                        report.status === "Submitted"
                          ? "bg-[#00ADB5]/20 text-[#00ADB5]"
                          : "bg-[#FF5722]/20 text-[#FF5722]"
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>
                  <div className="mb-1 text-[#B8C1EC] text-center text-lg">
                    Year: <span className="font-semibold text-white">{report.year}</span>
                  </div>
                  <div className="mb-1 text-[#B8C1EC] text-center text-lg">
                    Metrics: <span className="font-semibold text-white">{report.metrics}</span>
                  </div>
                  <div className="mb-1 text-[#B8C1EC] text-center text-lg">
                    Summary: <span className="font-semibold text-white">{report.summary}</span>
                  </div>
                  <div className="text-sm text-[#B8C1EC] mb-2 text-center">
                    Submitted on: {report.timestamp}
                  </div>
                  <div className="mt-2 mb-3 flex justify-center">
                    {report.fileUrl ? (
                      <embed
                        src={report.fileUrl}
                        type="application/pdf"
                        width="100%"
                        height="180px"
                        className="rounded border"
                      />
                    ) : (
                      <div className="bg-[#16213E]/40 text-[#B8C1EC] rounded p-4 text-center text-xs">
                        PDF preview not available.
                      </div>
                    )}
                  </div>
                  <div className="flex gap-4 mt-auto justify-center">
                    {report.fileUrl && (
                      <a
                        href={report.fileUrl}
                        download={report.filename}
                        className="bg-gradient-to-r from-[#00ADB5] to-[#FF5722] hover:from-[#00ADB5] hover:to-[#FF5722] text-white px-6 py-2 rounded-full text-base font-bold shadow-lg transition"
                      >
                        Download
                      </a>
                    )}
                    <button
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full text-base font-bold shadow-lg transition"
                      onClick={() => handleEdit(report)}
                    >
                      Edit
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* --- Integration with Analytics --- */}
      <LinkedReportGraph reports={linkedReports} />

      <button
        className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-4 py-2 rounded shadow font-semibold mb-6"
        onClick={() => setBenchmarkOpen(true)}
      >
        Show Benchmark View
      </button>
      <BenchmarkModal open={benchmarkOpen} onClose={() => setBenchmarkOpen(false)} benchmarks={benchmarks} />

      <CompanyReportSummary summary={companySummary} />

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

export default Reports;
