import React from "react";

const items = [
  { label: "Dashboard", icon: "📊" },
  { label: "Analytics", icon: "📈" },
  { label: "Reports", icon: "📑" },
  { label: "Calendar", icon: "📅" },
  { label: "Chat", icon: "💬" },
  { label: "Contacts", icon: "👥" },
];

export default function MagicBento() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex flex-col items-center justify-center bg-white rounded-xl shadow p-4 hover:bg-gray-100 transition"
        >
          <span className="text-3xl mb-2">{item.icon}</span>
          <span className="text-sm font-semibold text-gray-700">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
