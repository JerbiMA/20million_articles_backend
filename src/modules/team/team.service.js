const Team = require('./team.model');
const { ApiError } = require('../../shared/utils');
const { PAGINATION } = require('../../shared/constants');
const { deleteImage } = require('../../config');

const teamService = {
  /**
   * Get paginated list of teams.
   */
  async getTeams({ page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT, type, search, isActive } = {}) {
    const filter = {};
    if (type) {
      filter.type = type;
    }
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const safePage = Math.max(1, parseInt(page, 10));
    const safeLimit = Math.min(parseInt(limit, 10), PAGINATION.MAX_LIMIT);
    const skip = (safePage - 1) * safeLimit;

    const [teams, total] = await Promise.all([
      Team.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(safeLimit)
        .populate('productCount')
        .lean({ virtuals: true }),
      Team.countDocuments(filter),
    ]);

    return {
      teams,
      pagination: { page: safePage, limit: safeLimit, total, pages: Math.ceil(total / safeLimit) },
    };
  },

  /**
   * Get all active teams (public — for frontend filters).
   */
  async getActiveTeams({ type } = {}) {
    const filter = { isActive: true };
    if (type) {
      filter.type = type;
    }
    return Team.find(filter)
      .sort({ name: 1 })
      .populate('productCount')
      .lean({ virtuals: true });
  },

  /**
   * Get a single team by ID or slug.
   */
  async getTeamByIdOrSlug(identifier) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
    const filter = isObjectId ? { _id: identifier } : { slug: identifier };

    const team = await Team.findOne(filter)
      .populate('productCount')
      .lean({ virtuals: true });

    if (!team) {
      throw ApiError.notFound('Team not found');
    }
    return team;
  },

  /**
   * Create a new team.
   */
  async createTeam(data) {
    const existing = await Team.findOne({ name: data.name });
    if (existing) {
      throw ApiError.conflict('A team with this name already exists');
    }
    return Team.create(data);
  },

  /**
   * Update a team.
   */
  async updateTeam(teamId, updateData) {
    if (updateData.name) {
      const existing = await Team.findOne({ name: updateData.name, _id: { $ne: teamId } });
      if (existing) {
        throw ApiError.conflict('A team with this name already exists');
      }
    }

    const team = await Team.findByIdAndUpdate(teamId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!team) {
      throw ApiError.notFound('Team not found');
    }
    return team;
  },

  /**
   * Delete a team.
   */
  async deleteTeam(teamId) {
    const team = await Team.findById(teamId);
    if (!team) {
      throw ApiError.notFound('Team not found');
    }

    if (team.logo?.publicId) {
      await deleteImage(team.logo.publicId);
    }

    await Team.findByIdAndDelete(teamId);
    return team;
  },
};

module.exports = teamService;
