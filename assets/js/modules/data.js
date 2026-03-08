export async function loadPortfolioData(path) {
  const candidates = buildCandidatePaths(path);

  for (const url of candidates) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      continue;
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("json")) {
      continue;
    }

    return response.json();
  }

  throw new Error(`Portfolio data could not be loaded from any known path: ${candidates.join(", ")}`);
}

function buildCandidatePaths(path) {
  const cleanedPath = path.replace(/^\/+/, "");
  const set = new Set();

  // Works when current URL and site root are aligned.
  set.add(cleanedPath);

  // Works for normal relative resolution from current document.
  set.add(new URL(cleanedPath, document.baseURI).toString());

  // Works for root-based hosting.
  set.add(`/${cleanedPath}`);

  // Works for GitHub project pages: /<repo>/...
  const segments = window.location.pathname.split("/").filter(Boolean);
  const isGithubPagesHost = window.location.hostname.endsWith(".github.io");
  const firstSegment = segments[0] || "";
  if (isGithubPagesHost && firstSegment && firstSegment !== "index.html") {
    set.add(`/${firstSegment}/${cleanedPath}`);
  }

  return [...set];
}
