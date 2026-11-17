// Real repository facts, read from the GitHub API when the site is built.
// If the API is unreachable or rate limited the build still succeeds and the line is just left out.

export type RepoFacts = { lastCommit: string; commits: number } | null;

const cache = new Map<string, Promise<RepoFacts>>();

async function fetchFacts(repo: string): Promise<RepoFacts> {
  const headers: Record<string, string> = { accept: 'application/vnd.github+json', 'user-agent': 'keylorpineda.dev-build' };
  if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  try {
    // One commit per page: the last page number in the Link header is the total commit count.
    const res = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=1`, { headers, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const [latest] = (await res.json()) as { commit: { committer: { date: string } } }[];
    const last = res.headers.get('link')?.match(/[?&]page=(\d+)>; rel="last"/)?.[1];
    if (!latest) return null;
    return { lastCommit: latest.commit.committer.date, commits: last ? Number(last) : 1 };
  } catch {
    return null;
  }
}

/** `repoUrl` is a github.com URL such as https://github.com/owner/name. */
export function repoFacts(repoUrl: string): Promise<RepoFacts> {
  const repo = new URL(repoUrl).pathname.replace(/^\/|\/$/g, '');
  if (!cache.has(repo)) cache.set(repo, fetchFacts(repo));
  return cache.get(repo)!;
}
