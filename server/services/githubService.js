/**
 * GitHub Public REST API Service
 * Handles fetching public profile, repositories, and calculating real developer analytics.
 */

const GITHUB_API_BASE = 'https://api.github.com';

const getHeaders = () => {
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'DevHubAI-Platform',
  };

  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_API_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Fetch GitHub user profile
 */
export const fetchGitHubUserProfile = async (username) => {
  const cleanUsername = username.trim();
  const url = `${GITHUB_API_BASE}/users/${encodeURIComponent(cleanUsername)}`;

  const response = await fetch(url, {
    headers: getHeaders(),
  });

  if (response.status === 404) {
    const error = new Error(`GitHub account '@${cleanUsername}' not found`);
    error.statusCode = 404;
    throw error;
  }

  if (response.status === 403 || response.status === 429) {
    const error = new Error('GitHub API rate limit exceeded. Please try again shortly.');
    error.statusCode = 429;
    throw error;
  }

  if (!response.ok) {
    const error = new Error(`GitHub API error (${response.status})`);
    error.statusCode = response.status;
    throw error;
  }

  return await response.json();
};

/**
 * Fetch GitHub public repositories (up to 100 most recently updated)
 */
export const fetchGitHubUserRepos = async (username) => {
  const cleanUsername = username.trim();
  const url = `${GITHUB_API_BASE}/users/${encodeURIComponent(cleanUsername)}/repos?per_page=100&sort=updated&type=owner`;

  const response = await fetch(url, {
    headers: getHeaders(),
  });

  if (response.status === 404) {
    return [];
  }

  if (response.status === 403 || response.status === 429) {
    const error = new Error('GitHub API rate limit exceeded. Please try again shortly.');
    error.statusCode = 429;
    throw error;
  }

  if (!response.ok) {
    const error = new Error(`Failed to fetch GitHub repositories (${response.status})`);
    error.statusCode = response.status;
    throw error;
  }

  return await response.json();
};

/**
 * Compute real developer analytics from actual GitHub data
 */
export const calculateGitHubAnalytics = (userData, repos = []) => {
  let totalStars = 0;
  let totalForks = 0;
  let totalOpenIssues = 0;
  const languageCounts = {};
  let reposWithLanguage = 0;

  const sanitizedRepos = repos.map((repo) => {
    const stars = Number(repo.stargazers_count) || 0;
    const forks = Number(repo.forks_count) || 0;
    const openIssues = Number(repo.open_issues_count) || 0;

    totalStars += stars;
    totalForks += forks;
    totalOpenIssues += openIssues;

    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
      reposWithLanguage++;
    }

    return {
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description || '',
      htmlUrl: repo.html_url,
      homepage: repo.homepage || '',
      stars,
      forks,
      openIssues,
      language: repo.language || null,
      isFork: Boolean(repo.fork),
      createdAt: repo.created_at,
      updatedAt: repo.updated_at,
      pushedAt: repo.pushed_at,
    };
  });

  // Calculate real language distribution percentages
  const topLanguages = Object.entries(languageCounts)
    .map(([name, count]) => {
      const percentage = reposWithLanguage > 0 ? Math.round((count / reposWithLanguage) * 100) : 0;
      return { name, count, percentage };
    })
    .sort((a, b) => b.count - a.count);

  // Determine primary language
  const primaryLanguage = topLanguages.length > 0 ? topLanguages[0].name : null;

  // Rank top repositories by stars & forks
  const topRepositories = [...sanitizedRepos]
    .sort((a, b) => b.stars * 3 + b.forks * 2 - (a.stars * 3 + a.forks * 2))
    .slice(0, 6);

  return {
    profile: {
      username: userData.login,
      name: userData.name || userData.login,
      avatarUrl: userData.avatar_url,
      bio: userData.bio || '',
      location: userData.location || '',
      company: userData.company || '',
      blog: userData.blog || '',
      profileUrl: userData.html_url,
      publicRepos: userData.public_repos || repos.length,
      followers: userData.followers || 0,
      following: userData.following || 0,
      createdAt: userData.created_at,
    },
    metrics: {
      publicRepos: userData.public_repos || repos.length,
      followers: userData.followers || 0,
      following: userData.following || 0,
      totalStars,
      totalForks,
      totalOpenIssues,
      primaryLanguage,
    },
    topLanguages,
    topRepositories,
    repositories: sanitizedRepos,
    lastSyncedAt: new Date(),
  };
};

export default {
  fetchGitHubUserProfile,
  fetchGitHubUserRepos,
  calculateGitHubAnalytics,
};
