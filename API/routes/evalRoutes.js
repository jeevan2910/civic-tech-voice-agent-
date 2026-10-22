const express = require('express');
const router = express.Router();
const { getAIEvalMetrics, applyInputGuardrails } = require('../services/guardrailsService');

// GET /api/evals/metrics - fetch evaluation benchmark report
router.get('/metrics', (req, res) => {
  const metrics = getAIEvalMetrics();
  res.json(metrics);
});

// POST /api/evals/test-guardrail - test input text against guardrails live
router.post('/test-guardrail', (req, res) => {
  const { text } = req.body;
  const result = applyInputGuardrails(text);
  res.json(result);
});

module.exports = router;
