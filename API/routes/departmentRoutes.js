const express = require('express');
const router = express.Router();
const { getAllDepartments, getSupervisorAnalytics } = require('../services/analyticsService');
const { getAllGrievances } = require('../utils/csvLoader');

// GET /api/departments
router.get('/', (req, res) => {
  res.json(getAllDepartments());
});

// GET /api/departments/:id/grievances
router.get('/:id/grievances', (req, res) => {
  const all = getAllGrievances();
  const filtered = all.filter(g => g.department_id === req.params.id);
  res.json({
    department_id: req.params.id,
    total: filtered.length,
    grievances: filtered
  });
});

// GET /api/departments/:id/overview
router.get('/:id/overview', (req, res) => {
  const analytics = getSupervisorAnalytics(req.params.id);
  res.json(analytics);
});

module.exports = router;
