// src/pages/ActiveCompanies.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


// Sample companies fallback data
const SAMPLE_COMPANIES = [
	{
		id: 1,
		name: "EcoCorp",
		industry: "Renewable Energy",
		contact: "Alice Johnson",
		esg_score: 85,
		reports: [
			{ name: "2024 ESG Report", url: "#" },
			{ name: "2023 Sustainability Report", url: "#" }
		]
	},
	{
		id: 2,
		name: "GreenTech",
		industry: "Clean Technology",
		contact: "Bob Smith",
		esg_score: 78,
		reports: [
			{ name: "2024 ESG Report", url: "#" }
		]
	},
	{
		id: 3,
		name: "Sustaina Inc",
		industry: "Consulting",
		contact: "Carol Lee",
		esg_score: 91,
		reports: []
	}
];

export function ActiveCompanies({ search = "" }) {
	const [companies, setCompanies] = useState([]);
	const [selectedCompany, setSelectedCompany] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		fetchCompanies();
	}, []);

	const fetchCompanies = async () => {
		try {
			const res = await axios.get("http://localhost:5000/api/companies");
			if (Array.isArray(res.data) && res.data.length > 0) {
				setCompanies(res.data);
			} else {
				setCompanies(SAMPLE_COMPANIES);
			}
		} catch (err) {
			setCompanies(SAMPLE_COMPANIES);
			setError("Showing sample companies. Backend not connected.");
		} finally {
			setLoading(false);
		}
	};

	const fetchCompanyDetails = async (id) => {
		// Try to fetch from backend, fallback to sample
		try {
			const res = await axios.get(`http://localhost:5000/api/companies/${id}`);
			setSelectedCompany(res.data);
		} catch (err) {
			const sample = SAMPLE_COMPANIES.find((c) => c.id === id);
			setSelectedCompany(sample || null);
			setError("Showing sample company details. Backend not connected.");
		}
	};

	const filteredCompanies = companies.filter(
		(c) => c.name.toLowerCase().includes(search.toLowerCase()) ||
		c.industry.toLowerCase().includes(search.toLowerCase())
	);

	return (
		<div className="min-h-screen bg-gradient-to-tr from-[#232946]/80 to-[#0f2027]/90 p-8 text-white">
			<div className="max-w-2xl mx-auto">
				<div className="flex items-center justify-between mb-8">
					<h1 className="text-4xl font-extrabold text-cyan-400 tracking-wide">
						🌐 Active Companies
					</h1>
				</div>

				{loading && <p className="text-gray-400">Loading companies...</p>}
				{error && <p className="text-red-400 mb-4">{error}</p>}

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{filteredCompanies.map((company) => (
						<div
							key={company.id}
							onClick={() => fetchCompanyDetails(company.id)}
							className="glass-card"
						>
							<h2 className="text-2xl font-bold text-pink-400 mb-6">{company.name}</h2>
							<p className="text-sm text-gray-200">{company.industry}</p>
						</div>
					))}
				</div>

				{selectedCompany && (
					<div className="mt-10 bg-slate-900 p-8 rounded-xl shadow-xl border border-cyan-700">
						<h2 className="text-3xl font-bold text-cyan-300 mb-4">
							{selectedCompany.name}
						</h2>
						<p className="mb-2">
							<span className="font-semibold">Industry:</span> {selectedCompany.industry}
						</p>
						<p className="mb-2">
							<span className="font-semibold">Contact:</span> {selectedCompany.contact}
						</p>
						<p className="mb-4">
							<span className="font-semibold">ESG Score:</span> {selectedCompany.esg_score}
						</p>

						<h3 className="text-xl font-bold text-cyan-200 mb-2">Reports</h3>
						{selectedCompany.reports && selectedCompany.reports.length > 0 ? (
							<ul className="list-disc list-inside">
								{selectedCompany.reports.map((report, index) => (
									<li key={index}>
										<a
											href={report.url}
											target="_blank"
											rel="noopener noreferrer"
											className="text-blue-400 hover:underline"
										>
											{report.name}
										</a>
									</li>
								))}
							</ul>
						) : (
							<p className="text-gray-400">No reports available.</p>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

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
