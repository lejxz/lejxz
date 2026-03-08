export async function getPortfolioData() {
  const res = await fetch("./assets/data/portfolio.json");
  if (!res.ok) {
    throw new Error("Failed to load portfolio data.");
  }

  return res.json();
}
