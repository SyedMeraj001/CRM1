import React, { useEffect, useState, useRef } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer
} from "recharts";
import Papa from "papaparse";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useNavigate } from "react-router-dom";

// Dummy data for demonstration
const COMPANIES = ["Dept A", "Dept B", "Dept C", "Dept D"];
const ESG_CATEGORIES = ["Environment", "Social", "Governance"];
const COLORS = ["#2563eb", "#10b981", "#f59e42", "#f87171"];
const sampleRisk = [
  { name: "Low", value: 60 },
  { name: "Medium", value: 30 },
  { name: "High", value: 10 },
];
export const sampleTrend = [
  { period: "2024-07", value: 110 },
  { period: "2024-08", value: 120 },
  { period: "2024-09", value: 130 },
  { period: "2024-10", value: 140 },
  { period: "2024-11", value: 135 },
  { period: "2024-12", value: 145 },
  { period: "2025-01", value: 150 },
  { period: "2025-02", value: 155 },
  { period: "2025-03", value: 160 },
  { period: "2025-04", value: 170 },
  { period: "2025-05", value: 175 },
  { period: "2025-06", value: 180 },
  { period: "2025-07", value: 185 },
];

// 1. Use a consistent color palette
const PALETTE = {
  cyan: "text-cyan-400",
  green: "text-green-400",
  red: "text-red-400",
  yellow: "text-yellow-400",
  purple: "text-purple-400",
  bgCard: "bg-white/10",
  borderCyan: "border-cyan-500",
  borderPurple: "border-purple-500",
  borderPink: "border-pink-500",
  borderGreen: "border-green-500",
  borderYellow: "border-yellow-400",
  borderRed: "border-red-500",
};

const REGIONS = ["North", "South", "East", "West"];

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
        <button
          className="absolute top-3 right-4 text-gray-500 hover:text-red-500 text-2xl"
          onClick={onClose}
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}

const samplePerformance = [
  { name: "Dept A", score: 85, category: "Environment", risk: "Low", region: "North" },
  { name: "Dept B", score: 72, category: "Social", risk: "Medium", region: "South" },
  { name: "Dept C", score: 90, category: "Governance", risk: "Low", region: "East" },
  { name: "Dept D", score: 65, category: "Environment", risk: "High", region: "West" },
];

export default function Analytics({ search = "" }) {
  const navigate = useNavigate();
  // Filters
  const [companyFilter, setCompanyFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [regionFilter, setRegionFilter] = useState("");
  // Data
  const [performance, setPerformance] = useState(samplePerformance);
  const [risk, setRisk] = useState(sampleRisk);
  const [trend, setTrend] = useState(sampleTrend);
  // KPI
  const [kpi, setKpi] = useState({
    totalCompanies: 4,
    avgEsg: 80.5,
    highRisk: 1,
    reportsThisMonth: 3,
    yoyChange: 8,
    momChange: 3,
  });
  // UI
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true); // Toggle for admin-only features
  const [snapshotList, setSnapshotList] = useState([]);
  const [drilldownData, setDrilldownData] = useState(null);
  const [lastSync, setLastSync] = useState(new Date());
  const [activityLog, setActivityLog] = useState([]);
  const autoRefreshRef = useRef();

  // Auto-refresh logic
  useEffect(() => {
    if (autoRefresh) {
      autoRefreshRef.current = setInterval(() => {
        // Fetch new data here
        // setPerformance(...), setRisk(...), setTrend(...)
        setLastSync(new Date());
      }, 30000);
    } else {
      clearInterval(autoRefreshRef.current);
    }
    return () => clearInterval(autoRefreshRef.current);
  }, [autoRefresh]);

  // Filtering logic
  const filteredPerformance = performance.filter(
    (row) =>
      (!companyFilter || row.name === companyFilter) &&
      (!categoryFilter || row.category === categoryFilter) &&
      (!regionFilter || row.region === regionFilter)
  );

  // Export handlers
  const handleExportCSV = () => {
    const csv = Papa.unparse(filteredPerformance);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "analytics_performance.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logActivity("User exported CSV");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Performance Benchmarking", 14, 20);
    doc.autoTable({
      startY: 30,
      head: [["Department", "Score", "Category", "Risk"]],
      body: filteredPerformance.map((row) => [row.name, row.score, row.category, row.risk]),
    });
    doc.save("analytics_performance.pdf");
    logActivity("User exported PDF");
  };

  // Download chart as image (for Recharts, use html2canvas as a workaround)
  const chartRef = useRef();
  const handleDownloadChart = async () => {
    if (!chartRef.current) return;
    const html2canvas = (await import("html2canvas")).default;
    html2canvas(chartRef.current).then((canvas) => {
      const link = document.createElement("a");
      link.download = "chart.png";
      link.href = canvas.toDataURL();
      link.click();
    });
    logActivity("User downloaded chart image");
  };

  // Save snapshot
  const handleSaveSnapshot = () => {
    setSnapshotList((prev) => [
      ...prev,
      {
        date: new Date().toLocaleString(),
        kpi: { ...kpi },
        filters: { companyFilter, categoryFilter, dateRange },
      },
    ]);
    logActivity("User saved snapshot");
  };

  // Email report (dummy)
  const handleEmailReport = () => {
    alert("Analytics summary PDF emailed!");
    logActivity("User emailed report");
  };

  // Drilldown handler
  const handleBarClick = (data) => {
    setDrilldownData(data); // Show modal with details
  };

  // Date range filter logic (for demo, not filtering sampleTrend)
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
    // Optionally, filter trend data here
  };

  // Risk color helper
  const riskColor = (risk) =>
    risk === "High"
      ? "bg-red-500"
      : risk === "Medium"
      ? "bg-yellow-400"
      : "bg-green-500";

  const logActivity = (msg) => setActivityLog(logs => [...logs, { msg, time: new Date() }]);

  const filteredPerformanceSearch = samplePerformance.filter(
    p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.risk.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#232946]/80 to-[#0f2027]/90 p-0 md:p-8">
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col gap-12">
        <header className="mb-8 flex items-center justify-between w-full">
          <h1 className="text-4xl font-extrabold tracking-wide text-pink-400 drop-shadow">
            Analytics Dashboard
          </h1>
        </header>

        {/* KPI Summary Cards */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
          <div className="glass-card flex flex-col items-center">
            <span className="text-3xl font-bold text-blue-400">{kpi.totalCompanies}</span>
            <span className="text-sm text-purple-200 mt-2">Total Companies Tracked</span>
          </div>
          <div className="glass-card flex flex-col items-center">
            <span className="text-3xl font-bold text-green-400">{kpi.avgEsg}</span>
            <span className="text-sm text-purple-200 mt-2">Avg ESG Score</span>
          </div>
          <div className="glass-card flex flex-col items-center">
            <span className="text-3xl font-bold text-red-400">{kpi.highRisk}</span>
            <span className="text-sm text-purple-200 mt-2">High-Risk Entities</span>
          </div>
          <div className="glass-card flex flex-col items-center">
            <span className="text-3xl font-bold text-purple-400">{kpi.reportsThisMonth}</span>
            <span className="text-sm text-purple-200 mt-2">Reports Submitted This Month</span>
          </div>
        </section>

        {/* Score Comparison */}
        <section className="flex flex-col md:flex-row gap-6 mb-4">
          <div className="glass-card flex-1 flex flex-col items-center border-t-4 border-cyan-500">
            <span className="text-lg text-cyan-100">YOY ESG Change</span>
            <span className={`text-2xl font-bold ${kpi.yoyChange >= 0 ? "text-green-400" : "text-red-400"}`}>
              {kpi.yoyChange >= 0 ? "+" : ""}
              {kpi.yoyChange}% <span className="text-base text-cyan-200">vs last year</span>
            </span>
          </div>
          <div className="glass-card flex-1 flex flex-col items-center border-t-4 border-cyan-500">
            <span className="text-lg text-cyan-100">MOM ESG Change</span>
            <span className={`text-2xl font-bold ${kpi.momChange >= 0 ? "text-green-400" : "text-red-400"}`}>
              {kpi.momChange >= 0 ? "+" : ""}
              {kpi.momChange}% <span className="text-base text-cyan-200">vs last month</span>
            </span>
          </div>
        </section>

        {/* Filters */}
        <section className="flex flex-col md:flex-row gap-4 items-center mb-4">
          <div className="flex gap-3 items-center">
            <label className="font-semibold text-cyan-100">Company:</label>
            <select
              className="bg-[#232946]/60 border border-pink-400 text-white px-4 py-2 rounded"
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
            >
              <option value="">All</option>
              {COMPANIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 items-center">
            <label className="font-semibold text-cyan-100">ESG Category:</label>
            <select
              className="bg-[#232946]/60 border border-pink-400 text-white px-4 py-2 rounded"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All</option>
              {ESG_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 items-center">
            <label className="font-semibold text-cyan-100">Date Range:</label>
            <input
              type="date"
              name="from"
              value={dateRange.from}
              onChange={handleDateChange}
              className="rounded px-3 py-2 bg-[#232946]/40 text-white border border-pink-400"
            />
            <span className="text-cyan-200">to</span>
            <input
              type="date"
              name="to"
              value={dateRange.to}
              onChange={handleDateChange}
              className="rounded px-3 py-2 bg-[#232946]/40 text-white border border-pink-400"
            />
          </div>
          <div className="flex gap-3 items-center">
            <label className="font-semibold text-cyan-100">Region:</label>
            <select
              className="bg-[#232946]/60 border border-pink-400 text-white px-4 py-2 rounded"
              value={regionFilter}
              onChange={e => setRegionFilter(e.target.value)}
            >
              <option value="">All</option>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex gap-3 items-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow font-semibold">
              Export CSV
            </button>
            <button
              className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded font-semibold transition text-white"
              onClick={handleExportPDF}         
            >
              Export PDF
            </button>
          </div>
        </section>

        {/* Performance Benchmarking */}
        <section className="glass-card rounded-3xl shadow-xl p-8 border-t-4 border-cyan-500 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none z-0">
            {/* Futuristic grid overlay */}
            <svg width="100%" height="100%" className="absolute inset-0" style={{ opacity: 0.15 }}>
              <defs>
                <linearGradient id="gridGradient" x1="0" y1="0" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#gridGradient)" />
              <g stroke="#a5b4fc" strokeWidth="0.5">
                {[...Array(20)].map((_, i) => (
                  <line key={i} x1={i * 40} y1="0" x2={i * 40} y2="100%" />
                ))}
                {[...Array(8)].map((_, i) => (
                  <line key={i} x1="0" y1={i * 40} x2="100%" y2={i * 40} />
                ))}
              </g>
            </svg> 
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold mb-4 text-cyan-400 tracking-widest uppercase drop-shadow-lg">
                Performance Benchmarking
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadChart}
                  className="bg-gradient-to-r from-cyan-500 to-purple-600 px-3 py-1 rounded font-semibold transition text-white shadow-lg hover:scale-105"
                >
                  <span className="material-icons align-middle mr-1">download</span> Chart
                </button>
                <button
                  onClick={handleSaveSnapshot}
                  className="bg-gradient-to-r from-purple-700 to-cyan-600 px-3 py-1 rounded font-semibold transition text-white shadow-lg hover:scale-105"
                >
                  <span className="material-icons align-middle mr-1">save</span> Snapshot
                </button>
              </div>
            </div>
            <div ref={chartRef} className="relative z-10">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={filteredPerformance}>
                  <XAxis dataKey="name" stroke="#22d3ee" tick={{ fontWeight: 'bold', fontSize: 14 }} />
                  <YAxis stroke="#a78bfa" tick={{ fontWeight: 'bold', fontSize: 14 }} />
                  <RechartsTooltip
                    contentStyle={{
                      background: "rgba(36, 36, 62, 0.95)",
                      border: "1px solid #22d3ee",
                      color: "#fff",
                      borderRadius: "1rem",
                      fontWeight: "bold"
                    }}
                  />
                  <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                    {filteredPerformance.map((entry, idx) => (
                      <Cell
                        key={entry.name}
                        fill={`url(#barGradient${idx})`}
                        cursor="pointer"
                        onClick={() => handleBarClick(entry)}
                      />
                    ))}
                  </Bar>
                  {/* Futuristic gradients for bars */}
                  <defs>
                    {filteredPerformance.map((_, idx) => (
                      <linearGradient key={idx} id={`barGradient${idx}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#a78bfa" />
                      </linearGradient>
                    ))}
                  </defs>
                </BarChart>
              </ResponsiveContainer>
              <div className="absolute top-2 right-4 text-xs text-cyan-300 font-mono opacity-80 animate-pulse">
                Real-time AI Insights
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-6 justify-center">
              {filteredPerformance.map((row, idx) => (
                <div
                  key={row.name}
                  className="bg-[#232946]/60 border border-cyan-500 rounded-xl px-6 py-4 flex flex-col items-center shadow-lg hover:scale-105 transition"
                  style={{ minWidth: 160 }}
                >
                  <span className="text-lg font-bold text-cyan-400 tracking-wide">{row.name}</span>
                  <span className="text-2xl font-extrabold text-purple-200 mt-2">{row.score}</span>
                  <span className="text-xs text-purple-300 mt-1">{row.category}</span>
                  <span className={`mt-2 px-2 py-1 rounded-full text-xs font-semibold ${row.risk === "High" ? "bg-red-500 text-white" : row.risk === "Medium" ? "bg-yellow-400 text-black" : "bg-green-500 text-white"}`}>
                    {row.risk} Risk
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Risk Analysis */}
        <section className="glass-card rounded-3xl shadow-xl p-8 border-t-4 border-pink-500 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none z-0">
            {/* Futuristic grid overlay */}
            <svg width="100%" height="100%" className="absolute inset-0" style={{ opacity: 0.12 }}>
              <defs>
                <linearGradient id="riskGridGradient" x1="0" y1="0" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#riskGridGradient)" />
              <g stroke="#f59e42" strokeWidth="0.5">
                {[...Array(16)].map((_, i) => (
                  <line key={i} x1={i * 50} y1="0" x2={i * 50} y2="100%" />
                ))}
                {[...Array(6)].map((_, i) => (
                  <line key={i} x1="0" y1={i * 50} x2="100%" y2={i * 50} />
                ))}
              </g>
            </svg>
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-6 text-pink-400">Risk Analysis</h2>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <ResponsiveContainer width="100%" height={220} className="md:w-1/2">
                <PieChart>
                  <Pie
                    data={risk}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {risk.map((entry, idx) => (
                      <Cell
                        key={entry.name}
                        fill={
                          entry.name === "High"
                            ? "#f43f5e"
                            : entry.name === "Medium"
                            ? "#f59e42"
                            : "#22d3ee"
                        }
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 md:w-1/2">
                {risk.map((r) => (
                  <div key={r.name} className="flex items-center gap-3">
                    <span
                      className={`inline-block w-4 h-4 rounded-full ${
                        r.name === "High"
                          ? "bg-red-500"
                          : r.name === "Medium"
                          ? "bg-yellow-400"
                          : "bg-cyan-400"
                      }`}
                    ></span>
                    <span className="text-lg font-semibold">{r.name}</span>
                    <span className="ml-auto text-lg">{r.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Trend Analysis */}
        <section className="glass-card rounded-3xl shadow-xl p-8 border-t-4 border-purple-500 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none z-0">
            {/* Futuristic grid overlay */}
            <svg width="100%" height="100%" className="absolute inset-0" style={{ opacity: 0.10 }}>
              <defs>
                <linearGradient id="trendGridGradient" x1="0" y1="0" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#trendGridGradient)" />
              <g stroke="#a5b4fc" strokeWidth="0.5">
                {[...Array(12)].map((_, i) => (
                  <line key={i} x1={i * 60} y1="0" x2={i * 60} y2="100%" />
                ))}
                {[...Array(5)].map((_, i) => (
                  <line key={i} x1="0" y1={i * 60} x2="100%" y2={i * 60} />
                ))}
              </g>
            </svg>
          </div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <h2 className="text-2xl font-bold text-purple-400">Trend Analysis</h2>
              <div className="flex gap-3">
                <button
                  className="bg-purple-600 text-white px-4 py-2 rounded-xl font-semibold"
                  onClick={() => setTrend(sampleTrend)}
                >
                  Custom Range
                </button>
                <button
                  className={`px-4 py-2 rounded-xl font-semibold transition ${
                    autoRefresh
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                  }`}
                  onClick={() => setAutoRefresh((v) => !v)}
                >
                  {autoRefresh ? "Auto-Refresh: ON" : "Auto-Refresh: OFF"}
                </button>
                <button
                  onClick={handleEmailReport}
                  className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded font-semibold transition"
                >
                  Email Report
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trend}>
                <XAxis dataKey="period" stroke="#a5b4fc" />
                <YAxis stroke="#a5b4fc" />
                <RechartsTooltip />
                <Line type="monotone" dataKey="value" stroke="#a78bfa" strokeWidth={3} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Snapshots */}
        {snapshotList.length > 0 && (
          <section className="glass-card rounded-2xl shadow p-6 mt-6">
            <h2 className="text-xl font-bold mb-4 text-cyan-400">Saved Snapshots</h2>
            <ul className="space-y-2">
              {snapshotList.map((snap, idx) => (
                <li key={idx} className="flex flex-col md:flex-row md:items-center md:gap-6">
                  <span className="text-cyan-100">{snap.date}</span>
                  <span className="text-sm text-green-100">Avg ESG: {snap.kpi.avgEsg}</span>
                  <span className="text-sm text-red-200">High Risk: {snap.kpi.highRisk}</span>
                  <span className="text-sm text-purple-100">Reports: {snap.kpi.reportsThisMonth}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Admin-only toggles */}
        {isAdmin && (
          <section>
            {/* Admin-only controls */}
          </section>
        )}

        {/* Render a modal if drilldownData is set */}
        {drilldownData && (
          <Modal onClose={() => setDrilldownData(null)}>
            {/* Show detailed analytics for drilldownData */}
          </Modal>
        )}

        {/* User Activity Log */}
        <section className="glass-card rounded-xl shadow p-4 mt-6">
          <h2 className="text-lg font-bold mb-2 text-pink-400">User Activity Log</h2>
          <ul className="text-xs text-purple-200 space-y-1">
            {activityLog.map((log, i) => (
              <li key={i}>{log.time.toLocaleTimeString()} — {log.msg}</li>
            ))}
          </ul>
        </section>
      </div>
      <footer className="w-full mt-12 py-6 flex justify-center items-center">
        <p className="text-purple-200 text-center text-lg font-semibold glow-text">
          Visualize performance, risk, and trends in real time
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
          text-shadow: 0 0 8px #22d3ee, 0 0 16px #a78bfa;
        }
      `}</style>
    </div>
  );
}