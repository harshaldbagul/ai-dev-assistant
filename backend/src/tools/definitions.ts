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
    ],
  },
];
