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
    default:
      throw new AppError(`Unknown tool: ${name}`, 400);
  }
}
