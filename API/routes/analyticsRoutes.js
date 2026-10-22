const express = require('express');
const router = express.Router();
const { 
  getOfficerSummary, 
  getSupervisorAnalytics, 
  getTrends, 
  getHeatmapData,
  getAllDepartments 
} = require('../services/analyticsService');

// GET /api/analytics/officer-summary - morning view metrics
router.get('/officer-summary', (req, res) => {
  const summary = getOfficerSummary();
  res.json(summary);
});

// GET /api/analytics/supervisor - department scoped
router.get('/supervisor', (req, res) => {
  const { department_id } = req.query;
  const analytics = getSupervisorAnalytics(department_id);
  res.json(analytics);
});

// GET /api/analytics/trends - inflow vs resolved
router.get('/trends', (req, res) => {
  const trends = getTrends();
  res.json(trends);
});

// GET /api/analytics/heatmap - geographic density
router.get('/heatmap', (req, res) => {
  const heatmap = getHeatmapData();
  res.json(heatmap);
});

// GET /api/analytics/departments - list all depts with metrics
router.get('/departments', (req, res) => {
  const depts = getAllDepartments();
  res.json(depts);
});

module.exports = router;
