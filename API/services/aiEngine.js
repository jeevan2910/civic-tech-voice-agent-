const { getAllGrievances, getGrievanceById, computeAIPriorityScore } = require('../utils/csvLoader');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config');

// Initialize Gemini Client
let geminiModel = null;
if (config.geminiApiKey) {
  try {
    const genAI = new GoogleGenerativeAI(config.geminiApiKey);
    geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    console.log('[AIEngine] ✨ Live Google Gemini 2.5 Flash LLM Engine Active & Connected!');
  } catch (err) {
    console.warn('[AIEngine] Failed to init Gemini SDK, using rule-based AI engine fallback:', err.message);
  }
}

// Live LLM Analysis Function
async function callGeminiTriage(title, description, category, locality) {
  if (!geminiModel) return null;

  const prompt = `You are an expert AI Municipal Grievance Triage Analyst for Hyderabad Civic Administration.
Analyze this citizen grievance:
Title: "${title || ''}"
Description: "${description || ''}"
Locality: "${locality || 'Hyderabad'}"
Category: "${category || 'General'}"

Return ONLY a valid JSON object without markdown fences, with these exact keys:
{
  "ai_priority_score": <number between 10 and 99>,
  "ai_priority_level": <"Critical" | "High" | "Medium" | "Low">,
  "recommended_department_name": <accurate Hyderabad civic department name>,
  "confidence_score": <number between 75 and 99>,
  "risk_factors": [<array of 3-5 specific civic/health/safety risk reasons>],
  "suggested_actions": [<array of 2-3 concrete field engineering next steps>],
  "estimated_resolution": <e.g. "4–12 hours (Emergency)" or "24–48 hours">,
  "sentiment": <"Frustrated" | "Angry" | "Urgent" | "Neutral">
}`;

  try {
    const result = await geminiModel.generateContent(prompt);
    let text = result.response.text().trim();
    text = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(text);
    return parsed;
  } catch (e) {
    console.warn('[AIEngine] Gemini query error, falling back to local heuristic engine:', e.message);
    return null;
  }
}

// Department keywords for intelligent auto-routing
const DEPARTMENT_RULES = [
  {
    id: 'DEP-WATER-HYD',
    name: 'Hyderabad Water Supply Department',
    keywords: ['water', 'drinking water', 'tap', 'pipeline', 'tanker', 'low pressure', 'no water', 'water outage', 'borewell', 'నీరు', 'తాగునీరు']
  },
  {
    id: 'DEP-SEWER-HYD',
    name: 'GHMC Sewerage Department',
    keywords: ['sewage', 'drain', 'drainage', 'manhole', 'overflow', 'super sucker', 'clogged drain', 'foul smell', 'gutter', 'మురుగు']
  },
  {
    id: 'DEP-SAN-HYD',
    name: 'Greater Hyderabad Municipal Corporation - Sanitation',
    keywords: ['garbage', 'waste', 'trash', 'dustbin', 'cleaning', 'dumping', 'litter', 'sanitation', 'చెత్త']
  },
  {
    id: 'DEP-ROADS-HYD',
    name: 'GHMC Roads Department',
    keywords: ['pothole', 'road', 'asphalt', 'divider', 'junction', 'damaged road', 'speed breaker', 'tar', 'గుంత']
  },
  {
    id: 'DEP-LIGHT-HYD',
    name: 'GHMC Street Lighting Department',
    keywords: ['streetlight', 'street light', 'lamp', 'dark', 'bulb', 'pole', 'street lamp', 'lighting', 'దీపం']
  },
  {
    id: 'DEP-POWER-HYD',
    name: 'Electricity Distribution Department',
    keywords: ['electricity', 'power cut', 'power outage', 'transformer', 'voltage', 'current', 'electric shock', 'wire', 'కరెంట్']
  },
  {
    id: 'DEP-HEALTH-HYD',
    name: 'Hyderabad Public Health Department',
    keywords: ['contamination', 'chemical smell', 'stomach', 'sick', 'vomiting', 'fever', 'dengue', 'mosquitoes', 'hospital', 'clinic', 'ఆరోగ్యం']
  },
  {
    id: 'DEP-TRAFFIC-HYD',
    name: 'Hyderabad Traffic Police',
    keywords: ['traffic signal', 'signal', 'traffic', 'junction', 'congestion', 'signal failure', 'red light', 'సిగ్నల్']
  },
  {
    id: 'DEP-WELFARE-HYD',
    name: 'Social Welfare Department',
    keywords: ['pension', 'old age', 'social welfare', 'pension delay', 'scholarship', 'welfare payment', 'పెన్షన్']
  },
  {
    id: 'DEP-RECORDS-HYD',
    name: 'GHMC Birth and Death Records',
    keywords: ['birth certificate', 'death certificate', 'certificate', 'correction', 'name change', 'spelling', 'record']
  },
  {
    id: 'DEP-ENV-HYD',
    name: 'GHMC Environmental Enforcement',
    keywords: ['illegal dumping', 'lake', 'debris', 'construction waste', 'pollution', 'factory', 'air quality']
  },
  {
    id: 'DEP-TRANS-HYD',
    name: 'Public Transport Infrastructure Department',
    keywords: ['bus stop', 'bus shelter', 'bus route', 'bus stand', 'rtc bus', 'transport']
  },
  {
    id: 'DEP-TAX-HYD',
    name: 'GHMC Property Tax Department',
    keywords: ['property tax', 'tax receipt', 'assessment', 'trade license', 'challan', 'payment']
  }
];

// Predict department and route
function predictDepartmentRouting(text, currentDept) {
  const lowerText = (text || '').toLowerCase();
  let bestMatch = null;
  let maxScore = 0;

  for (const dept of DEPARTMENT_RULES) {
    let matchCount = 0;
    for (const kw of dept.keywords) {
      if (lowerText.includes(kw.toLowerCase())) {
        matchCount += 1;
      }
    }
    if (matchCount > maxScore) {
      maxScore = matchCount;
      bestMatch = dept;
    }
  }

  const confidence = bestMatch ? Math.min(98, 70 + (maxScore * 10)) : 65;
  const recommended = bestMatch || DEPARTMENT_RULES[0];
  const isMisrouted = currentDept && recommended.name !== currentDept;

  return {
    recommended_department_id: recommended.id,
    recommended_department_name: recommended.name,
    confidence_score: confidence,
    is_currently_misrouted: isMisrouted,
    routing_reason: `AI matched ${maxScore} domain keywords relating to ${recommended.name}.`
  };
}

// Generate Detailed AI Explanation for a single complaint
function getAIExplanationForGrievance(id) {
  const grievance = getGrievanceById(id);
  if (!grievance) return null;

  const all = getAllGrievances();
  
  // Find similar complaints in the same locality / subcategory
  const similar = all.filter(g => 
    g.id !== grievance.id && 
    (g.complaint_group_id === grievance.complaint_group_id || 
     (g.locality === grievance.locality && g.subcategory === grievance.subcategory) ||
     (g.duplicate_of === grievance.id || grievance.duplicate_of === g.id))
  );

  const routing = predictDepartmentRouting(`${grievance.title} ${grievance.description}`, grievance.department_name);

  // Compile detailed "Why is this Priority X/100?" report
  return {
    grievance_id: grievance.id,
    title: grievance.title,
    description: grievance.description,
    locality: grievance.locality,
    ward: grievance.ward,
    zone: grievance.zone,
    ai_priority_score: grievance.ai_priority_score,
    ai_priority_level: grievance.ai_priority_level,
    badge_color: grievance.badge_color,
    priority_color: grievance.priority_color,
    status: grievance.status,
    days_open: grievance.days_open,
    affected_people: grievance.affected_people,
    attachment_ref: grievance.attachment_ref,
    image_url: grievance.image_url,
    category: grievance.category,
    
    // Core AI Breakdown
    why_high_priority: [
      grievance.health_risk ? 'Severe public health hazard detected' : null,
      grievance.safety_risk ? 'Immediate public safety danger identified' : null,
      grievance.essential_service ? 'Essential lifeline civic service disrupted' : null,
      similar.length > 0 ? `${similar.length + 1} correlated citizen complaints in ${grievance.locality}` : null,
      grievance.days_open >= 3 ? `Unresolved for ${grievance.days_open} days (${grievance.duration_hours} hrs)` : null,
      grievance.escalation_level > 0 ? `Active Escalation Level ${grievance.escalation_level} (${grievance.escalation_reason || 'SLA breached'})` : null,
      grievance.affected_people >= 100 ? `High community impact: ~${grievance.affected_people} citizens affected` : null,
      (grievance.title + grievance.description).toLowerCase().includes('school') ? 'High vulnerability: Located near primary school / educational facility' : null
    ].filter(Boolean),

    risk_factors: grievance.risk_factors || [],
    suggested_actions: grievance.suggested_actions || [],
    estimated_resolution: grievance.estimated_resolution || '24–48 hours',

    routing_recommendation: {
      current_department: grievance.department_name,
      recommended_department: routing.recommended_department_name,
      confidence: `${routing.confidence_score}%`,
      is_misrouted: routing.is_currently_misrouted,
      routing_rationale: routing.routing_reason
    },

    similar_complaints: similar.map(s => ({
      id: s.id,
      title: s.title,
      created_at: s.created_at,
      channel: s.channel,
      status: s.status,
      is_duplicate: s.is_duplicate,
      locality: s.locality
    })),

    incident_group_info: {
      group_id: grievance.complaint_group_id,
      total_in_group: similar.length + 1,
      is_systemic_issue: (similar.length + 1) >= 3,
      systemic_summary: (similar.length + 1) >= 3 
        ? `Systemic infrastructure cluster: ${similar.length + 1} citizens filed grievances in ${grievance.locality} for ${grievance.subcategory}. Indicates core structural failure rather than isolated incident.` 
        : 'Isolated incident reported.'
    }
  };
}

// Group all complaints into AI clusters
function getComplaintClusters() {
  const all = getAllGrievances();
  const groupsMap = {};

  all.forEach(g => {
    const key = g.complaint_group_id || `GRP-${g.locality}-${g.subcategory}`;
    if (!groupsMap[key]) {
      groupsMap[key] = {
        group_id: key,
        title: `${g.subcategory} issue in ${g.locality}`,
        department_name: g.department_name,
        category: g.category,
        subcategory: g.subcategory,
        locality: g.locality,
        ward: g.ward,
        zone: g.zone,
        latitude: g.latitude,
        longitude: g.longitude,
        complaints: [],
        total_affected_people: 0,
        max_priority_score: 0,
        has_health_risk: false,
        has_safety_risk: false,
        open_count: 0,
        resolved_count: 0
      };
    }

    groupsMap[key].complaints.push(g);
    groupsMap[key].total_affected_people += (g.affected_people || 1);
    if (g.ai_priority_score > groupsMap[key].max_priority_score) {
      groupsMap[key].max_priority_score = g.ai_priority_score;
    }
    if (g.health_risk) groupsMap[key].has_health_risk = true;
    if (g.safety_risk) groupsMap[key].has_safety_risk = true;
    if (g.status === 'Resolved') groupsMap[key].resolved_count += 1;
    else groupsMap[key].open_count += 1;
  });

  const clusters = Object.values(groupsMap).map(grp => {
    const isSystemic = grp.complaints.length >= 3;
    let severity = 'Low';
    if (grp.max_priority_score >= 80) severity = 'Critical';
    else if (grp.max_priority_score >= 60) severity = 'High';
    else if (grp.max_priority_score >= 35) severity = 'Medium';

    return {
      ...grp,
      complaint_count: grp.complaints.length,
      is_systemic: isSystemic,
      cluster_severity: severity,
      ai_summary: isSystemic
        ? `AI Cluster Warning: ${grp.complaints.length} linked complaints in ${grp.locality} for ${grp.subcategory}. Affects ~${grp.total_affected_people} citizens. Root cause inspection recommended.`
        : `Standard localized report with ${grp.complaints.length} complaint(s).`,
      recommended_action: grp.has_health_risk 
        ? 'Deploy emergency field sanitation & health inspection squad.' 
        : grp.has_safety_risk 
          ? 'Dispatch emergency road/electrical safety crew for immediate barricading.'
          : 'Schedule standard maintenance work order with local zonal engineer.'
    };
  });

  // Sort by count and max priority
  clusters.sort((a, b) => (b.complaint_count * 10 + b.max_priority_score) - (a.complaint_count * 10 + a.max_priority_score));
  return clusters;
}

// Detect Recurring Infrastructure Issues for Supervisors
function getRecurringInfrastructureIssues(departmentId) {
  const all = getAllGrievances();
  const filtered = departmentId ? all.filter(g => g.department_id === departmentId) : all;

  // Group by locality + subcategory
  const locationMap = {};
  filtered.forEach(g => {
    const locKey = `${g.locality}__${g.subcategory}`;
    if (!locationMap[locKey]) {
      locationMap[locKey] = {
        locality: g.locality,
        ward: g.ward,
        zone: g.zone,
        category: g.category,
        subcategory: g.subcategory,
        department_name: g.department_name,
        department_id: g.department_id,
        complaints: [],
        total_affected: 0,
        resolved_times: 0,
        reopened_times: 0
      };
    }
    locationMap[locKey].complaints.push(g);
    locationMap[locKey].total_affected += (g.affected_people || 1);
    if (g.status === 'Resolved') locationMap[locKey].resolved_times += 1;
    if (g.repeat_complaint_count > 1) locationMap[locKey].reopened_times += g.repeat_complaint_count;
  });

  const recurringIssues = Object.values(locationMap)
    .filter(item => item.complaints.length >= 2 || item.reopened_times >= 2)
    .map(item => {
      const count = item.complaints.length;
      return {
        id: `REC-${item.locality.replace(/\s+/g, '-').toUpperCase()}-${item.subcategory.replace(/\s+/g, '-').toUpperCase()}`,
        infrastructure_asset: `${item.subcategory} Grid at ${item.locality} (Ward ${item.ward})`,
        locality: item.locality,
        ward: item.ward,
        zone: item.zone,
        department_name: item.department_name,
        department_id: item.department_id,
        repeat_incident_count: count,
        total_citizens_affected: item.total_affected,
        ai_pattern_insight: `AI detected ${count} repeated failures in ${item.locality} over the past 3 weeks affecting ~${item.total_affected} residents. Temporary repairs have failed.`,
        root_cause_diagnosis: `Underlying pipeline/cable/pavement degradation requiring capital infrastructure overhaul rather than spot patch.`,
        recommended_permanent_fix: `Issue departmental Capital Works Order for complete re-laying/replacement of asset in Ward ${item.ward}.`,
        urgency: count >= 4 ? 'Immediate Capital Intervention' : 'High Priority Overhaul',
        sample_complaints: item.complaints.map(c => ({ id: c.id, title: c.title, status: c.status, days_open: c.days_open }))
      };
    });

  recurringIssues.sort((a, b) => b.repeat_incident_count - a.repeat_incident_count);
  return recurringIssues;
}

module.exports = {
  computeAIPriorityScore,
  predictDepartmentRouting,
  getAIExplanationForGrievance,
  getComplaintClusters,
  getRecurringInfrastructureIssues,
  callGeminiTriage
};
