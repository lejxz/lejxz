export async function loadPortfolioData(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Data request failed: ${response.status}`);
  }

  return response.json();
}
