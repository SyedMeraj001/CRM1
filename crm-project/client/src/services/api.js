export async function fetchSummary() {
  const res = await fetch("/api/summary");
  return await res.json();
}

export async function fetchLeadsTrend() {
  const res = await fetch("/api/leads");
  return await res.json();
}

export async function fetchRecentLeads() {
  const res = await fetch("/api/recent-leads");
  return await res.json();
}

export async function fetchESGBreakdown() {
  const res = await fetch("/api/esg-breakdown");
  return await res.json();
}