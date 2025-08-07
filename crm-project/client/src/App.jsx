import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Reports from "./pages/Reports";
import Contacts from "./pages/Contacts";
import { ActiveCompanies } from "./pages/companies";
import Analytics from "./pages/Analytics";
import Compliances from "./pages/Compliances";
import Reminders from "./pages/Reminders";
import ActivityTracker from "./pages/ActivityTracker";
import LeadPipeline from "./pages/LeadPipeline";
import Notifications from "./pages/Notifications";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/companies" element={<ActiveCompanies />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/compliances" element={<Compliances />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="/activity" element={<ActivityTracker />} />
        <Route path="/pipeline" element={<LeadPipeline />} />
        <Route path="/notifications" element={<Notifications />} />
      </Routes>
    </Router>
  );
}
