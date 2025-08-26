import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import { Line } from 'react-chartjs-2';
import { FiBarChart2, FiUsers, FiTrendingUp, FiDollarSign, FiBell, FiMessageCircle, FiSettings, FiActivity, FiFileText, FiUser, FiPieChart } from 'react-icons/fi';
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
import MagicBento from "./components/MagicBento";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

// ...existing code...

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
  // Data states for backend-fetched content
  const [recentActivities, setRecentActivities] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [kpiData, setKpiData] = useState({ revenue: 0, leads: 0, conversion: 0, companies: 0 });
  const [metrics, setMetrics] = useState({ esg: 0, tasks: 0, compliance: 0, tickets: 0 });

  // Chart data states
  const [salesChartData, setSalesChartData] = useState({ labels: [], datasets: [] });
  const [eventsChartData, setEventsChartData] = useState({ labels: [], datasets: [] });

  const [activeTab, setActiveTab] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [typedText, setTypedText] = useState('');
  const [globalResults, setGlobalResults] = useState({});
  const [loadingSearch, setLoadingSearch] = useState(false);
  const searchTimeout = useRef();
  const navigate = useNavigate();

  // Always get username and role from localStorage at the top
  const role = localStorage.getItem("role") || "user";
  const username = localStorage.getItem("username") || (role === "admin" ? "Admin" : "User");

  // Find the active module component
  const activeModule =
    sidebarLinks.find((item) => item.to === `/${activeTab}`)?.component || null;


  // Global search: call backend
  useEffect(() => {
    if (!search || search.length < 2) {
      setGlobalResults({});
      return;
    }
    setLoadingSearch(true);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await axios.get(`/api/global-search?q=${encodeURIComponent(search)}`);
        // Group by type
        const grouped = {};
        (res.data.results || []).forEach(item => {
          if (!grouped[item.type]) grouped[item.type] = [];
          grouped[item.type].push(item);
        });
        setGlobalResults(grouped);
      } catch (err) {
        setGlobalResults({});
      } finally {
        setLoadingSearch(false);
      }
    }, 350); // debounce
    // eslint-disable-next-line
  }, [search]);

  // Fetch dashboard data from backend
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [kpiRes, metricsRes, activitiesRes, remindersRes, notificationsRes, salesRes, eventsRes] = await Promise.all([
          axios.get("/api/dashboard/kpi"),
          axios.get("/api/dashboard/metrics"),
          axios.get("/api/activities"),
          axios.get("/api/reminders"),
          axios.get("/api/notifications"),
          axios.get("/api/analytics/sales"),
          axios.get("/api/analytics/events"),
        ]);
        setKpiData(kpiRes.data);
        setMetrics(metricsRes.data);
        setRecentActivities(activitiesRes.data);
        setReminders(remindersRes.data);
        setNotifications(notificationsRes.data);
        setSalesChartData(salesRes.data);
        setEventsChartData(eventsRes.data);
      } catch (err) {
        // fallback: show empty or error state
      }
    }
    fetchDashboardData();
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
  <div className="flex min-h-screen bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460] text-white font-sans" style={{ fontFamily: 'Inter, Poppins, sans-serif' }}>
      {/* Sidebar */}
  <aside className="w-72 min-h-screen bg-gradient-to-b from-[#16213E] to-[#0F3460] text-white shadow-xl p-6 flex flex-col sidebar-animate" style={{ borderRight: '1px solid #00ADB5', boxShadow: '0 8px 32px 0 rgba(0,173,181,0.18)' }}>
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <img src="/assets/logo1.png" alt="Logo" className="h-12 w-12 rounded-full shadow" />
            <span className="text-2xl font-extrabold tracking-wide text-[#00ADB5]"> CRM</span>
          </div>
          <div className="flex flex-col items-center mt-2">
            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="avatar" className="h-14 w-14 rounded-full border-2 border-[#00ADB5] shadow" />
            <div className="text-base font-bold text-white mt-2">{username}</div>
            <div className="text-xs text-[#00ADB5] font-semibold">{role.charAt(0).toUpperCase() + role.slice(1)}</div>
          </div>
        </div>
        {/* Navigation */}
        <nav className="flex-1 space-y-2 text-base font-medium">
          {[
            { to: "/dashboard", label: "Dashboard", icon: <FiBarChart2 /> },
            { to: "/analytics", label: "Analytics", icon: <FiPieChart /> },
            { to: "/reports", label: "Reports", icon: <FiFileText /> },
            { to: "/contacts", label: "Contacts", icon: <FiUser /> },
            { to: "/activity", label: "Activity Tracker", icon: <FiActivity /> },
            { to: "/compliances", label: "Compliances", icon: <FiTrendingUp /> },
            { to: "/companies", label: "Companies", icon: <FiUsers /> },
            { to: "/notifications", label: "Notifications", icon: <FiBell /> },
            { to: "/pipeline", label: "Lead Status Pipeline", icon: <FiTrendingUp /> },
            { to: "/reminders", label: "Reminders", icon: <FiMessageCircle /> },
          ].map((item) => {
            const isActive = (item.to === "/dashboard" && activeTab === "dashboard") || (item.to !== "/dashboard" && item.to === `/${activeTab}`);
            return (
              <button
                key={item.to}
                onClick={() => {
                  setActiveTab(item.to.replace("/", ""));
                  if (item.to === "/dashboard") navigate("/dashboard");
                }}
                className={
                  "flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 font-semibold " +
                  (isActive ? "bg-[#00ADB5] text-white shadow" : "hover:bg-[#FF5722] text-white")
                }
                style={isActive ? { boxShadow: '0 2px 8px 0 #00ADB5' } : {}}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            className="block w-full mt-8 bg-gradient-to-r from-[#00ADB5] to-[#FF5722] text-white font-bold py-2 rounded-xl shadow-lg hover:scale-105 transition-transform"
          >
            Logout
          </button>
        </nav>
        {/* Sidebar Footer Illustration */}
        <div className="mt-8 pt-6 border-t border-[#00ADB5] flex flex-col items-center">
          <div className="w-32 h-20 bg-[#16213E] rounded-xl flex items-center justify-center mb-2">
            <img src="/assets/logo.png" alt="CRM Graphic" className="h-12 w-12" />
          </div>
          <div className="text-xs text-[#00ADB5] mt-2 font-semibold">CRM made friendly</div>
        </div>
      </aside>

      {/* Main Content */}
  <main className="flex-1 bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460] p-0 overflow-y-auto">
        {/* Top Header Bar */}
  <header className="flex items-center justify-between px-10 py-6 border-b border-[#00ADB5] bg-gradient-to-r from-[#16213E] to-[#0F3460] text-white backdrop-blur-md sticky top-0 z-10 shadow-lg">
          <div className="flex-1 max-w-lg relative">
            <input
              type="text"
              placeholder="Global Search..."
              className="w-full px-5 py-3 rounded-full bg-[#16213E]/80 border border-[#00ADB5] text-base text-white placeholder-[#B8C1EC] focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ fontFamily: 'Inter, Poppins, sans-serif' }}
            />
            {search && (
              <div className="absolute left-0 right-0 mt-2 bg-[#232946] rounded-xl shadow-lg z-50 p-4 border border-[#00ADB5] max-h-96 overflow-y-auto">
                {loadingSearch ? (
                  <div className="text-center text-purple-300">Searching...</div>
                ) : (
                  Object.entries(globalResults).length > 0 ? (
                    Object.entries(globalResults).map(([type, results]) =>
                      results.length > 0 ? (
                        <div key={type} className="mb-4">
                          <div className="text-[#00ADB5] font-bold mb-2 text-lg">{type.charAt(0).toUpperCase() + type.slice(1)}</div>
                          <ul className="space-y-2">
                            {results.slice(0, 5).map((item, idx) => (
                              <li key={idx} className="bg-[#16213E]/60 rounded px-3 py-2 text-sm text-white">
                                {type === 'company' && (
                                  <span>Name: <span className="font-bold">{item.name}</span> | Industry: {item.industry}</span>
                                )}
                                {type === 'contact' && (
                                  <span>Name: <span className="font-bold">{item.name}</span> | Email: {item.email} | Company: {item.company}</span>
                                )}
                                {type === 'lead' && (
                                  <span>Name: <span className="font-bold">{item.name}</span> | Status: {item.status} | Company: {item.company}</span>
                                )}
                                {type === 'report' && (
                                  <span>Company: <span className="font-bold">{item.company}</span> | Year: {item.year} | ESG: {item.esg_score}</span>
                                )}
                                {type === 'compliance' && (
                                  <span>Name: <span className="font-bold">{item.name}</span> | Status: {item.status}</span>
                                )}
                              </li>
                            ))}
                            {results.length > 5 && (
                              <li className="text-xs text-[#B8C1EC]">...and {results.length - 5} more</li>
                            )}
                          </ul>
                        </div>
                      ) : null
                    )
                  ) : (
                    <div className="text-center text-purple-300">No results found.</div>
                  )
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-6 ml-8">
            <button className="relative text-2xl text-[#00ADB5] hover:text-[#FF5722]">
              <FiBell />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#6A5ACD] rounded-full border-2 border-white"></span>
            </button>
            <button className="text-2xl text-[#00ADB5] hover:text-[#FF5722]">
              <FiMessageCircle />
            </button>
            <button className="text-2xl text-[#00ADB5] hover:text-[#FF5722]">
              <FiSettings />
            </button>
            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="avatar" className="h-10 w-10 rounded-full border-2 border-[#00ADB5] shadow" />
          </div>
        </header>
        {/* Main Content Grid */}
        <div className="p-10">
          {activeTab === "dashboard" ? (
            <>
              {/* Top Row: KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                {/* KPI Card 1 */}
                <div className="bg-gradient-to-br from-[#16213E] to-[#0F3460] rounded-2xl shadow-xl p-6 flex flex-col gap-2 min-h-[140px] border border-[#00ADB5] text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <FiDollarSign className="text-2xl text-[#00ADB5]" />
                    <span className="text-xs font-semibold text-[#00ADB5]">Total Revenue</span>
                  </div>
                  <span className="text-3xl font-extrabold text-white">${kpiData.revenue}</span>
                  <span className="text-xs text-[#B8C1EC]">This year</span>
                </div>
                {/* KPI Card 2 */}
                <div className="bg-gradient-to-br from-[#16213E] to-[#0F3460] rounded-2xl shadow-xl p-6 flex flex-col gap-2 min-h-[140px] border border-[#00ADB5] text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <FiUsers className="text-2xl text-[#00ADB5]" />
                    <span className="text-xs font-semibold text-[#00ADB5]">New Leads</span>
                  </div>
                  <span className="text-3xl font-extrabold text-white">{kpiData.leads}</span>
                  <span className="text-xs text-[#B8C1EC]">This month</span>
                </div>
                {/* KPI Card 3 */}
                <div className="bg-gradient-to-br from-[#16213E] to-[#0F3460] rounded-2xl shadow-xl p-6 flex flex-col gap-2 min-h-[140px] border border-[#00ADB5] text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <FiTrendingUp className="text-2xl text-[#00ADB5]" />
                    <span className="text-xs font-semibold text-[#00ADB5]">Conversion Rate</span>
                  </div>
                  <span className="text-3xl font-extrabold text-white">{kpiData.conversion}%</span>
                  <span className="text-xs text-[#B8C1EC]">This quarter</span>
                </div>
                {/* KPI Card 4 */}
                <div className="bg-gradient-to-br from-[#16213E] to-[#0F3460] rounded-2xl shadow-xl p-6 flex flex-col gap-2 min-h-[140px] border border-[#00ADB5] text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <FiPieChart className="text-2xl text-[#00ADB5]" />
                    <span className="text-xs font-semibold text-[#00ADB5]">Active Companies</span>
                  </div>
                  <span className="text-3xl font-extrabold text-white">{kpiData.companies}</span>
                  <span className="text-xs text-[#B8C1EC]">Now</span>
                </div>
              </div>
              {/* Second Row: Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div className="bg-gradient-to-br from-[#16213E] to-[#0F3460] rounded-2xl shadow p-5 flex flex-col gap-2 min-h-[120px] border border-[#00ADB5] text-white">
                  <span className="text-base font-semibold text-white">ESG Score</span>
                  <span className="text-2xl font-bold text-[#00ADB5]">{metrics.esg}</span>
                  <button className="mt-auto bg-gradient-to-r from-[#00ADB5] to-[#FF5722] text-white rounded-lg px-3 py-1 text-xs font-semibold">View</button>
                </div>
                <div className="bg-[#16213E] rounded-2xl shadow p-5 flex flex-col gap-2 min-h-[120px] border border-[#00ADB5] text-white">
                  <span className="text-base font-semibold text-white">Pending Tasks</span>
                  <span className="text-2xl font-bold text-[#00ADB5]">{metrics.tasks}</span>
                  <button className="mt-auto bg-gradient-to-r from-[#00ADB5] to-[#FF5722] text-white rounded-lg px-3 py-1 text-xs font-semibold">View</button>
                </div>
                <div className="bg-[#16213E] rounded-2xl shadow p-5 flex flex-col gap-2 min-h-[120px] border border-[#00ADB5] text-white">
                  <span className="text-base font-semibold text-white">Compliance Rate</span>
                  <span className="text-2xl font-bold text-[#00ADB5]">{metrics.compliance}%</span>
                  <button className="mt-auto bg-gradient-to-r from-[#00ADB5] to-[#FF5722] text-white rounded-lg px-3 py-1 text-xs font-semibold">View</button>
                </div>
                <div className="bg-[#16213E] rounded-2xl shadow p-5 flex flex-col gap-2 min-h-[120px] border border-[#00ADB5] text-white">
                  <span className="text-base font-semibold text-white">Open Tickets</span>
                  <span className="text-2xl font-bold text-[#00ADB5]">{metrics.tickets}</span>
                  <button className="mt-auto bg-gradient-to-r from-[#00ADB5] to-[#FF5722] text-white rounded-lg px-3 py-1 text-xs font-semibold">View</button>
                </div>
              </div>
              {/* Third Row: Data Visualization Charts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* Bar Chart 1 */}
                <div className="bg-[#16213E] rounded-2xl shadow p-6 border border-[#00ADB5]">
                  <span className="text-base font-semibold text-white mb-2 block">Leads by Source</span>
                  {eventsChartData && eventsChartData.labels && eventsChartData.labels.length > 0 && eventsChartData.datasets && eventsChartData.datasets.length > 0 ? (
                    <Line data={eventsChartData} options={eventsChartOptions} height={120} />
                  ) : (
                    <div className="text-[#B8C1EC] text-sm py-8 text-center">No event data available</div>
                  )}
                </div>
                {/* Bar Chart 2 */}
                <div className="bg-[#16213E] rounded-2xl shadow p-6 border border-[#00ADB5]">
                  <span className="text-base font-semibold text-white mb-2 block">Revenue Trend</span>
                  {salesChartData && salesChartData.labels && salesChartData.labels.length > 0 && salesChartData.datasets && salesChartData.datasets.length > 0 ? (
                    <Line data={salesChartData} options={salesChartOptions} height={120} />
                  ) : (
                    <div className="text-[#B8C1EC] text-sm py-8 text-center">No sales data available</div>
                  )}
                </div>
                {/* Area Chart */}
                <div className="bg-[#16213E] rounded-2xl shadow p-6 border border-[#00ADB5]">
                  <span className="text-base font-semibold text-white mb-2 block">Engagement</span>
                  {salesChartData && salesChartData.labels && salesChartData.labels.length > 0 && salesChartData.datasets && salesChartData.datasets.length > 0 ? (
                    <Line data={salesChartData} options={{ ...salesChartOptions, elements: { line: { fill: true, backgroundColor: 'rgba(106,90,205,0.15)' } } }} height={120} />
                  ) : (
                    <div className="text-[#B8C1EC] text-sm py-8 text-center">No engagement data available</div>
                  )}
                </div>
              </div>
              {/* Bottom Row: Mixed Content Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* Large Dollar Card */}
                <div className="bg-[#16213E] rounded-2xl shadow p-8 flex flex-col items-center justify-center min-h-[120px] border border-[#00ADB5]">
                  <span className="text-4xl font-extrabold text-[#00ADB5]">${kpiData.outstandingPayments || 0}</span>
                  <span className="text-xs text-[#B8C1EC] mt-2">Outstanding Payments</span>
                </div>
                {/* Recent Activity Feed */}
                <div className="bg-[#16213E] rounded-2xl shadow p-6 min-h-[120px] border border-[#00ADB5]">
                  <span className="text-base font-semibold text-white mb-2 block">Recent Activity</span>
                  <ul className="space-y-2 mt-2">
                    {(globalResults.activities || []).length === 0 ? (
                      <li className="text-xs text-[#B8C1EC]">No recent activities.</li>
                    ) : (
                      (globalResults.activities || []).map((a, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <img src={`https://randomuser.me/api/portraits/men/${32 + i}.jpg`} alt="avatar" className="h-7 w-7 rounded-full border border-[#E6E6FA]" />
                          <span className="font-semibold text-white">{a.title}</span>
                          <span className="text-xs text-[#B8C1EC] ml-auto">{a.timestamp}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
                {/* Text-based Report Card */}
                <div className="bg-[#16213E] rounded-2xl shadow p-6 min-h-[120px] flex flex-col border border-[#00ADB5]">
                  <span className="text-base font-semibold text-white mb-2 block">Summary Report</span>
                  <p className="text-sm text-[#B8C1EC] flex-1">{kpiData.summaryReport || "Your CRM is performing above industry average. Conversion rates are up this quarter. Keep up the great work!"}</p>
                  <button className="mt-4 bg-gradient-to-r from-[#00ADB5] to-[#FF5722] text-white rounded-lg px-4 py-2 text-xs font-semibold self-end">Download</button>
                </div>
              </div>
            </>
          ) : (
            activeModule && React.createElement(activeModule, { search })
          )}
        </div>
      </main>
      <style>{`
        body, html {
          font-family: 'Inter', 'Poppins', sans-serif;
        }
        .sidebar-animate {
          animation: sidebarFadeIn 0.9s cubic-bezier(.4,2,.6,1) both;
        }
        @keyframes sidebarFadeIn {
          from { opacity: 0; transform: translateX(-40px);}
          to { opacity: 1; transform: none;}
        }
      `}</style>
    </div>
  );
};

export default Dashboard;