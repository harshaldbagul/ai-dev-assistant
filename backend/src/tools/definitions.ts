import { Tool, SchemaType } from '@google/generative-ai';

export const toolDefinitions: Tool[] = [
  {
    functionDeclarations: [
      {
        name: 'get_github_profile',
        description:
          'Fetches a GitHub user profile including name, bio, follower count, repository count, location, and profile URL. Use this when asked about a specific GitHub user.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            username: {
              type: SchemaType.STRING,
              description: 'The GitHub username (e.g. "torvalds", "gaearon")',
            },
          },
          required: ['username'],
        },
      },
      {
        name: 'get_github_repos',
        description:
          'Fetches the top 5 repositories for a GitHub user, sorted by the specified criteria. Returns repo name, star count, language, description, and fork count.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            username: {
              type: SchemaType.STRING,
              description: 'The GitHub username',
            },
            sort: {
              type: SchemaType.STRING,
              description:
                'How to sort repositories: "stars" (most starred first), "updated" (recently updated), or "pushed" (recently pushed to). Defaults to "stars".',
            },
          },
          required: ['username'],
        },
      },
      {
        name: 'search_github_repos',
        description:
          'Searches GitHub repositories globally by keyword, topic, or language. Use this for questions like "highest rated repos", "most starred JavaScript repos", "top machine learning repos", etc. Returns name, star count, language, description, and URL.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            query: {
              type: SchemaType.STRING,
              description:
                'Search query. Examples: "stars:>10000", "topic:machine-learning", "language:rust stars:>5000", "web framework". For top/highest rated repos with no filter, use "stars:>1".',
            },
            limit: {
              type: SchemaType.NUMBER,
              description: 'Number of results to return (1–10). Defaults to 5.',
            },
          },
          required: ['query'],
        },
      },
    ],
  },
];
