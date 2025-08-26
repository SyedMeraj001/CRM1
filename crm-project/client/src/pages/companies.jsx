// src/pages/ActiveCompanies.jsx
import React, { useEffect, useState } from "react";
import SearchBar from '../components/SearchBar';
import axios from "axios";
import { useNavigate } from "react-router-dom";

export function ActiveCompanies({ search = "" }) {
    const [companies, setCompanies] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchState, setSearchState] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const res = await axios.get("/api/contacts");
                setContacts(res.data);
            } catch (err) {
                setContacts([]);
            }
        };
    fetchCompanies();
    fetchContacts();
    }, []);

    const fetchCompanies = async () => {
        try {
            const res = await fetch("/api/companies");
            const data = await res.json();
            console.log(data);
            if (Array.isArray(data)) {
                setCompanies(data);
            } else {
                setError("No companies found.");
            }
        } catch (err) {
            setError("Failed to fetch companies from backend.");
        } finally {
            setLoading(false);
        }
    };

    const fetchCompanyDetails = async (id) => {
        try {
            const res = await axios.get(`/api/companies/${id}`);
            setSelectedCompany(res.data);
        } catch (err) {
            setSelectedCompany(null);
            setError("Failed to fetch company details from backend.");
            console.error("Database error:", err);
        }
    };

    const filteredCompanies = companies.filter(
        (c) =>
            (c.name && c.name.toLowerCase().includes(searchState.toLowerCase())) ||
            (c.industry && c.industry.toLowerCase().includes(searchState.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460] p-8 text-white">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-extrabold text-[#00ADB5] tracking-wide">
                        🌐 Active Companies
                    </h1>
                </div>
                <SearchBar value={searchState} onChange={setSearchState} placeholder="Search companies..." />
                {loading && <p className="text-[#B8C1EC]">Loading companies...</p>}
                {error && <p className="text-[#FF5722] mb-4">{error}</p>}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {filteredCompanies.map((company) => {
                        const contactCount = contacts.filter(c => c.company === company.name).length;
                        return (
                            <div
                                key={company.id}
                                onClick={() => fetchCompanyDetails(company.id)}
                                className="glass-card cursor-pointer"
                            >
                                <h2 className="text-2xl font-bold mb-6 text-[#00ADB5]">{company.name}</h2>
                                <p className="text-sm text-[#B8C1EC]">{company.industry || <span className="italic text-gray-400">No industry info</span>}</p>
                                <p className="text-xs text-[#FF5722] mt-2">Contacts: {contactCount}</p>
                            </div>
                        );
                    })}
                </div>
                {selectedCompany && (
                    <div className="mt-10 bg-[#16213E] p-8 rounded-xl shadow-xl border border-[#00ADB5] text-white">
                        <h2 className="text-3xl font-bold text-[#00ADB5] mb-4">
                            {selectedCompany.name}
                        </h2>
                        <p className="mb-2">
                            <span className="font-semibold text-[#B8C1EC]">Industry:</span> {selectedCompany.industry}
                        </p>
                        <p className="mb-2">
                            <span className="font-semibold text-[#B8C1EC]">Contact:</span> {selectedCompany.contact}
                        </p>
                        <p className="mb-4">
                            <span className="font-semibold text-[#B8C1EC]">ESG Score:</span> {selectedCompany.esg_score}
                        </p>

                        <h3 className="text-xl font-bold text-[#FF5722] mb-2">Reports</h3>
                        {selectedCompany.reports && selectedCompany.reports.length > 0 ? (
                            <ul className="list-disc list-inside">
                                {selectedCompany.reports.map((report, index) => (
                                    <li key={index}>
                                        <a
                                            href={report.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#00ADB5] hover:underline"
                                        >
                                            {report.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-[#B8C1EC]">No reports available.</p>
                        )}
                    </div>
                )}
            </div>
            <style>{`
                .glass-card {
                    background: #16213E;
                    color: #B8C1EC;
                    border-radius: 1.5rem;
                    box-shadow: 0 8px 32px 0 rgba(0, 173, 181, 0.07);
                    border: 1px solid #00ADB5;
                    padding: 2rem;
                    margin-bottom: 2rem;
                    transition: box-shadow 0.3s, transform 0.3s;
                }
                .glass-card:hover {
                    box-shadow: 0 12px 40px 0 rgba(0, 173, 181, 0.15), 0 8px 32px 0 rgba(31, 38, 135, 0.17);
                    transform: translateY(-4px) scale(1.02);
                }
            `}</style>
        </div>
    );
}
