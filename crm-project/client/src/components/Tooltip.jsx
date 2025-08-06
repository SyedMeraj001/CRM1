import { useState } from "react";

export default function Tooltip({ children, text }) {
  const [show, setShow] = useState(false);
  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-gray-900 text-white text-xs px-3 py-1 rounded shadow-lg z-20 whitespace-nowrap">
          {text}
        </div>
      )}
    </div>
  );
}