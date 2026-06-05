import { env } from '../../config/env.js';
import { AppError, GitHubProfile, GitHubRepo } from '../../types/index.js';

interface RawGitHubRepo {
  name: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  html_url: string;
  forks_count: number;
  topics: string[];
}

class GithubService {
  private readonly baseUrl = 'https://api.github.com';
  private readonly headers: Record<string, string>;

  constructor() {
    this.headers = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'ai-dev-assistant',
    };
    if (env.GITHUB_TOKEN) {
      this.headers['Authorization'] = `token ${env.GITHUB_TOKEN}`;
    }
  }

  private async fetch<T>(path: string): Promise<T> {
    const res = await globalThis.fetch(`${this.baseUrl}${path}`, {
      headers: this.headers,
      signal: AbortSignal.timeout(10_000),
    });

    if (res.status === 404) {
      throw new AppError('GitHub user not found', 404);
    }
    if (res.status === 403) {
      throw new AppError('GitHub API rate limit exceeded', 429);
    }
    if (!res.ok) {
      throw new AppError(`GitHub API error: ${res.statusText}`, 502);
    }

    return res.json() as Promise<T>;
  }

  async getProfile(username: string): Promise<GitHubProfile> {
    const data = await this.fetch<GitHubProfile>(`/users/${encodeURIComponent(username)}`);
    return {
      login: data.login,
      name: data.name,
      bio: data.bio,
      followers: data.followers,
      following: data.following,
      public_repos: data.public_repos,
      location: data.location,
      avatar_url: data.avatar_url,
      html_url: data.html_url,
      company: data.company,
      blog: data.blog,
      created_at: data.created_at,
    };
  }

  async getRepos(
    username: string,
    sort: 'stars' | 'updated' | 'pushed' = 'stars',
  ): Promise<GitHubRepo[]> {
    const sortParam = sort === 'stars' ? 'updated' : sort;
    const data = await this.fetch<RawGitHubRepo[]>(
      `/users/${encodeURIComponent(username)}/repos?sort=${sortParam}&per_page=30`,
    );

    const repos = sort === 'stars'
      ? [...data].sort((a, b) => b.stargazers_count - a.stargazers_count)
      : data;

    return repos.slice(0, 5).map((repo) => ({
      name: repo.name,
      description: repo.description,
      stargazers_count: repo.stargazers_count,
      language: repo.language,
      html_url: repo.html_url,
      forks_count: repo.forks_count,
      topics: repo.topics ?? [],
    }));
  }
}

export const githubService = new GithubService();
