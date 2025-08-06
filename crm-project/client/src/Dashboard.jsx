import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,                                                                                                                                                        
  Legend,
} from 'chart.js';
import ActivityTracker from "./pages/ActivityTracker";
import Analytics, { sampleTrend } from "./pages/Analytics";
import { ActiveCompanies } from "./pages/companies";
import Compliances from "./pages/Compliances";
import Contacts from "./pages/Contacts";
import Notifications from "./pages/Notifications";
import LeadPipeline, { getMarketingLeadsCount } from "./pages/LeadPipeline";
import Reminders from "./pages/Reminders";
import Reports from "./pages/Reports";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const recentActivities = [
  {
    type: "Meeting",
    title: "Kickoff with ABC Corp",
    timestamp: "2025-07-24 10:00",
  },
  {
    type: "Call",
    title: "Call with XYZ Pvt Ltd",
    timestamp: "2025-07-25 14:30",
  },
];

// Example: Use your reminders array or fetch from state/store/API
const reminders = [
  { task: "Call Client", due: "Tomorrow" },
  { task: "Send ESG Update", due: "2 days" },
];

const employees = [
  { name: "Evan Morales", role: "Product Manager" },
  { name: "Kenneth Osborne", role: "Analyst" },
];

// Prepare chart.js data from analytics trend
const salesChartData = {
  labels: sampleTrend.map((d) => d.period),
  datasets: [
    {
      label: "Sales Trend",
      data: sampleTrend.map((d) => d.value),
      borderColor: "#a78bfa",
      backgroundColor: "rgba(167,139,250,0.2)",
      tension: 0.4,
      pointRadius: 6,
      pointHoverRadius: 10,
    },
  ],
};

const eventsChartData = {
  labels: [
    "2025-07-01",
    "2025-07-05",
    "2025-07-10",
    "2025-07-15",
    "2025-07-20",
    "2025-07-25",
    "2025-07-29",
  ],
  datasets: [
    {
      label: "Events",
      data: [12, 19, 7, 14, 10, 16, 9],
      borderColor: "#22d3ee",
      backgroundColor: "rgba(34,211,238,0.2)",
      tension: 0.4,
      pointRadius: 6,
      pointHoverRadius: 10,
    },
  ],
};

const eventsChartOptions = {
  responsive: true,
  plugins: {
    legend: { display: true },
    tooltip: { enabled: true },
  },
  hover: {
    mode: 'nearest',
    intersect: true,
  },
  scales: {
    x: { grid: { color: '#444' }, ticks: { color: '#ccc' } },
    y: { grid: { color: '#444' }, ticks: { color: '#ccc' } },
  },
};

const salesChartOptions = {
  responsive: true,
  plugins: {
    legend: { display: true },
    tooltip: { enabled: true },
  },
  hover: {
    mode: 'nearest',
    intersect: true,
  },
  scales: {
    x: { grid: { color: '#444' }, ticks: { color: '#ccc' } },
    y: { grid: { color: '#444' }, ticks: { color: '#ccc' } },
  },
};

const sidebarLinks = [
  { to: "/dashboard", label: "Dashboard" }, // Always first
  { to: "/activity", label: "Activity Tracker", component: ActivityTracker },
  { to: "/analytics", label: "Analytics", component: Analytics },
  { to: "/companies", label: "Companies", component: ActiveCompanies },
  { to: "/compliances", label: "Compliances", component: Compliances },
  { to: "/contacts", label: "Contacts", component: Contacts },
  { to: "/notifications", label: "Notifications", component: Notifications },
  { to: "/pipeline", label: "Lead Status Pipeline", component: LeadPipeline },
  { to: "/reminders", label: "Reminders", component: Reminders },
  { to: "/reports", label: "Reports", component: Reports },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [marketingLeads, setMarketingLeads] = useState(getMarketingLeadsCount());
  const [typedText, setTypedText] = useState('');
  const navigate = useNavigate();

  // Always get username and role from localStorage at the top
  const role = localStorage.getItem("role") || "user";
  const username = localStorage.getItem("username") || (role === "admin" ? "Admin" : "User");

  // Find the active module component
  const activeModule =
    sidebarLinks.find((item) => item.to === `/${activeTab}`)?.component || null;

  // Filter reminders and activities based on search
  const filteredReminders = reminders.filter(
    (rem) =>
      rem.task.toLowerCase().includes(search.toLowerCase()) ||
      rem.due.toLowerCase().includes(search.toLowerCase())
  );

  const filteredActivities = recentActivities.filter(
    (a) =>
      a.type.toLowerCase().includes(search.toLowerCase()) ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.timestamp.toLowerCase().includes(search.toLowerCase())
  );

  // Example notifications array (replace with your actual notifications source if needed)
  const notifications = [
    { type: "Alert", title: "New compliance deadline", timestamp: "2025-07-28 09:00" },
    { type: "Reminder", title: "Submit Q2 ESG report", timestamp: "2025-07-27 16:30" },
  ];

  // Filter notifications based on search
  const filteredNotifications = notifications.filter(
    (n) =>
      n.type.toLowerCase().includes(search.toLowerCase()) ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.timestamp.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const interval = setInterval(() => {
      // fetch new reminders/notifications from backend
      setMarketingLeads(getMarketingLeadsCount());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const welcomeText = `Welcome back, ${username}!`;
    setTypedText('');
    let i = 0;
    const interval = setInterval(() => {
      setTypedText((prev) => prev + welcomeText[i]);
      i++;
      if (i >= welcomeText.length) clearInterval(interval);
    }, 80);
    return () => clearInterval(interval);
  }, [username]);

  return (
    <div className="flex min-h-screen bg-gradient-to-tr from-[#0f2027] via-[#2c5364] to-[#24243e] text-white font-sans">
      {/* Sidebar */}
      <aside className="w-64 min-h-screen bg-[#0a1026] shadow-xl p-6 flex flex-col sidebar-animate">
        {/* User Profile Section */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="/assets/logo1.png"
            alt="Logo"
            className="h-24 mb-2 drop-shadow-glow"
          />
          <div className="text-lg font-bold text-white mt-2">
            {localStorage.getItem("username") || (role === "admin" ? "Admin" : "User")}
          </div>
          <div className="text-xs text-purple-300 font-semibold">
            {role === "admin" ? "Admin" : "User"}
          </div>
        </div>
        {/* Navigation */}
        <nav className="flex-1 space-y-3 text-base font-medium">
          {[
            sidebarLinks[0],
            ...sidebarLinks.slice(1).sort((a, b) => a.label.localeCompare(b.label)),
          ].map((item, idx) => {
            const isActive =
              (item.to === "/dashboard" && activeTab === "dashboard") ||
              (item.to !== "/dashboard" && item.to === `/${activeTab}`);
            return (
              <button
                key={item.to}
                onClick={() => {
                  setActiveTab(item.to.replace("/", ""));
                  if (item.to === "/dashboard") navigate("/dashboard");
                }}
                className={
                  "relative flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 font-semibold group overflow-hidden " +
                  (isActive
                    ? "sidebar-active-glow bg-gradient-to-r from-pink-500 to-purple-600 text-white scale-105 shadow-xl"
                    : "hover:bg-[#232946] hover:text-pink-400 text-purple-200")
                }
              >
                {/* Animated left bar for active */}
                <span
                  className={
                    "absolute left-0 top-0 h-full w-1 rounded bg-gradient-to-b from-pink-400 to-purple-600 transition-all duration-300 " +
                    (isActive ? "opacity-100" : "opacity-0 group-hover:opacity-60")
                  }
                ></span>
                <span className="ml-2">{item.label}</span>
              </button>
            );
          })}
          {/* Logout Option */}
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            className="block w-full mt-8 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-2 rounded-xl shadow-lg hover:scale-105 transition-transform"
          >
            Logout
          </button>
        </nav>
        {/* Sidebar Footer */}
        <div className="mt-8 pt-6 border-t border-purple-900 flex flex-col items-center">
          <button
            className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#232946] text-purple-200 hover:bg-purple-700 hover:text-white transition"
          >
            <span className="text-lg">🌗</span>
            <span className="text-xs font-semibold">Theme</span>
          </button>
          <div className="text-xs text-purple-700 mt-4">© 2025 CMR</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gradient-to-br from-[#232946]/60 to-[#0f2027]/80 p-10 overflow-y-auto">
        {/* Global Search Bar */}
        <div className="w-full max-w-2xl mx-auto mb-8">
          <input
            type="text"
            placeholder="Search company, standard, year, reminders, etc..."
            className="w-full p-3 rounded-lg bg-[#232946] text-sm text-white placeholder-gray-400 border border-[#2c5364] focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {/* Render the selected module, or dashboard content if on dashboard */}
        {activeTab === "dashboard" ? (
          <>
            {/* Welcome Banner */}
            <div className="glass-card mb-8 flex items-center justify-between px-8 py-6 bg-gradient-to-r from-pink-500/30 to-purple-600/30 shadow-lg animate-fade-in">
              <div>
                <h2 className="text-2xl font-bold text-pink-300">
                  <span>{typedText}</span>
                  <span className="animate-pulse text-pink-400">|</span>
                </h2>
                <p className="text-purple-200 mt-1">
                  Here's a quick overview of your platform today.
                </p>
              </div>
              <span className="text-5xl animate-wiggle">🚀</span>
            </div>

            {/* Animated Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="glass-card flex flex-col items-center animate-fade-in">
                <span className="text-4xl font-extrabold text-pink-400 animate-bounce">23,342</span>
                <span className="text-lg text-purple-200 mt-2">Online Users</span>
              </div>
              <div className="glass-card flex flex-col items-center animate-fade-in">
                <span className="text-4xl font-extrabold text-blue-400 animate-pulse">13,221</span>
                <span className="text-lg text-purple-200 mt-2">Offline Users</span>
              </div>
              <div className="glass-card flex flex-col items-center animate-fade-in">
                <span className="text-4xl font-extrabold text-yellow-300 animate-bounce">{marketingLeads}</span>
                <span className="text-lg text-purple-200 mt-2">Marketing Leads</span>
              </div>
            </div>

            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
              {/* Performance Benchmarking (from Analytics) */}
              <div className="glass-card">
                <p className="text-lg font-semibold mb-2 text-purple-300">Performance Benchmarking</p>
                <Line
                  data={{
                    labels: ["Industry Avg.", "Your Score", "Top Performer", "Peers Avg."],
                    datasets: [
                      {
                        label: "Score (%)",
                        data: [87, 92, 98, 85],
                        backgroundColor: [
                          "rgba(236, 72, 153, 0.5)",
                          "rgba(59, 130, 246, 0.5)",
                          "rgba(34, 197, 94, 0.5)",
                          "rgba(253, 224, 71, 0.5)"
                        ],
                        borderColor: [
                          "#ec4899",
                          "#3b82f6",
                          "#22c55e",
                          "#fde047"
                        ],
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 6,
                        pointHoverRadius: 10,
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: false },
                      tooltip: { enabled: true }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { color: "#fff" },
                        grid: { color: "#444" }
                      },
                      x: {
                        ticks: { color: "#fff" },
                        grid: { color: "#444" }
                      }
                    }
                  }}
                />
              </div>
              
              {/* Events */}
              <div className="glass-card">
                <p className="text-lg font-semibold mb-2 text-purple-300">Events</p>
                <Line data={eventsChartData} options={eventsChartOptions} />
              </div>
              
              {/* Device Stats */}
              <div className="glass-card space-y-2">
                <p className="text-lg font-semibold text-purple-300">Device Stats</p>
                <p>Uptime: <span className="text-purple-100">195 Days, 8 hours</span></p>
                <p>First Seen: <span className="text-purple-100">23 Sep 2019, 2:04PM</span></p>
                <p>Collected time: <span className="text-purple-100">23 Sep 2019, 2:04PM</span></p>
                <p>Memory space: 168.3GB</p>
                <div className="w-full h-2 bg-purple-900/30 rounded">
                  <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded w-5/6"></div>
                </div>
              </div>

              {/* Reminders Card */}
              <div className="glass-card">
                <p className="text-lg font-semibold mb-2 text-purple-300">Reminders (Live)</p>
                <ul className="mt-4 text-base space-y-1 text-purple-100">
                  {filteredReminders.length === 0 ? (
                    <li className="text-purple-400">No reminders found.</li>
                  ) : (
                    filteredReminders.map((rem, idx) => (
                      <li key={idx}>
                        <span className="font-bold text-pink-400">{rem.task}</span>
                        <span className="ml-2 text-xs text-purple-200">({rem.due})</span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
              {/* Real-Time Notifications & Alerts */}
              <div className="glass-card">
                <p className="text-lg font-semibold mb-2 text-purple-300">Real-Time Notifications & Alerts</p>
                <ul className="text-base text-purple-100 space-y-1">
                  {filteredNotifications.length === 0 ? (
                    <li className="text-purple-400">No notifications found.</li>
                  ) : (
                    filteredNotifications.slice(0, 6).map((n, i) => (
                      <li key={i}>
                        <span className="font-bold text-pink-400">{n.type}:</span> {n.title}
                        <span className="block text-xs text-purple-300">{n.timestamp}</span>
                      </li>
                    ))
                  )}
                </ul>
                <Link to="/notifications" className="text-pink-400 hover:underline text-xs mt-2 block">View All</Link>
              </div>

              {/* Sales Analytics (visible to all) */}
              <div className="glass-card">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-lg font-semibold text-purple-300">Sales Analytics</p>
                  <span className="text-xs text-purple-200">Month</span>
                </div>
                <p className="text-pink-400">Online: 23,342</p>
                <p className="text-blue-400">Offline: 13,221</p>
                <p className="text-yellow-300">Marketing: 1,542</p>
                <Line data={salesChartData} options={salesChartOptions} />
              </div>
            </div>
            {/* Removed Recent Activities and Admin-only Sales Analytics cards */}
          </>
        ) : (
          activeModule && React.createElement(activeModule, { search })
        )}
      </main>
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
          box-shadow: 0 12px 40px 0 rgba(255, 0, 128, 0.35), 0 8px 32px 0 rgba(31, 38, 135, 0.47);
          transform: translateY(-8px) scale(1.04) rotate(-1deg);
          border-color: #e879f9;
        }
        .animate-fade-in {
          animation: fadeIn 0.7s;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px);}
          to { opacity: 1; transform: none;}
        }
        .sidebar-animate {
          animation: sidebarFadeIn 0.9s cubic-bezier(.4,2,.6,1) both;
        }
        @keyframes sidebarFadeIn {
          from { opacity: 0; transform: translateX(-40px);}
          to { opacity: 1; transform: none;}
        }
        .sidebar-active-glow {
          box-shadow: 0 0 0 3px #a78bfa55, 0 0 16px #e879f9cc;
          border: 2px solid #a78bfa;
        }
        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px #e879f9) drop-shadow(0 0 16px #a78bfa);
        }
        @keyframes profilePop {
          0% { transform: scale(0.7); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-profile-pop {
          animation: profilePop 0.7s cubic-bezier(.4,2,.6,1) both;
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg);}
          50% { transform: rotate(3deg);}
        }
        .animate-wiggle {
          animation: wiggle 1.2s infinite;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;

