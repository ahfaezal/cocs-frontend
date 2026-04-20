const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchAPI(endpoint: string) {
  const res = await fetch(`${API_URL}${endpoint}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}