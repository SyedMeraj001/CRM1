import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SAMPLE_CONTACTS = []; // Removed sample contacts

export default function Contacts({ search = "" }) {
	const [contacts, setContacts] = useState([]);
	const [newContact, setNewContact] = useState({
		name: "",
		email: "",
		company: "",
		designation: "",
		linkedin: "",
	});
	const [editingId, setEditingId] = useState(null);
	const [editContact, setEditContact] = useState({
		name: "",
		email: "",
		company: "",
		designation: "",
		linkedin: "",
	});
		const [role, setRole] = useState("user");
	const navigate = useNavigate();

	useEffect(() => {
			fetchContacts();
			// Set role from localStorage if available
			const storedRole = localStorage.getItem("role");
			if (storedRole) setRole(storedRole);
		}, []);

	const fetchContacts = async () => {
		try {
			const res = await axios.get("/api/contacts");
			setContacts(res.data);
		} catch (err) {
			console.error(err);
		}
	};

	// Add contact
	const handleAdd = async (e) => {
		e.preventDefault();
		if (
			!newContact.name ||
			!newContact.email ||
			!newContact.company ||
			!newContact.designation
		)
			return;
		try {
			await axios.post("/api/contacts", newContact);
			fetchContacts();
			setNewContact({
				name: "",
				email: "",
				company: "",
				designation: "",
				linkedin: "",
			});
		} catch (err) {
			console.error(err);
		}
	};

	// Delete contact
	const handleDelete = async (id) => {
		try {
			await axios.delete(`/api/contacts/${id}`);
			fetchContacts();
		} catch (err) {
			console.error(err);
		}
	};
	// ...existing code...
	// Filter contacts by search prop from Dashboard
	const filteredContacts = contacts.filter(c =>
	  c && (
	    (c.name && c.name.toLowerCase().includes(search.toLowerCase())) ||
	    (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
	    (c.company && c.company.toLowerCase().includes(search.toLowerCase())) ||
	    (c.designation && c.designation.toLowerCase().includes(search.toLowerCase())) ||
	    (c.linkedin && c.linkedin.toLowerCase().includes(search.toLowerCase()))
	  )
	);
	const handleEdit = (contact) => {
			setEditingId(contact.id);
			setEditContact({
				name: contact.name,
				email: contact.email,
				company: contact.company,
				designation: contact.designation,
				linkedin: contact.linkedin || "",
				phone: contact.phone || "",
				role: contact.role || "user"
			});
	};

	// ...existing code...
	const handleSave = async (id) => {
					try {
						// Send all fields, including designation and linkedin
						const contactToSend = {
							name: editContact.name || "",
							email: editContact.email || "",
							phone: editContact.phone || "",
							company: editContact.company || "",
							role: editContact.role || "user",
							designation: editContact.designation || "",
							linkedin: editContact.linkedin || ""
						};
						await axios.put(`/api/contacts/${id}`, contactToSend);
						fetchContacts();
						setEditingId(null);
						setEditContact({
							name: "",
							email: "",
							company: "",
							designation: "",
							linkedin: "",
							phone: "",
							role: "user"
						});
					} catch (err) {
						console.error(err);
					}
	}

	// Cancel edit
	const handleCancel = () => {
		setEditingId(null);
		setEditContact({
			name: "",
			email: "",
			company: "",
			designation: "",
			linkedin: "",
		});
	};

	return (
	<div className="min-h-screen bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460] p-8 text-white flex flex-col items-center">
			<div className="w-full max-w-4xl mx-auto">
				<div className="flex items-center justify-between mb-6 w-full">
					<h1 className="text-2xl font-bold text-pink-400">Contacts</h1>
				</div>

							{/* Add Contact Form */}
							<form
								onSubmit={handleAdd}
								className="flex flex-wrap gap-4 mb-8 items-end bg-[#232946]/60 p-6 rounded-2xl shadow-lg border border-purple-700"
								>
					<input
						type="text"
						placeholder="Name"
						className="border border-pink-400 rounded px-3 py-2 bg-[#232946]/40 text-white placeholder-purple-300"
						value={newContact.name}
						onChange={(e) =>
							setNewContact({ ...newContact, name: e.target.value })
						}
					/>
					<input
						type="email"
						placeholder="Email"
						className="border border-pink-400 rounded px-3 py-2 bg-[#232946]/40 text-white placeholder-purple-300"
						value={newContact.email}
						onChange={(e) =>
							setNewContact({ ...newContact, email: e.target.value })
						}
					/>
					<input
						type="text"
						placeholder="Company"
						className="border border-pink-400 rounded px-3 py-2 bg-[#232946]/40 text-white placeholder-purple-300"
						value={newContact.company}
						onChange={(e) =>
							setNewContact({ ...newContact, company: e.target.value })
						}
					/>
					<input
						type="text"
						placeholder="Designation"
						className="border border-pink-400 rounded px-3 py-2 bg-[#232946]/40 text-white placeholder-purple-300"
						value={newContact.designation}
						onChange={(e) =>
							setNewContact({ ...newContact, designation: e.target.value })
						}
					/>
					<input
						type="url"
						placeholder="LinkedIn (optional)"
						className="border border-pink-400 rounded px-3 py-2 bg-[#232946]/40 text-white placeholder-purple-300"
						value={newContact.linkedin}
						onChange={(e) =>
							setNewContact({ ...newContact, linkedin: e.target.value })
						}
					/>
					<button
						type="submit"
						className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded shadow hover:scale-105 transition"
					>
						Add Contact
					</button>
				</form>

				{/* Contacts Table */}
				<div className="glass-card shadow-lg border border-purple-700 p-6 rounded-2xl">
					<table className="min-w-full text-sm">
						<thead>
							<tr className="bg-[#232946]/40 text-pink-400">
								<th className="py-2 px-4 text-left">Name</th>
								<th className="py-2 px-4 text-left">Email</th>
								<th className="py-2 px-4 text-left">Company</th>
								<th className="py-2 px-4 text-left">Designation</th>
								<th className="py-2 px-4 text-left">LinkedIn</th>
								<th className="py-2 px-4 text-left">Actions</th>
							</tr>
						</thead>
						<tbody>
												{filteredContacts.map((contact) =>
								editingId === contact.id ? (
													<tr key={contact.id} className="border-t bg-[#232946]/30">
														<td className="py-2 px-4">
															<input
																type="text"
																className="border border-pink-400 rounded px-2 py-1 w-full bg-[#232946]/40 text-white"
																value={editContact.name}
																onChange={(e) =>
																	setEditContact({ ...editContact, name: e.target.value })
																}
															/>
														</td>
														<td className="py-2 px-4">
															<input
																type="email"
																className="border border-pink-400 rounded px-2 py-1 w-full bg-[#232946]/40 text-white"
																value={editContact.email}
																onChange={(e) =>
																	setEditContact({ ...editContact, email: e.target.value })
																}
															/>
														</td>
														<td className="py-2 px-4">
															<input
																type="text"
																className="border border-pink-400 rounded px-2 py-1 w-full bg-[#232946]/40 text-white"
																value={editContact.company}
																onChange={(e) =>
																	setEditContact({ ...editContact, company: e.target.value })
																}
															/>
														</td>
														<td className="py-2 px-4">
															<input
																type="text"
																className="border border-pink-400 rounded px-2 py-1 w-full bg-[#232946]/40 text-white"
																value={editContact.designation}
																onChange={(e) =>
																	setEditContact({ ...editContact, designation: e.target.value })
																}
															/>
														</td>
														<td className="py-2 px-4">
															<input
																type="url"
																className="border border-pink-400 rounded px-2 py-1 w-full bg-[#232946]/40 text-white"
																value={editContact.linkedin}
																onChange={(e) =>
																	setEditContact({ ...editContact, linkedin: e.target.value })
																}
															/>
														</td>
														<td className="py-2 px-4">
															<input
																type="text"
																placeholder="Phone"
																className="border border-pink-400 rounded px-2 py-1 w-full bg-[#232946]/40 text-white"
																value={editContact.phone}
																onChange={(e) =>
																	setEditContact({ ...editContact, phone: e.target.value })
																}
															/>
														</td>
										<td className="py-2 px-4 flex gap-2">
											<button
												type="button"
												onClick={() => handleSave(contact.id)}
												className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
											>
												Save
											</button>
											<button
												type="button"
												onClick={handleCancel}
												className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm"
											>
												Cancel
											</button>
										</td>
									</tr>
								) : (
									<tr key={contact.id} className="border-t">
										<td className="py-2 px-4 text-purple-100">{contact.name}</td>
										<td className="py-2 px-4 text-purple-100">{contact.email}</td>
										<td className="py-2 px-4 text-purple-100">{contact.company}</td>
										<td className="py-2 px-4 text-purple-100">{contact.designation && contact.designation.trim() ? contact.designation : 'N/A'}</td>
										<td className="py-2 px-4">
											{contact.linkedin ? (
												<a
													href={contact.linkedin}
													target="_blank"
													rel="noopener noreferrer"
													className="text-blue-400 underline"
												>
													LinkedIn
												</a>
											) : (
												<span className="text-purple-300">N/A</span>
											)}
										</td>
															<td className="py-2 px-4 flex gap-2">
																<button
																	type="button"
																	onClick={() => handleEdit(contact)}
																	className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
																>
																	Edit
																</button>
																{role === "admin" && (
																	<button
																		type="button"
																		onClick={() => handleDelete(contact.id)}
																		className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
																	>
																		Delete
																	</button>
											)}
										</td>
									</tr>
								)
							)}
						</tbody>
					</table>
				</div>
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
      `}</style>
		</div>
	);
}