export async function loadPortfolioData(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load portfolio data: ${response.status}`);
  }

  return response.json();
}
