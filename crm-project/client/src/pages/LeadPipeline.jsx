import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import confetti from "canvas-confetti";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

// Statuses and their color tags
const STATUS = [
  { key: "lead", label: "Lead", color: "bg-yellow-400", icon: "🟡" },
  { key: "contacted", label: "Contacted", color: "bg-blue-400", icon: "🔵" },
  { key: "client", label: "Client", color: "bg-green-400", icon: "🟢" },
  { key: "archived", label: "Archived", color: "bg-red-400", icon: "🔴" },
];

// Sample users for assignment
const USERS = ["Evan Morales", "Kenneth Osborne", "Ava Carter"];

// Initial pipeline data
const initialPipeline = {
  lead: [
    { id: "1", name: "Acme Corp", owner: "Evan Morales", details: "Eco solutions provider." },
    { id: "2", name: "Beta Ltd", owner: "Ava Carter", details: "Clean tech startup." },
  ],
  contacted: [
    { id: "3", name: "Gamma Inc", owner: "Kenneth Osborne", details: "Consulting firm." },
  ],
  client: [
    { id: "4", name: "Delta LLC", owner: "Evan Morales", details: "Renewable energy leader." },
  ],
  archived: [],
};

const leads = [
  { status: "Marketing", name: "Lead 1" },
  { status: "Sales", name: "Lead 2" },
  { status: "Marketing", name: "Lead 3" },
  // ...other leads
];

export default function LeadPipeline() {
  const [pipeline, setPipeline] = useState(initialPipeline);
  const [assignModal, setAssignModal] = useState({ open: false, card: null, status: null });
  const [drawer, setDrawer] = useState({ open: false, card: null, status: null });
  const [customStages, setCustomStages] = useState(STATUS);
  const [leadsData, setLeads] = useState([]);
  const [usersToDivide, setUsersToDivide] = useState(USERS);
  const [isFinalAssigned, setIsFinalAssigned] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const role = localStorage.getItem("role"); // Add this line to get role
  const username = localStorage.getItem("username");

  // Fetch leads from backend when component mounts
  useEffect(() => {
    fetch("/api/leads") // Replace with your actual backend endpoint
      .then(res => res.json())
      .then(data => setLeads(data))
      .catch(err => console.error("Failed to fetch leads:", err));
  }, []);

  // Drag and drop handler
  function onDragEnd(result) {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceList = Array.from(pipeline[source.droppableId]);
    const [moved] = sourceList.splice(source.index, 1);
    const destList = Array.from(pipeline[destination.droppableId]);
    destList.splice(destination.index, 0, moved);

    setPipeline({
      ...pipeline,
      [source.droppableId]: sourceList,
      [destination.droppableId]: destList,
    });

    // Confetti when moved to Client
    if (destination.droppableId === "client") {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      const audio = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-bell-notification-933.mp3");
      audio.play();
    }
  }

  // Assign owner handler
  function assignOwner(user) {
    const { card, status } = assignModal;
    setPipeline((prev) => ({
      ...prev,
      [status]: prev[status].map((c) =>
        c.id === card.id ? { ...c, owner: user } : c
      ),
    }));
    setAssignModal({ open: false, card: null, status: null });
  }

  // Divide leads equally among users (round-robin)
  function divideLeads() {
    if (!leadsData.length || !usersToDivide.length) return;
    const divided = leadsData.map((lead, idx) => ({
      ...lead,
      owner: usersToDivide[idx % usersToDivide.length],
    }));
    setLeads(divided);
  }

  // Manually assign a lead to a user
  function assignUploadedLead(idx, user) {
    setLeads(leadsData =>
      leadsData.map((lead, i) =>
        i === idx ? { ...lead, owner: user } : lead
      )
    );
  }

  // Final assign handler (simulate saving to backend or confirming assignment)
  function handleFinalAssign() {
    // Here you could send leadsData to your backend or mark as assigned
    setIsFinalAssigned(true);
    // Optionally show a message or confetti
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  }

  // Pipeline analytics
  const totalLeads = Object.values(pipeline).reduce((acc, arr) => acc + arr.length, 0);
  const clientCount = pipeline.client.length;
  const conversionRate = totalLeads ? Math.round((clientCount / totalLeads) * 100) : 0;

  // Custom stage management (add stage)
  function addStage() {
    const newKey = `custom${customStages.length}`;
    setCustomStages([
      ...customStages,
      { key: newKey, label: "New Stage", color: "bg-purple-400", icon: "🟣" },
    ]);
    setPipeline({ ...pipeline, [newKey]: [] });
  }

  // Lead details drawer
  function openDrawer(card, status) {
    setDrawer({ open: true, card, status });
  }

  function closeDrawer() {
    setDrawer({ open: false, card: null, status: null });
  }

  // File upload handler for Excel
  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const leads = XLSX.utils.sheet_to_json(sheet);
      setLeads(leads);
    };
    reader.readAsArrayBuffer(file);
  }

  function updateLeadStatus(idx, newStatus) {
    const lead = leadsData[idx];
    setLeads(leadsData =>
      leadsData.map((l, i) =>
        i === idx ? { ...l, status: newStatus } : l
      )
    );
    fetch(`/api/leads/${lead.id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
      .then(res => res.json())
      .then(updated => {
        // Re-fetch leads for real-time sync
        fetchLeads();
      });
  }

  function fetchLeads() {
    fetch("/api/leads")
      .then(res => res.json())
      .then(data => setLeads(data));
  }

  // Filter leads based on search term
  const filteredLeads = (role === "admin"
    ? leadsData
    : leadsData.filter(lead => lead.owner === username)
  ).filter(lead =>
    (lead.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lead.company || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lead.status || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lead.owner || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#232946]/80 to-[#0f2027]/90 p-8 text-white">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-pink-400 flex items-center">
          Lead Status Pipeline
        </h2>
        <div className="flex gap-4 items-center">
          {role === "admin" && (
            <>
              <label className="flex flex-col items-center justify-center cursor-pointer w-40 h-12">
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="upload-leads"
                />
                <span
                  onClick={() => document.getElementById("upload-leads").click()}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow font-bold transition-transform hover:scale-105 w-full h-12 flex items-center justify-center text-center"
                  style={{ minWidth: "160px" }}
                >
                  📤 Upload
                </span>
              </label>
              <button
                onClick={divideLeads}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow font-bold transition-transform hover:scale-105 w-40 h-12 flex items-center justify-center"
                disabled={!leadsData.length}
                style={{ minWidth: "160px" }}
              >
                🔀 Divide Leads
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mb-4 flex justify-end">
        <input
          type="text"
          placeholder="Search leads..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="px-4 py-2 rounded bg-[#232946] text-purple-100 w-64"
        />
      </div>

      {/* Show uploaded leads and their owners */}
      {leadsData.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-purple-300 mb-2">Uploaded Leads</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLeads.map((lead, idx) => (
              <div key={idx} className="glass-card flex flex-col">
                <span className="font-bold text-pink-400">{lead.name || lead.company || `Lead ${idx + 1}`}</span>
                <span className="text-purple-200">Status: {lead.status}</span>
                <span className="text-purple-300">Owner: {lead.owner || "Unassigned"}</span>
                {role === "admin" && (
                  <div className="mt-2">
                    <span className="text-xs text-purple-200 mr-2">Assign to:</span>
                    {USERS.map(user => (
                      <button
                        key={user}
                        className="text-xs bg-purple-700 hover:bg-pink-500 text-white px-2 py-1 rounded mr-2"
                        onClick={() => assignUploadedLead(idx, user)}
                        disabled={isFinalAssigned}
                      >
                        {user}
                      </button>
                    ))}
                  </div>
                )}
                {role === "admin" || lead.owner === username ? (
                  <div className="mt-2 flex gap-2 items-center">
                    <span className="text-xs text-purple-200 mr-2">Status:</span>
                    <select
                      value={lead.status}
                      onChange={e => updateLeadStatus(idx, e.target.value)}
                      className="bg-[#232946] text-purple-100 rounded px-2 py-1 text-xs"
                      disabled={isFinalAssigned}
                    >
                      <option value="lead">Lead</option>
                      <option value="contacted">Contacted</option>
                      <option value="client">Client</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          {/* Optionally, show a summary of how many leads each user has */}
          {role === "admin" && (
            <div className="mt-4">
              <h4 className="text-sm font-bold text-pink-400 mb-2">Leads per User:</h4>
              <ul className="text-xs text-purple-200">
                {USERS.map(user => (
                  <li key={user}>
                    {user}: {leadsData.filter(l => l.owner === user).length}
                  </li>
                ))}
              </ul>
              {/* Final Assign Button */}
              <button
                className={`mt-6 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow font-bold ${isFinalAssigned ? "opacity-60 cursor-not-allowed" : ""}`}
                onClick={handleFinalAssign}
                disabled={isFinalAssigned}
              >
                Final Assign
              </button>
              {isFinalAssigned && (
                <div className="mt-2 text-green-400 font-bold">Leads have been assigned!</div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="p-6 bg-gradient-to-tr from-[#232946]/80 to-[#0f2027]/90 rounded-3xl shadow-2xl">
        {/* Pipeline Analytics */}
        <div className="mb-6 flex gap-6 items-center">
          <div className="glass-card flex flex-col items-center justify-center px-6 py-4">
            <span className="text-lg font-bold text-pink-400">Conversion Rate</span>
            <span className="text-3xl font-bold text-green-400">{conversionRate}%</span>
          </div>
          <div className="glass-card flex flex-col items-center justify-center px-6 py-4">
            <span className="text-lg font-bold text-pink-400">Clients</span>
            <span className="text-3xl font-bold text-purple-400">{clientCount}</span>
          </div>
          <button
            onClick={addStage}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow font-bold"
          >
            + Add Stage
          </button>
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 overflow-x-auto">
            {customStages.map((status) => (
              <Droppable droppableId={status.key} key={status.key}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex-1 min-w-[250px] bg-[#181c2f]/70 rounded-2xl p-4 shadow-lg"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`w-3 h-3 rounded-full ${status.color} inline-block`}></span>
                      <span className="font-semibold text-purple-200">{status.label}</span>
                    </div>
                    <div className="space-y-4 min-h-[60px]">
                      {pipeline[status.key]?.map((card, idx) => (
                        <Draggable draggableId={card.id} index={idx} key={card.id}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`rounded-xl p-4 bg-gradient-to-br from-[#232946]/80 to-[#2c5364]/80 shadow-md border-l-4 ${status.color} transition-all ${
                                snapshot.isDragging ? "scale-105 shadow-2xl animate-bounce" : ""
                              }`}
                            >
                              <div className="flex justify-between items-center mb-2">
                                <span
                                  className="font-bold text-white cursor-pointer hover:text-pink-400"
                                  onClick={() => openDrawer(card, status.key)}
                                >
                                  {card.name}
                                </span>
                                <span title={status.label}>{status.icon}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-purple-200">
                                  Owner: <span className="font-semibold">{card.owner}</span>
                                </span>
                                <button
                                  className="text-xs text-pink-400 hover:underline"
                                  onClick={() =>
                                    setAssignModal({ open: true, card, status: status.key })
                                  }
                                >
                                  Assign
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>

        {/* Lead Details Drawer */}
        {drawer.open && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-end z-50">
            <div className="bg-[#232946] w-full max-w-md h-full p-8 shadow-2xl rounded-l-2xl flex flex-col">
              <button
                className="text-pink-400 text-lg font-bold mb-6 self-end"
                onClick={closeDrawer}
              >
                &times;
              </button>
              <h3 className="text-xl font-bold text-pink-400 mb-2">{drawer.card.name}</h3>
              <div className="mb-2 text-purple-200">Owner: {drawer.card.owner}</div>
              <div className="mb-4 text-purple-100">{drawer.card.details || "No details available."}</div>
              <div className="mt-auto">
                <button
                  className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded shadow font-bold w-full"
                  onClick={closeDrawer}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assign User Modal */}
        {assignModal.open && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-[#232946] rounded-2xl p-8 shadow-2xl min-w-[300px]">
              <h3 className="text-lg font-bold mb-4 text-pink-400">Assign Owner</h3>
              <div className="space-y-2">
                {USERS.map((user) => (
                  <button
                    key={user}
                    className="block w-full text-left px-4 py-2 rounded hover:bg-pink-500/30 text-purple-100"
                    onClick={() => assignOwner(user)}
                  >
                    {user}
                  </button>
                ))}
              </div>
              <button
                className="mt-6 text-xs text-gray-400 hover:text-pink-400"
                onClick={() => setAssignModal({ open: false, card: null, status: null })}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
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
  .animate-bounce {
    animation: bounce 0.6s;
  }
  @keyframes bounce {
    0%, 100% { transform: translateY(0);}
    50% { transform: translateY(-8px);}
  }
`}</style>
    </div>
  );
}

export const getMarketingLeadsCount = () => {
  return leads.filter(lead => lead.status === "Marketing").length;
};