const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const config = require('../config');

let grievancesCache = [];
let isLoaded = false;

// Ensure data folder exists
const dataDir = path.dirname(config.dataPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Compute Priority Score and AI Explanation Breakdown
function computeAIPriorityScore(row) {
  let score = 20; // baseline
  const explanations = [];
  const riskFactors = [];

  // Severity
  const sev = (row.severity_label || '').toLowerCase();
  if (sev === 'critical') {
    score += 25;
    riskFactors.push('Critical severity classification');
  } else if (sev === 'high') {
    score += 18;
    riskFactors.push('High severity civic impact');
  } else if (sev === 'medium') {
    score += 10;
  } else {
    score += 4;
  }

  // Urgency
  const urg = (row.urgency_label || '').toLowerCase();
  if (urg === 'immediate') {
    score += 20;
    riskFactors.push('Immediate urgency requirement');
  } else if (urg === 'high') {
    score += 14;
    riskFactors.push('High response urgency');
  } else if (urg === 'medium') {
    score += 8;
  } else {
    score += 3;
  }

  // Health Risk
  if (String(row.health_risk).toLowerCase() === 'yes' || row.health_risk === true) {
    score += 15;
    riskFactors.push('Public health risk (pathogen, sanitation, or water quality)');
  }

  // Safety Risk
  if (String(row.safety_risk).toLowerCase() === 'yes' || row.safety_risk === true) {
    score += 14;
    riskFactors.push('Public safety hazard (traffic hazard, physical danger, or dark stretch)');
  }

  // Essential Service
  if (String(row.essential_service).toLowerCase() === 'yes' || row.essential_service === true) {
    score += 12;
    riskFactors.push('Essential lifeline service disruption (drinking water, power, drainage)');
  }

  // Repeat / Clustered Complaints
  const repeats = parseInt(row.repeat_complaint_count, 10) || 0;
  if (repeats >= 5) {
    score += 14;
    riskFactors.push(`High repetition: ${repeats}+ similar grievances reported in same zone`);
  } else if (repeats >= 2) {
    score += 8;
    riskFactors.push(`Multiple linked reports: ${repeats} grievances in vicinity`);
  }

  // Escalation level
  const escLevel = parseInt(row.escalation_level, 10) || 0;
  if (escLevel >= 2) {
    score += 12;
    riskFactors.push(`Escalation Level ${escLevel}: multiple SLA breaches or supervisor trigger`);
  } else if (escLevel === 1) {
    score += 6;
    riskFactors.push('Escalated to local zonal team');
  }

  // Affected population
  const affected = parseInt(row.affected_people, 10) || 1;
  if (affected >= 500) {
    score += 10;
    riskFactors.push(`Mass community impact: ~${affected} citizens affected`);
  } else if (affected >= 100) {
    score += 6;
    riskFactors.push(`Significant community impact: ~${affected} citizens`);
  }

  // Duration hours
  const duration = parseInt(row.duration_hours, 10) || 0;
  if (duration >= 72) {
    score += 10;
    riskFactors.push(`Prolonged outage: unresolved for ${Math.round(duration / 24)} days (${duration} hrs)`);
  } else if (duration >= 24) {
    score += 5;
    riskFactors.push(`SLA at risk: ongoing for ${duration} hrs`);
  }

  // Vulnerable context keywords in description/title
  const text = `${row.title || ''} ${row.description || ''}`.toLowerCase();
  if (text.includes('school') || text.includes('children') || text.includes('hospital') || text.includes('elderly') || text.includes('medical')) {
    score += 8;
    riskFactors.push('Proximity to vulnerable demographic (school, hospital, children, or elderly)');
  }
  if (text.includes('accident') || text.includes('fell') || text.includes('collision') || text.includes('explosion') || text.includes('spark')) {
    score += 8;
    riskFactors.push('Active danger incident or accident reported');
  }
  if (text.includes('stomach') || text.includes('sick') || text.includes('illness') || text.includes('chemical') || text.includes('contaminated')) {
    score += 8;
    riskFactors.push('Direct health illness or toxic exposure symptom reported');
  }

  // Normalize score to 1 - 99 range
  score = Math.min(99, Math.max(12, Math.round(score)));

  // Determine Level
  let priorityLevel = 'Low';
  let badgeColor = 'green';
  let priorityColor = '#16a34a';

  if (score >= 80) {
    priorityLevel = 'Critical';
    badgeColor = 'red';
    priorityColor = '#dc2626';
  } else if (score >= 60) {
    priorityLevel = 'High';
    badgeColor = 'orange';
    priorityColor = '#ea580c';
  } else if (score >= 35) {
    priorityLevel = 'Medium';
    badgeColor = 'yellow';
    priorityColor = '#ca8a04';
  }

  // Suggested Next Actions
  const suggestedActions = [];
  if (row.category === 'Utilities' || row.subcategory === 'Water Supply') {
    suggestedActions.push('Dispatch emergency water tanker to locality');
    suggestedActions.push('Send pipeline maintenance engineering crew for pressure testing');
  } else if (row.category === 'Sanitation' || row.subcategory === 'Sewerage') {
    suggestedActions.push('Dispatch super sucker / jetting vehicle immediately');
    suggestedActions.push('Issue disinfectant spray and zone containment notice');
  } else if (row.category === 'Infrastructure' || row.subcategory === 'Roads') {
    suggestedActions.push('Install high-visibility barricades immediately');
    suggestedActions.push('Issue urgent asphalt repair work order to zonal contractor');
  } else if (row.category === 'Public Health') {
    suggestedActions.push('Collect water/contamination samples for fast-track lab testing');
    suggestedActions.push('Alert District Health Officer and prepare medical camp if required');
  } else if (row.category === 'Public Safety') {
    suggestedActions.push('Deploy traffic marshals to manage junction');
    suggestedActions.push('Dispatch signal electronics technician for controller replacement');
  } else {
    suggestedActions.push('Assign field verification officer for on-ground inspection');
    suggestedActions.push('Notify complainant with tracking ID and tentative resolution ETA');
  }

  // Estimated resolution time
  let estimatedResolution = '24–48 hours';
  if (score >= 85) estimatedResolution = '4–12 hours (Emergency)';
  else if (score >= 70) estimatedResolution = '12–24 hours (Urgent)';
  else if (score < 40) estimatedResolution = '3–5 working days';

  return {
    ai_priority_score: score,
    ai_priority_level: priorityLevel,
    badge_color: badgeColor,
    priority_color: priorityColor,
    risk_factors: riskFactors,
    suggested_actions: suggestedActions,
    estimated_resolution: estimatedResolution,
    ai_explanation: `AI Priority ${score}/100 [${priorityLevel.toUpperCase()}]: Identified ${riskFactors.length} critical factors including ${riskFactors.slice(0, 2).join('; ')}.`
  };
}

// Convert CSV Row to Clean Standardized Grievance Object
function getSampleImageUrl(ref, category) {
  if (!ref && !category) return null;
  const refLower = (ref || '').toLowerCase();
  const catLower = (category || '').toLowerCase();

  if (refLower.includes('water') || catLower.includes('water')) {
    return 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=600&auto=format&fit=crop&q=80';
  }
  if (refLower.includes('garbage') || refLower.includes('sewer') || catLower.includes('sanitation') || catLower.includes('waste')) {
    return 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=600&auto=format&fit=crop&q=80';
  }
  if (refLower.includes('pothole') || refLower.includes('road') || catLower.includes('roads') || catLower.includes('infrastructure')) {
    return 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80';
  }
  if (refLower.includes('light') || catLower.includes('light')) {
    return 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop&q=80';
  }
  if (refLower.includes('traffic') || catLower.includes('traffic')) {
    return 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&auto=format&fit=crop&q=80';
  }
  if (refLower.includes('power') || catLower.includes('electric')) {
    return 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&auto=format&fit=crop&q=80';
  }
  return 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=600&auto=format&fit=crop&q=80';
}

function normalizeRow(row) {
  const aiEvaluation = computeAIPriorityScore(row);
  
  // Calculate days open / elapsed
  const createdDate = new Date(row.created_at || '2026-08-01');
  const now = new Date('2026-08-19T13:00:00');
  const diffHours = Math.max(1, Math.round((now - createdDate) / (1000 * 60 * 60)));
  const daysOpen = Math.max(0, Math.floor(diffHours / 24));
  
  const slaHours = parseInt(row.sla_hours, 10) || 48;
  const isOverdue = row.status !== 'Resolved' && (diffHours > slaHours);
  const overdueHours = isOverdue ? (diffHours - slaHours) : 0;

  // Department name standardisation
  let deptName = row.department_name || 'Municipal Administration';
  let deptId = row.department_id || 'DEP-GEN-HYD';

  return {
    id: row.grievance_id,
    grievance_id: row.grievance_id,
    created_at: row.created_at,
    channel: row.channel || 'Web',
    language: row.language || 'English',
    citizen_id: row.citizen_id || 'CIT-UNKNOWN',
    citizen_name: row.citizen_name || `Citizen (${row.citizen_id || 'Resident'})`,
    citizen_phone: row.citizen_phone || '8074223136',
    title: row.title || 'Civic Grievance',
    description: row.description || '',
    category: row.category || 'General',
    subcategory: row.subcategory || 'General',
    issue_type: row.issue_type || row.subcategory || 'Issue',
    service_type: row.service_type || 'Civic Service',
    state: row.state || 'Telangana',
    district: row.district || 'Hyderabad',
    city: row.city || 'Hyderabad',
    zone: row.zone || 'Central Zone',
    ward: row.ward || 'Ward 1',
    locality: row.locality || 'Hyderabad Central',
    pincode: row.pincode || '500001',
    latitude: parseFloat(row.latitude) || 17.43,
    longitude: parseFloat(row.longitude) || 78.44,
    attachment_ref: row.attachment_ref || null,
    image_url: row.image_url || (row.attachment_ref ? getSampleImageUrl(row.attachment_ref, row.category) : null),
    department_id: deptId,
    department_name: deptName,
    assigned_officer_id: row.assigned_officer_id || 'OFF-GENERAL-01',
    assigned_officer_name: getOfficerName(row.assigned_officer_id, deptName),
    sla_hours: slaHours,
    status: row.status || 'Open',
    priority_label: row.priority_label || 'P2',
    severity_label: row.severity_label || 'Medium',
    urgency_label: row.urgency_label || 'Medium',
    affected_people: parseInt(row.affected_people, 10) || 1,
    duration_hours: parseInt(row.duration_hours, 10) || diffHours,
    days_open: daysOpen,
    is_overdue: isOverdue,
    overdue_hours: overdueHours,
    safety_risk: String(row.safety_risk).toLowerCase() === 'yes',
    health_risk: String(row.health_risk).toLowerCase() === 'yes',
    essential_service: String(row.essential_service).toLowerCase() === 'yes',
    complaint_group_id: row.complaint_group_id || `GRP-${row.locality || 'GEN'}-01`,
    duplicate_of: row.duplicate_of || null,
    is_duplicate: Boolean(row.duplicate_of && row.duplicate_of.trim()),
    repeat_complaint_count: parseInt(row.repeat_complaint_count, 10) || 1,
    resolution_history: row.resolution_history ? row.resolution_history.split(';').map(s => s.trim()).filter(Boolean) : [],
    resolution_action: row.resolution_action || '',
    resolved_at: row.resolved_at || null,
    escalation_required: String(row.escalation_required).toLowerCase() === 'yes',
    escalation_level: parseInt(row.escalation_level, 10) || 0,
    escalation_reason: row.escalation_reason || '',
    citizen_rating: row.citizen_rating ? parseFloat(row.citizen_rating) : null,
    feedback_text: row.feedback_text || '',
    
    // AI Computed enrichment
    ai_priority_score: aiEvaluation.ai_priority_score,
    ai_priority_level: aiEvaluation.ai_priority_level,
    badge_color: aiEvaluation.badge_color,
    priority_color: aiEvaluation.priority_color,
    risk_factors: aiEvaluation.risk_factors,
    suggested_actions: aiEvaluation.suggested_actions,
    estimated_resolution: aiEvaluation.estimated_resolution,
    ai_explanation: aiEvaluation.ai_explanation
  };
}

function getOfficerName(officerId, deptName) {
  const map = {
    'OFF-WATER-07': 'Suresh Reddy (Sr. Water Engineer)',
    'OFF-SAN-03': 'Anand Rao (Sanitation Inspector)',
    'OFF-SAN-04': 'K. Sunita (Waste Mgmt Officer)',
    'OFF-SAN-09': 'M. Narayana (Zonal Sanitation Lead)',
    'OFF-ROAD-11': 'Rajeshwar Goud (Executive Engineer Roads)',
    'OFF-ROADS-08': 'T. Prakash (Asst Engineer Roads)',
    'OFF-ROADS-04': 'C. Srinivas (Sub-Divisional Roads Officer)',
    'OFF-LIGHT-04': 'V. Satish (Electrical Maintenance Lead)',
    'OFF-LIGHT-03': 'P. Ravi (Streetlight Technician)',
    'OFF-LIGHT-07': 'B. Mohan (Zonal Electrician)',
    'OFF-WEL-02': 'Smt. Lakshmi Devi (Welfare Officer)',
    'OFF-WELFARE-05': 'G. Venkateshwarlu (Social Security Head)',
    'OFF-WELFARE-02': 'Smt. Lakshmi Devi (Welfare Officer)',
    'OFF-REC-06': 'B. Ramakrishna (Registrar B&D)',
    'OFF-RECORDS-03': 'K. Swapna (Civil Registrar)',
    'OFF-RECORDS-01': 'N. Vittal (Records Superintendent)',
    'OFF-SEWER-05': 'Mohd. Rafiq (Drainage & Sewerage Lead)',
    'OFF-SEWER-10': 'D. Ramesh (Sewer Operations Officer)',
    'OFF-SEWER-06': 'K. Shankar (Pipeline Specialist)',
    'OFF-TRAFFIC-09': 'Inspector K. Sudhakar (Traffic Div)',
    'OFF-TRAFFIC-01': 'SI Vijay Kumar (Traffic Ops)',
    'OFF-TRAFFIC-04': 'Inspector T. Raghavendra (Traffic Control)',
    'OFF-POWER-12': 'E. Krishna (Divisional Power Engineer)',
    'OFF-POWER-05': 'N. Bhaskar (Substation Incharge)',
    'OFF-TAX-04': 'S. Madhav (Revenue Officer)',
    'OFF-TAX-05': 'L. Padma (Tax Assessor)',
    'OFF-ENV-02': 'Dr. Pradeep Kumar (Environmental Officer)',
    'OFF-ENV-06': 'K. Anjali (Pollution Control Inspector)',
    'OFF-TRANS-03': 'R. David (Transit Infrastructure Incharge)',
    'OFF-TRANS-05': 'Y. Mahesh (Bus Depot Supervisor)',
    'OFF-HEALTH-08': 'Dr. K. Anuradha (Chief Medical Officer)',
    'OFF-HEALTH-02': 'Dr. S. Srikanth (Epidemic Control Officer)'
  };
  return map[officerId] || `${officerId || 'Officer'} (${deptName.split(' ')[0]})`;
}

// Load CSV into memory
function loadGrievances() {
  return new Promise((resolve, reject) => {
    // Check if grievances_store.json exists for persisted runtime edits
    if (fs.existsSync(config.dataPath)) {
      try {
        const raw = fs.readFileSync(config.dataPath, 'utf8');
        grievancesCache = JSON.parse(raw);
        isLoaded = true;
        console.log(`[DataLoader] Loaded ${grievancesCache.length} grievances from local JSON store.`);
        return resolve(grievancesCache);
      } catch (e) {
        console.warn('[DataLoader] JSON store corrupted, reading fresh from CSV...', e.message);
      }
    }

    const results = [];
    fs.createReadStream(config.csvFilePath)
      .pipe(csv({
        mapHeaders: ({ header }) => header.trim().replace(/^\ufeff/, '')
      }))
      .on('data', (data) => {
        if (data.grievance_id) {
          results.push(normalizeRow(data));
        }
      })
      .on('end', () => {
        // Sort descending by ai_priority_score so top emergencies appear first
        results.sort((a, b) => b.ai_priority_score - a.ai_priority_score);
        grievancesCache = results;
        isLoaded = true;
        saveGrievances();
        console.log(`[DataLoader] Successfully parsed ${grievancesCache.length} grievances from CSV.`);
        resolve(grievancesCache);
      })
      .on('error', (err) => {
        console.error('[DataLoader] Error reading CSV:', err);
        reject(err);
      });
  });
}

function saveGrievances() {
  try {
    fs.writeFileSync(config.dataPath, JSON.stringify(grievancesCache, null, 2), 'utf8');
  } catch (err) {
    console.error('[DataLoader] Failed to save JSON store:', err);
  }
}

function getAllGrievances() {
  return grievancesCache;
}

function getGrievanceById(id) {
  return grievancesCache.find(g => g.id === id || g.grievance_id === id);
}

function updateGrievance(id, updates) {
  const index = grievancesCache.findIndex(g => g.id === id || g.grievance_id === id);
  if (index === -1) return null;

  // Merge updates
  grievancesCache[index] = {
    ...grievancesCache[index],
    ...updates
  };

  // Re-run AI priority check if status or severity changed
  if (updates.status === 'Resolved') {
    grievancesCache[index].resolved_at = new Date().toISOString();
    grievancesCache[index].ai_priority_score = 0;
    grievancesCache[index].ai_priority_level = 'Low';
    grievancesCache[index].badge_color = 'green';
  }

  saveGrievances();
  return grievancesCache[index];
}

function addGrievance(data) {
  const newId = `GRV-${1000 + grievancesCache.length + 1}`;
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
  
  const rawObj = {
    grievance_id: newId,
    created_at: nowStr,
    channel: data.channel || 'Web Portal',
    language: data.language || 'English',
    citizen_id: data.citizen_id || `CIT-${Math.floor(1000 + Math.random() * 9000)}`,
    citizen_name: data.citizen_name || 'Resident Citizen',
    citizen_phone: data.citizen_phone || '8074223136',
    title: data.title,
    description: data.description,
    category: data.category || 'General',
    subcategory: data.subcategory || 'General Issue',
    issue_type: data.issue_type || data.subcategory || 'Civic Issue',
    service_type: data.service_type || 'Civic Service',
    state: 'Telangana',
    district: 'Hyderabad',
    city: 'Hyderabad',
    zone: data.zone || 'Kukatpally',
    ward: data.ward || '114',
    locality: data.locality || 'KPHB Colony',
    pincode: data.pincode || '500072',
    latitude: data.latitude || 17.4848,
    longitude: data.longitude || 78.3915,
    attachment_ref: data.attachment_ref || (data.image_url ? 'citizen_upload.jpg' : null),
    image_url: data.image_url || (data.attachment_ref ? getSampleImageUrl(data.attachment_ref, data.category) : null),
    department_id: data.department_id || 'DEP-GEN-HYD',
    department_name: data.department_name || 'Municipal Administration',
    assigned_officer_id: data.assigned_officer_id || 'OFF-GENERAL-01',
    sla_hours: data.sla_hours || 48,
    status: 'Open',
    priority_label: 'P2',
    severity_label: data.severity_label || 'High',
    urgency_label: data.urgency_label || 'High',
    affected_people: data.affected_people || 50,
    duration_hours: 1,
    safety_risk: data.safety_risk ? 'Yes' : 'No',
    health_risk: data.health_risk ? 'Yes' : 'No',
    essential_service: data.essential_service ? 'Yes' : 'No',
    complaint_group_id: data.complaint_group_id || `INC-${data.locality || 'HYD'}-001`,
    duplicate_of: '',
    repeat_complaint_count: 1,
    resolution_history: `${nowStr.substring(5, 10)} Filed by citizen; AI triage & prioritization complete`,
    resolution_action: '',
    resolved_at: '',
    escalation_required: 'No',
    escalation_level: 0,
    escalation_reason: '',
    citizen_rating: null,
    feedback_text: ''
  };

  const normalized = normalizeRow(rawObj);
  grievancesCache.unshift(normalized); // add to top
  saveGrievances();
  return normalized;
}

function resetToDefault() {
  if (fs.existsSync(config.dataPath)) {
    fs.unlinkSync(config.dataPath);
  }
  return loadGrievances();
}

module.exports = {
  loadGrievances,
  getAllGrievances,
  getGrievanceById,
  updateGrievance,
  addGrievance,
  resetToDefault,
  computeAIPriorityScore
};
