const express = require('express');
const teamController = require('./team.controller');
const teamValidation = require('./team.validation');
const { validate } = require('../../middlewares');

const router = express.Router();

/**
 * Public Team Routes
 *
 * GET /api/v1/teams              → Get all active teams
 * GET /api/v1/teams/:identifier  → Get team by ID or slug
 */

router.get('/', teamController.getTeams);
router.get('/:identifier', validate(teamValidation.getTeam), teamController.getTeam);

module.exports = router;
