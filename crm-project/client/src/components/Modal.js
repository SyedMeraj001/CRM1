// filepath: c:\Users\msyed\Desktop\cmr\crm-project\client\src\components\Modal.jsx
import React from "react";
export default function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-[#232946] rounded-xl shadow-lg p-8 relative min-w-[300px] max-w-lg w-full">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-pink-400 text-2xl font-bold hover:text-pink-600"
          aria-label="Close"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}