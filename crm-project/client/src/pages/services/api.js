export async function fetchSummaryData() {
  const res = await fetch("/api/summary");
  return await res.json();
}

export async function fetchMonthlyLeads(range = "monthly") {
  const res = await fetch(`/api/leads?range=${range}`);
  return await res.json();
}

export async function generateReport() {
  const res = await fetch("/api/reports/generate", {
    method: "POST",
  });
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "esg_report.pdf");
  document.body.appendChild(link);
  link.click();
  link.remove();
}
