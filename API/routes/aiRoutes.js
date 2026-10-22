const express = require('express');
const router = express.Router();
const { 
  getAIExplanationForGrievance, 
  getComplaintClusters, 
  getRecurringInfrastructureIssues, 
  predictDepartmentRouting,
  computeAIPriorityScore,
  callGeminiTriage 
} = require('../services/aiEngine');

// GET /api/ai/explain/:id
router.get('/explain/:id', (req, res) => {
  const explanation = getAIExplanationForGrievance(req.params.id);
  if (!explanation) {
    return res.status(404).json({ error: 'Grievance not found' });
  }
  res.json(explanation);
});

// GET /api/ai/clusters - group similar complaints
router.get('/clusters', (req, res) => {
  const clusters = getComplaintClusters();
  res.json({
    total_clusters: clusters.length,
    systemic_clusters: clusters.filter(c => c.is_systemic).length,
    clusters
  });
});

// GET /api/ai/recurring - detect recurring infrastructure breakdowns
router.get('/recurring', (req, res) => {
  const { department_id } = req.query;
  const recurring = getRecurringInfrastructureIssues(department_id);
  res.json({
    total_recurring_hotspots: recurring.length,
    recurring_issues: recurring
  });
});

// POST /api/ai/route - intelligent department router
router.post('/route', (req, res) => {
  const { text, current_department } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Complaint text is required for routing prediction.' });
  }
  const prediction = predictDepartmentRouting(text, current_department);
  res.json(prediction);
});

// POST /api/ai/evaluate-text - live AI score & analysis preview
router.post('/evaluate-text', async (req, res) => {
  const { title, description, category, locality } = req.body;
  
  // Try live Gemini 2.5 Flash analysis first
  const geminiResult = await callGeminiTriage(title, description, category, locality);
  if (geminiResult) {
    const isCrit = geminiResult.ai_priority_score >= 80;
    const isHigh = geminiResult.ai_priority_score >= 60;
    const isMed = geminiResult.ai_priority_score >= 35;

    return res.json({
      ai_priority_score: geminiResult.ai_priority_score,
      ai_priority_level: geminiResult.ai_priority_level || (isCrit ? 'Critical' : isHigh ? 'High' : isMed ? 'Medium' : 'Low'),
      badge_color: isCrit ? 'red' : isHigh ? 'orange' : isMed ? 'yellow' : 'green',
      priority_color: isCrit ? '#dc2626' : isHigh ? '#ea580c' : isMed ? '#ca8a04' : '#16a34a',
      risk_factors: geminiResult.risk_factors || [],
      suggested_actions: geminiResult.suggested_actions || [],
      estimated_resolution: geminiResult.estimated_resolution || '24–48 hours',
      routing_recommendation: {
        recommended_department_name: geminiResult.recommended_department_name,
        confidence_score: geminiResult.confidence_score || 94
      }
    });
  }

  // Local rule-based fallback
  const dummyRow = {
    title: title || '',
    description: description || '',
    category: category || 'Utilities',
    severity_label: 'High',
    urgency_label: 'Immediate',
    health_risk: (title + description).toLowerCase().includes('health') || (title + description).toLowerCase().includes('water') || (title + description).toLowerCase().includes('sewage') ? 'Yes' : 'No',
    safety_risk: (title + description).toLowerCase().includes('accident') || (title + description).toLowerCase().includes('dark') || (title + description).toLowerCase().includes('pothole') ? 'Yes' : 'No',
    essential_service: 'Yes',
    repeat_complaint_count: 1,
    escalation_level: 0,
    affected_people: 50,
    duration_hours: 12
  };

  const aiScore = computeAIPriorityScore(dummyRow);
  const routing = predictDepartmentRouting(`${title} ${description}`);

  res.json({
    ...aiScore,
    routing_recommendation: routing
  });
});

module.exports = router;
