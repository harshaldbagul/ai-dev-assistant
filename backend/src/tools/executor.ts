import { AppError } from '../types/index.js';
import { githubService } from '../services/github/GithubService.js';

export async function executeToolCall(
  name: string,
  args: Record<string, unknown>,
): Promise<unknown> {
  switch (name) {
    case 'get_github_profile': {
      const username = args.username as string;
      return githubService.getProfile(username);
    }
    case 'get_github_repos': {
      const username = args.username as string;
      const sort = (args.sort as 'stars' | 'updated' | 'pushed') ?? 'stars';
      return githubService.getRepos(username, sort);
    }
    case 'search_github_repos': {
      const query = args.query as string;
      const limit = (args.limit as number) ?? 5;
      return githubService.searchRepos(query, limit);
    }
    default:
      throw new AppError(`Unknown tool: ${name}`, 400);
  }
}
