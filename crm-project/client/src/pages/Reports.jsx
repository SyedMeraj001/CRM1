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

const reportsData = [
  { title: "Q1 Report", date: "2025-03-31" },
  { title: "ESG Summary", date: "2025-04-15" },
  // ...
];

const Reports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filter, setFilter] = useState("all");
  const [uploadStatus, setUploadStatus] = useState("");
  const [search, setSearch] = useState("");
  const [benchmarkOpen, setBenchmarkOpen] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    // Simulated fetch from backend
    const dummyReports = [
      {
        id: 1,
        company: "ABC Corp",
        year: 2024,
        standard: "BRSR",
        filename: "abc_report.pdf",
        status: "Submitted",
        timestamp: "2024-04-10",
        fileUrl: "",
      },
      {
        id: 2,
        company: "XYZ Pvt Ltd",
        year: 2025,
        standard: "GRI",
        filename: "xyz_report.pdf",
        status: "Pending Review",
        timestamp: "2025-07-14",
        fileUrl: "",
      },
    ];
    setReports(dummyReports);
  };

  const handleFileUpload = (e) => {
    setUploadStatus("");
    const file = e.target.files[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadStatus("Only PDF files are allowed.");
      setSelectedFile(null);
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setUploadStatus("File size exceeds 10MB.");
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) {
      setUploadStatus("No file selected.");
      return;
    }
    setUploadStatus("Uploading...");
    setTimeout(() => {
      setReports((prev) => [
        {
          id: prev.length + 1,
          company: "New Company",
          year: new Date().getFullYear(),
          standard: "BRSR",
          filename: selectedFile.name,
          status: "Submitted",
          timestamp: new Date().toISOString().slice(0, 10),
          fileUrl: "", // In real app, set the uploaded file URL
        },
        ...prev,
      ]);
      setUploadStatus("Upload successful!");
      setSelectedFile(null);
    }, 1200);
  };

  const exportToCSV = () => {
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
      const year = new Date(r.timestamp).getFullYear();
      const now = new Date().getFullYear();
      if (filter === "monthly") {
        const thisMonth = new Date().getMonth();
        return (
          new Date(r.timestamp).getMonth() === thisMonth && year === now
        );
      } else if (filter === "quarterly") {
        const month = new Date(r.timestamp).getMonth();
        const quarter = Math.floor(month / 3);
        const currentQuarter = Math.floor(new Date().getMonth() / 3);
        return quarter === currentQuarter && year === now;
      } else if (filter === "yearly") {
        return year === now;
      }
      return false;
    })
    .filter((r) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        r.company.toLowerCase().includes(q) ||
        r.standard.toLowerCase().includes(q) ||
        String(r.year).includes(q)
      );
    });

  // --- Analytics UI Components ---
  function LinkedReportGraph({ reports }) {
    return (
      <div className="glass-card mb-8 border-t-4 border-green-500">
        <h2 className="text-xl font-bold mb-4 text-green-400">Linked CMR Reports</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={reports}>
            <XAxis dataKey="company" stroke="#22d3ee" />
            <YAxis stroke="#a78bfa" />
            <RechartsTooltip />
            <Bar dataKey="score" fill="#22d3ee" radius={[8,8,0,0]} />
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
    score: Math.floor(Math.random() * 40) + 60 // Dummy ESG score
  }));
  const benchmarks = linkedReports.map(r => ({
    company: r.company,
    score: r.score,
    peerAvg: 75
  }));
  const companySummary = {
    company: reports[0]?.company || "N/A",
    metrics: ["Environment", "Social", "Governance"],
    text: `${reports[0]?.company || "This company"} is above peer average in Environment, meets Social and Governance standards.`
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#232946]/80 to-[#0f2027]/90 p-8 text-white flex flex-col items-center">
      {/* Page Title */}
      <div className="flex items-center justify-between mb-6 w-full max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-pink-400 flex items-center">
          📄 ESG Report Management
        </h1>
      </div>

      {/* Upload Section */}
      <section className="max-w-2xl mx-auto mb-12 w-full flex justify-center">
        <div className="glass-card shadow-lg border border-purple-700 p-8 flex flex-col gap-4 items-center w-full">
          <h2 className="text-xl font-bold text-pink-400 mb-2 w-full text-center">
            Upload ESG Report
          </h2>
          <div className="flex flex-col md:flex-row w-full gap-4 items-center justify-center">
            <input
              type="file"
              className="block w-full text-sm text-white border border-pink-400 rounded-lg cursor-pointer bg-[#232946]/60 focus:outline-none placeholder-purple-300"
              accept="application/pdf"
              onChange={handleFileUpload}
            />
            <button
              onClick={handleUpload}
              className="bg-gradient-to-r from-green-500 to-purple-600 hover:from-green-600 hover:to-purple-700 text-white px-6 py-2 rounded-full font-bold shadow transition w-full md:w-auto"
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
                    ? "text-green-400"
                    : uploadStatus.includes("Uploading")
                    ? "text-purple-300"
                    : "text-pink-400"
                }`}
              >
                {uploadStatus}
              </div>
            )}
            <div className="text-xs text-purple-200 mt-1">
              Only PDF files, max size 10MB.
            </div>
          </div>
        </div>
      </section>

      {/* Filters, Search, Export */}
      <section className="max-w-7xl mx-auto mb-10 w-full flex flex-col items-center">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full">
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
            className="rounded-full px-4 py-2 border border-pink-400 bg-[#232946]/60 text-white focus:outline-none focus:ring-2 focus:ring-pink-400 transition w-full md:w-80 placeholder-purple-300 text-center"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {/* Export options at bottom center */}
        <div className="flex gap-2 md:gap-3 justify-center mt-6">
          <button
            onClick={exportToCSV}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-full font-semibold shadow transition text-white"
          >
            Export CSV
          </button>
          <button
            onClick={exportToPDF}
            className="bg-pink-500 hover:bg-pink-600 px-4 py-2 rounded-full font-semibold shadow transition text-white"
          >
            Export PDF
          </button>
        </div>
      </section>

      {/* Report Cards */}
      <section className="max-w-7xl mx-auto w-full flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 w-full justify-items-center">
          {filteredReports.length === 0 && (
            <div className="col-span-3 text-center text-purple-300 py-8 text-lg">
              No reports found.
            </div>
          )}
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className={`relative glass-card border-l-4 shadow-md flex flex-col transition hover:scale-[1.025] hover:shadow-xl ${
                report.status === "Submitted"
                  ? "border-green-400"
                  : "border-pink-400"
              }`}
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-pink-400 text-center w-full">
                  {report.company}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold shadow ${
                    report.status === "Submitted"
                      ? "bg-green-400/20 text-green-300"
                      : "bg-pink-400/20 text-pink-300"
                  }`}
                >
                  {report.status}
                </span>
              </div>
              <div className="mb-1 text-purple-200 text-center">
                Year: <span className="font-semibold">{report.year}</span>
              </div>
              <div className="mb-1 text-purple-200 text-center">
                Standard: <span className="font-semibold">{report.standard}</span>
              </div>
              <div className="text-xs text-purple-300 mb-2 text-center">
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
                  <div className="bg-[#232946]/40 text-purple-300 rounded p-4 text-center text-xs">
                    PDF preview not available.
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-auto justify-center">
                {report.fileUrl && (
                  <a
                    href={report.fileUrl}
                    download={report.filename}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow transition"
                  >
                    Download
                  </a>
                )}
              </div>
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
