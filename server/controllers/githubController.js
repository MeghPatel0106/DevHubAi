import Profile from '../models/Profile.js';
import {
  fetchGitHubUserProfile,
  fetchGitHubUserRepos,
  calculateGitHubAnalytics,
} from '../services/githubService.js';

/**
 * @desc    Get authenticated user's connected GitHub analytics
 * @route   GET /api/github/analytics
 * @access  Private
 */
export const getGitHubAnalytics = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });

    if (!profile || !profile.githubConnected || !profile.githubUsername) {
      return res.status(200).json({
        success: true,
        connected: false,
        githubUsername: profile?.githubUsername || '',
        showOnPortfolio: profile?.githubShowOnPortfolio !== false,
      });
    }

    // Return stored analytics data
    return res.status(200).json({
      success: true,
      connected: true,
      githubUsername: profile.githubUsername,
      showOnPortfolio: profile.githubShowOnPortfolio !== false,
      lastSyncedAt: profile.githubLastSyncedAt || profile.updatedAt,
      data: profile.githubData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Connect a public GitHub account by username
 * @route   POST /api/github/connect
 * @access  Private
 */
export const connectGitHub = async (req, res, next) => {
  try {
    const { username, showOnPortfolio } = req.body;

    if (!username || !username.trim()) {
      return res.status(400).json({
        success: false,
        message: 'GitHub username is required',
      });
    }

    const cleanUsername = username.trim().replace(/^@/, '');

    // Fetch real data from GitHub Public REST API
    const userData = await fetchGitHubUserProfile(cleanUsername);
    const repos = await fetchGitHubUserRepos(cleanUsername);

    // Calculate real analytics
    const analytics = calculateGitHubAnalytics(userData, repos);

    // Update Profile document
    let profile = await Profile.findOne({ user: req.user._id });

    const updateFields = {
      githubUsername: userData.login,
      githubConnected: true,
      githubShowOnPortfolio: showOnPortfolio !== false,
      githubLastSyncedAt: new Date(),
      githubData: analytics,
      github: userData.html_url,
    };

    if (profile) {
      profile = await Profile.findOneAndUpdate(
        { user: req.user._id },
        { $set: updateFields },
        { new: true, runValidators: true }
      );
    } else {
      updateFields.user = req.user._id;
      profile = await Profile.create(updateFields);
    }

    // Recalculate profile completion
    if (profile.calculateCompletion) {
      profile.calculateCompletion();
      await profile.save();
    }

    return res.status(200).json({
      success: true,
      message: `Successfully connected GitHub account @${userData.login}`,
      connected: true,
      githubUsername: userData.login,
      showOnPortfolio: profile.githubShowOnPortfolio !== false,
      lastSyncedAt: profile.githubLastSyncedAt,
      data: analytics,
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: `GitHub account '@${req.body.username}' was not found. Please verify the username and try again.`,
      });
    }
    if (error.statusCode === 429) {
      return res.status(429).json({
        success: false,
        message: 'GitHub API rate limit reached. Please try again in a few minutes.',
      });
    }
    next(error);
  }
};

/**
 * @desc    Refresh GitHub telemetry data from GitHub REST API
 * @route   POST /api/github/sync
 * @access  Private
 */
export const refreshGitHubData = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });

    if (!profile || !profile.githubConnected || !profile.githubUsername) {
      return res.status(400).json({
        success: false,
        message: 'No GitHub account is currently connected to refresh',
      });
    }

    const userData = await fetchGitHubUserProfile(profile.githubUsername);
    const repos = await fetchGitHubUserRepos(profile.githubUsername);
    const analytics = calculateGitHubAnalytics(userData, repos);

    profile.githubData = analytics;
    profile.githubLastSyncedAt = new Date();
    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'GitHub telemetry data refreshed successfully',
      connected: true,
      githubUsername: profile.githubUsername,
      showOnPortfolio: profile.githubShowOnPortfolio !== false,
      lastSyncedAt: profile.githubLastSyncedAt,
      data: analytics,
    });
  } catch (error) {
    if (error.statusCode === 429) {
      return res.status(429).json({
        success: false,
        message: 'GitHub API rate limit reached. Please try again shortly.',
      });
    }
    next(error);
  }
};

/**
 * @desc    Toggle GitHub visibility on public portfolio
 * @route   PATCH /api/github/visibility
 * @access  Private
 */
export const updateGitHubVisibility = async (req, res, next) => {
  try {
    const { showOnPortfolio } = req.body;

    const profile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      { $set: { githubShowOnPortfolio: Boolean(showOnPortfolio) } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: `GitHub section is now ${showOnPortfolio ? 'visible' : 'hidden'} on your public portfolio`,
      showOnPortfolio: profile.githubShowOnPortfolio,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Disconnect GitHub account from DevHub AI
 * @route   DELETE /api/github/disconnect
 * @access  Private
 */
export const disconnectGitHub = async (req, res, next) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      {
        $set: {
          githubConnected: false,
          githubUsername: '',
          githubData: null,
          githubLastSyncedAt: null,
        },
      },
      { new: true }
    );

    if (profile && profile.calculateCompletion) {
      profile.calculateCompletion();
      await profile.save();
    }

    return res.status(200).json({
      success: true,
      message: 'GitHub account disconnected successfully',
      connected: false,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getGitHubAnalytics,
  connectGitHub,
  refreshGitHubData,
  updateGitHubVisibility,
  disconnectGitHub,
};
