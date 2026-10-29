const teamService = require('./team.service');
const { ApiResponse, catchAsync } = require('../../shared/utils');

const teamController = {
  /**
   * GET /api/v1/teams
   * Public: get active teams for frontend filters.
   */
  getTeams: catchAsync(async (req, res) => {
    const teams = await teamService.getActiveTeams({ type: req.query.type });
    ApiResponse.ok(res, 'Teams retrieved', teams);
  }),

  /**
   * GET /api/v1/teams/:identifier
   * Public: get a team by ID or slug.
   */
  getTeam: catchAsync(async (req, res) => {
    const team = await teamService.getTeamByIdOrSlug(req.params.identifier);
    ApiResponse.ok(res, 'Team retrieved', team);
  }),

  // ─── Admin ────────────────────────────────────

  /**
   * GET /api/v1/admin/teams
   */
  adminGetTeams: catchAsync(async (req, res) => {
    const result = await teamService.getTeams(req.query);
    ApiResponse.ok(res, 'Teams retrieved', result.teams, result.pagination);
  }),

  /**
   * POST /api/v1/admin/teams
   */
  createTeam: catchAsync(async (req, res) => {
    const data = { ...req.body };

    if (req.file) {
      data.logo = { url: req.file.path, publicId: req.file.filename };
    }

    const team = await teamService.createTeam(data);
    ApiResponse.created(res, 'Team created', team);
  }),

  /**
   * PUT /api/v1/admin/teams/:id
   */
  updateTeam: catchAsync(async (req, res) => {
    const data = { ...req.body };

    if (req.file) {
      data.logo = { url: req.file.path, publicId: req.file.filename };
    }

    const team = await teamService.updateTeam(req.params.id, data);
    ApiResponse.ok(res, 'Team updated', team);
  }),

  /**
   * DELETE /api/v1/admin/teams/:id
   */
  deleteTeam: catchAsync(async (req, res) => {
    await teamService.deleteTeam(req.params.id);
    ApiResponse.ok(res, 'Team deleted');
  }),
};

module.exports = teamController;
