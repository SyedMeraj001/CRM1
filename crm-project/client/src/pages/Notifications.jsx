import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";

// NotificationBadge component
function NotificationBadge({ count }) {
	const badgeRef = useRef();
	useEffect(() => {
		if (count > 0 && badgeRef.current) {
			badgeRef.current.classList.add("animate-bounce");
			setTimeout(() => {
				if (badgeRef.current) {
					badgeRef.current.classList.remove("animate-bounce");
				}
			}, 600);
		}
	}, [count]);
	if (!count) return null;
	return (
		<span
			ref={badgeRef}
			className="ml-2 inline-block bg-pink-500 text-white text-xs rounded-full px-2 py-0.5 font-bold transition-all"
		>
			{count}
		</span>
	);
}

function LiveAlertToast({ alert, onClose }) {
	useEffect(() => {
		if (alert) {
			confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
			const audio = new Audio(
				"https://assets.mixkit.co/sfx/preview/mixkit-bell-notification-933.mp3"
			);
			audio.play();
		}
	}, [alert]);
	if (!alert) return null;
	return (
		<div className="fixed top-6 right-6 z-50 bg-pink-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in">
			<span className="font-bold animate-pulse">🔔</span>
			<span>{alert}</span>
			<button
				className="ml-4 text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/40"
				onClick={onClose}
			>
				Close
			</button>
		</div>
	);
}

function ReminderScheduler({ show, value, onChange, onSchedule, onCancel }) {
	if (!show) return null;
	return (
		<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
			<div className="bg-[#232946] rounded-2xl p-8 shadow-2xl min-w-[300px]">
				<h3 className="text-lg font-bold mb-4 text-pink-400">
					Schedule Reminder
				</h3>
				<input
					type="text"
					value={value}
					onChange={onChange}
					placeholder="Enter reminder details..."
					className="w-full mb-4 px-3 py-2 rounded bg-[#181c2f] text-purple-100 border border-purple-500 focus:outline-none"
				/>
				<div className="flex gap-4">
					<button
						onClick={onSchedule}
						className="bg-pink-500 hover:bg-pink-600 px-4 py-2 rounded text-white font-bold shadow"
					>
						Schedule
					</button>
					<button
						onClick={onCancel}
						className="px-4 py-2 rounded text-purple-200 border border-purple-500 hover:bg-purple-900"
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
}

function Notifications() {
	const [notifications, setNotifications] = useState([]);
	const [showScheduler, setShowScheduler] = useState(false);
	const [newReminder, setNewReminder] = useState("");
	const [liveAlert, setLiveAlert] = useState(null);
	const navigate = useNavigate();

	// Fetch notifications from backend
	const fetchNotifications = async () => {
		try {
			const res = await axios.get("/api/notifications");
			setNotifications(res.data);
		} catch (err) {
			console.error("Failed to fetch notifications", err);
		}
	};

	useEffect(() => {
		fetchNotifications();
	}, []);

	// Mark notification as read (PUT to backend)
	const markAsRead = async (id) => {
		try {
			await axios.put(`/api/notifications/${id}`, { read: true });
			fetchNotifications();
		} catch (err) {
			console.error("Failed to mark as read", err);
		}
	};

	// Add new reminder (POST to backend)
	const addReminder = async () => {
		if (newReminder.trim()) {
			try {
				await axios.post("/api/notifications", {
					type: "reminder",
					message: `Reminder scheduled: ${newReminder}`,
					read: false,
				});
				setLiveAlert(`Reminder scheduled: ${newReminder}`);
				setNewReminder("");
				setShowScheduler(false);
				fetchNotifications();
			} catch (err) {
				console.error("Failed to add reminder", err);
			}
		}
	};

	// Count unread notifications
	const unreadCount = notifications.filter((n) => !n.read).length;

		return (
			<div className="min-h-screen bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460] p-8 text-white">
			<div className="max-w-2xl mx-auto">
								<div className="flex justify-between items-center mb-6">
									<h2 className="text-3xl font-extrabold text-[#00ADB5] drop-shadow-lg flex items-center">
										Real-Time Notifications & Alerts
										<NotificationBadge count={unreadCount} />
									</h2>
								</div>
								<div className="flex justify-between items-center mb-6 glass-card border border-[#FF5722] shadow-xl rounded-2xl">
									<span className="text-xl font-bold text-[#FF5722]">
										Live Notifications
									</span>
									<button
										onClick={() => setShowScheduler(true)}
										className="bg-gradient-to-r from-[#00ADB5] to-[#FF5722] hover:from-[#00ADB5] hover:to-[#FF5722] text-white px-6 py-2 rounded-full font-bold shadow transition"
									>
										+ Schedule Reminder
									</button>
								</div>
								<ul className="space-y-4 glass-card border border-[#00ADB5] shadow-xl rounded-2xl">
					{notifications.map((n, idx) => (
						<li
							key={n.id}
							className={`rounded-xl p-4 shadow-lg bg-gradient-to-br from-[#232946]/80 to-[#2c5364]/80 border-l-4 ${
								n.type === "report"
									? "border-blue-400"
									: n.type === "reminder"
									? "border-yellow-400"
									: "border-green-400"
							} flex items-center justify-between transition-all animate-slide-in`}
							style={{ animationDelay: `${idx * 0.1}s` }}
						>
							<div>
								<span className="font-semibold">
									{n.type === "report" && "📄 "}
									{n.type === "reminder" && "⏰ "}
									{n.type === "company" && "🏢 "}
								</span>
												{n.type === "reminder" && n.title && n.message
													? (<span>{n.message}<br /><span className="text-xs text-yellow-300">Task: {n.title}</span></span>)
													: n.message}
								<div className="text-xs text-purple-200 mt-1">
									{n.time}
								</div>
							</div>
							{!n.read && (
								<button
									onClick={() => markAsRead(n.id)}
									className="ml-4 px-3 py-1 rounded bg-purple-600 text-xs text-white hover:bg-pink-500"
								>
									Mark as read
								</button>
							)}
						</li>
					))}
				</ul>
			</div>

			{/* Live Alert Toast */}
			<LiveAlertToast alert={liveAlert} onClose={() => setLiveAlert(null)} />

			{/* Reminder Scheduler Modal */}
			<ReminderScheduler
				show={showScheduler}
				value={newReminder}
				onChange={(e) => setNewReminder(e.target.value)}
				onSchedule={addReminder}
				onCancel={() => setShowScheduler(false)}
			/>

			<style>{`
		.animate-fade-in {
		  animation: fadeIn 0.7s;
		}
		@keyframes fadeIn {
		  from { opacity: 0; transform: translateY(-10px);}
		  to { opacity: 1; transform: none;}
		}
		.animate-bounce {
		  animation: bounce 0.6s;
		}
		@keyframes bounce {
		  0%, 100% { transform: translateY(0);}
		  50% { transform: translateY(-8px);}
		}
		.animate-slide-in {
		  animation: slideIn 0.5s both;
		}
		@keyframes slideIn {
		  from { opacity: 0; transform: translateX(40px);}
		  to { opacity: 1; transform: none;}
		}
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

export default Notifications;

