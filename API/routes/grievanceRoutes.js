const express = require('express');
const router = express.Router();
const { 
  getAllGrievances, 
  getGrievanceById, 
  updateGrievance, 
  addGrievance, 
  resetToDefault 
} = require('../utils/csvLoader');

// GET /api/grievances - list with filtering & search
router.get('/', (req, res) => {
  let list = getAllGrievances();
  const { 
    status, 
    priority, 
    department_id, 
    locality, 
    zone, 
    search, 
    is_overdue, 
    is_duplicate,
    channel,
    sort = 'priority_desc'
  } = req.query;

  // Filter by status
  if (status && status !== 'all') {
    list = list.filter(g => g.status.toLowerCase() === status.toLowerCase());
  }

  // Filter by priority
  if (priority && priority !== 'all') {
    list = list.filter(g => g.ai_priority_level.toLowerCase() === priority.toLowerCase());
  }

  // Filter by department
  if (department_id && department_id !== 'all') {
    list = list.filter(g => g.department_id === department_id);
  }

  // Filter by locality
  if (locality && locality !== 'all') {
    list = list.filter(g => g.locality.toLowerCase() === locality.toLowerCase());
  }

  // Filter by zone
  if (zone && zone !== 'all') {
    list = list.filter(g => g.zone.toLowerCase() === zone.toLowerCase());
  }

  // Filter overdue
  if (is_overdue === 'true') {
    list = list.filter(g => g.is_overdue);
  }

  // Filter duplicate
  if (is_duplicate === 'true') {
    list = list.filter(g => g.is_duplicate);
  }

  // Filter channel
  if (channel && channel !== 'all') {
    list = list.filter(g => g.channel.toLowerCase() === channel.toLowerCase());
  }

  // Search keyword in title, description, citizen_id, locality
  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    list = list.filter(g => 
      g.id.toLowerCase().includes(q) ||
      g.title.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q) ||
      g.locality.toLowerCase().includes(q) ||
      g.department_name.toLowerCase().includes(q) ||
      g.assigned_officer_name.toLowerCase().includes(q) ||
      g.citizen_id.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (sort === 'priority_desc') {
    list.sort((a, b) => b.ai_priority_score - a.ai_priority_score);
  } else if (sort === 'priority_asc') {
    list.sort((a, b) => a.ai_priority_score - b.ai_priority_score);
  } else if (sort === 'date_desc') {
    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else if (sort === 'affected_desc') {
    list.sort((a, b) => (b.affected_people || 0) - (a.affected_people || 0));
  }

  res.json({
    total: list.length,
    grievances: list
  });
});

// GET /api/grievances/:id
router.get('/:id', (req, res) => {
  const grievance = getGrievanceById(req.params.id);
  if (!grievance) {
    return res.status(404).json({ error: 'Grievance not found' });
  }
  res.json(grievance);
});

// POST /api/grievances - citizen submit
router.post('/', (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required.' });
  }

  const created = addGrievance(req.body);
  res.status(201).json({
    message: 'Grievance successfully submitted and prioritized by AI.',
    grievance: created
  });
});

// PUT /api/grievances/:id - general update
router.put('/:id', (req, res) => {
  const updated = updateGrievance(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Grievance not found' });
  }
  res.json({ message: 'Grievance updated successfully', grievance: updated });
});

// PUT /api/grievances/:id/escalate
router.put('/:id/escalate', (req, res) => {
  const existing = getGrievanceById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Grievance not found' });

  const newEscLevel = (existing.escalation_level || 0) + 1;
  const history = [...(existing.resolution_history || [])];
  history.push(`Manual officer escalation triggered -> Level ${newEscLevel}`);

  const updated = updateGrievance(req.params.id, {
    status: 'Escalated',
    escalation_required: true,
    escalation_level: newEscLevel,
    escalation_reason: req.body.reason || 'Escalated by Grievance Officer for priority intervention',
    resolution_history: history,
    ai_priority_score: Math.min(99, existing.ai_priority_score + 10),
    ai_priority_level: 'Critical',
    badge_color: 'red'
  });

  res.json({ message: 'Grievance escalated to supervisor', grievance: updated });
});

// PUT /api/grievances/:id/resolve
router.put('/:id/resolve', (req, res) => {
  const existing = getGrievanceById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Grievance not found' });

  const history = [...(existing.resolution_history || [])];
  history.push(`Marked Resolved: ${req.body.resolution_action || 'Field remediation completed.'}`);

  const updated = updateGrievance(req.params.id, {
    status: 'Resolved',
    resolution_action: req.body.resolution_action || 'Corrective field action completed and verified.',
    resolved_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
    resolution_history: history
  });

  res.json({ message: 'Grievance marked as resolved', grievance: updated });
});

// POST /api/grievances/reset
router.post('/reset/default', async (req, res) => {
  try {
    const fresh = await resetToDefault();
    res.json({ message: 'Dataset reset to original 120 records.', total: fresh.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset dataset' });
  }
});

module.exports = router;
