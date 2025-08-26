import React from "react";

export default function SearchBar({ value, onChange, placeholder = "Search..." }) {
	return (
		<div className="mb-4 flex items-center justify-center">
			<input
				type="text"
				value={value}
				onChange={e => onChange(e.target.value)}
				placeholder={placeholder}
				className="w-full max-w-md px-4 py-2 rounded-xl bg-white/10 text-white border border-[#00ADB5] focus:outline-none focus:ring-2 focus:ring-[#00ADB5] placeholder-purple-300 shadow"
			/>
		</div>
	);
}
