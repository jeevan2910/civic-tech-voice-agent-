const express = require('express');
const router = express.Router();
const { addGrievance, getAllGrievances, getGrievanceById, updateGrievance } = require('../utils/csvLoader');
const { callGeminiTriage, predictDepartmentRouting } = require('../services/aiEngine');

// In-memory Voice Call Logs
let callLogs = [
  {
    id: 'CALL-IVR-901',
    call_type: 'Inbound Helpline',
    phone_number: '9848022338',
    caller_name: 'Smt. Ananya Rao',
    timestamp: '2026-08-19 14:10',
    duration_seconds: 54,
    status: 'Completed',
    transcript: 'Citizen: "Hello, there is an open sewage pipeline leaking near Government Primary School in Moosapet. Children are walking in dirty water." \nAI Agent: "Thank you. I have registered your critical grievance under tracking ID GRV-1005 and dispatched GHMC Sanitation."',
    grievance_id: 'GRV-1005',
    ai_sentiment: 'Urgent',
    result: 'Grievance Auto-Created (P1 Critical)'
  },
  {
    id: 'CALL-OUT-802',
    call_type: 'Outbound Resolution Verification',
    phone_number: '9876543210',
    caller_name: 'Sri K. Venkat',
    timestamp: '2026-08-19 13:45',
    duration_seconds: 42,
    status: 'Completed',
    transcript: 'AI Agent: "Namaste Sri Venkat. This is GHMC Automated Care calling regarding your grievance GRV-1008 for streetlights in Ayyappa Society. Has your streetlight been repaired?" \nCitizen: "Yes, the electrician fixed the bulb yesterday. Good service." \nAI Agent: "Thank you! Case verified and closed with 5-star rating."',
    grievance_id: 'GRV-1008',
    ai_sentiment: 'Satisfied',
    result: 'Resolution Verified (5.0 ★)'
  }
];

// GET /api/voice/logs
router.get('/logs', (req, res) => {
  res.json({
    total_calls: callLogs.length,
    inbound_count: callLogs.filter(c => c.call_type.includes('Inbound')).length,
    outbound_count: callLogs.filter(c => c.call_type.includes('Outbound')).length,
    logs: callLogs
  });
});

// POST /api/voice/inbound-call - Process voice complaint from citizen
router.post('/inbound-call', async (req, res) => {
  const { speech_text, citizen_phone, citizen_name, language } = req.body;

  if (!speech_text || !speech_text.trim()) {
    return res.status(400).json({ error: 'Speech transcript text is required.' });
  }

  // Use Gemini to extract structured parameters from voice text
  let extracted = {
    title: speech_text.substring(0, 60),
    description: speech_text,
    locality: 'KPHB Colony',
    ward: '114',
    category: 'Utilities',
    subcategory: 'Water Supply',
    health_risk: speech_text.toLowerCase().includes('health') || speech_text.toLowerCase().includes('sewage') || speech_text.toLowerCase().includes('water'),
    safety_risk: speech_text.toLowerCase().includes('accident') || speech_text.toLowerCase().includes('pothole') || speech_text.toLowerCase().includes('dark')
  };

  // Try live Gemini 2.5 Flash for conversational extraction with fast timeout
  try {
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Voice timeout')), 3000));
    const geminiTriage = await Promise.race([
      callGeminiTriage(extracted.title, speech_text, extracted.category, extracted.locality),
      timeoutPromise
    ]);
    if (geminiTriage) {
      extracted.ai_priority_score = geminiTriage.ai_priority_score;
      extracted.ai_priority_level = geminiTriage.ai_priority_level;
      extracted.recommended_department = geminiTriage.recommended_department_name;
      extracted.risk_factors = geminiTriage.risk_factors;
      extracted.suggested_actions = geminiTriage.suggested_actions;
    }
  } catch (e) {
    console.warn('[VoiceRoutes] Gemini fast fallback engaged for voice agent');
  }

  const routing = predictDepartmentRouting(speech_text);

  // Auto-create grievance from voice call
  const newGrievance = addGrievance({
    title: extracted.title || 'Voice Registered Grievance',
    description: speech_text,
    category: extracted.category || routing.recommended_department_name?.includes('Water') ? 'Utilities' : 'Sanitation',
    subcategory: routing.recommended_department_name || 'Civic Helpline',
    locality: extracted.locality,
    ward: extracted.ward,
    zone: 'Kukatpally',
    citizen_name: citizen_name || 'Citizen Caller',
    citizen_phone: citizen_phone || '1800-425-4462',
    channel: 'AI Voice Helpline (1800-425-GHMC)',
    department_name: routing.recommended_department_name,
    department_id: routing.recommended_department_id
  });

  const callLog = {
    id: `CALL-IVR-${Math.floor(1000 + Math.random() * 9000)}`,
    call_type: 'Inbound Helpline',
    phone_number: citizen_phone || '1800-425-4462',
    caller_name: citizen_name || 'Citizen Caller',
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    duration_seconds: Math.floor(35 + Math.random() * 40),
    status: 'Completed',
    transcript: `Citizen: "${speech_text}"\nAI Voice Agent: "Namaste ${citizen_name || 'Citizen'}. Your grievance has been registered under Tracking ID ${newGrievance.id} with ${newGrievance.ai_priority_level} priority. Routed to ${newGrievance.department_name}."`,
    grievance_id: newGrievance.id,
    ai_sentiment: newGrievance.ai_priority_score >= 80 ? 'Critical' : 'Urgent',
    result: `Ticket Created (${newGrievance.id})`
  };

  callLogs.unshift(callLog);

  res.json({
    success: true,
    call_id: callLog.id,
    grievance: newGrievance,
    ai_spoken_response: `Namaste ${citizen_name || 'Citizen'}. Thank you for contacting Hyderabad Civic Helpline. Your grievance has been registered with ID ${newGrievance.id}. It has been classified as ${newGrievance.ai_priority_level} priority (${newGrievance.ai_priority_score}/100) and assigned to ${newGrievance.department_name}. An emergency field squad is taking action.`,
    transcript: callLog.transcript
  });
});

// POST /api/voice/trigger-outbound - Trigger AI follow-up call to citizen upon resolution
router.post('/trigger-outbound', (req, res) => {
  const { grievance_id, phone_number, citizen_name } = req.body;
  const grievance = getGrievanceById(grievance_id);

  if (!grievance) {
    return res.status(404).json({ error: 'Grievance not found' });
  }

  const promptSpeech = `Namaste ${citizen_name || grievance.citizen_id || 'Citizen'}. This is the GHMC Automated Resolution Care Agent calling regarding your grievance ${grievance.id} for ${grievance.title} in ${grievance.locality}. Our field crew reported this issue as resolved. Can you please confirm if the issue is fully resolved to your satisfaction?`;

  res.json({
    success: true,
    grievance_id: grievance.id,
    target_phone: phone_number || '9848022338',
    citizen_name: citizen_name || 'Resident Citizen',
    ai_prompt_speech: promptSpeech,
    status: 'Calling Citizen...'
  });
});

// POST /api/voice/outbound-response - Process citizen's feedback during outbound verification call
router.post('/outbound-response', (req, res) => {
  const { grievance_id, is_resolved, citizen_feedback, rating, phone_number } = req.body;
  const grievance = getGrievanceById(grievance_id);

  if (!grievance) {
    return res.status(404).json({ error: 'Grievance not found' });
  }

  const isConfirmed = is_resolved === true || String(is_resolved).toLowerCase() === 'yes';

  let callLog;
  if (isConfirmed) {
    // Verified resolved! Update citizen rating
    updateGrievance(grievance_id, {
      status: 'Resolved',
      citizen_rating: rating || 5.0,
      feedback_text: citizen_feedback || 'Citizen confirmed full resolution during automated outbound AI call.'
    });

    callLog = {
      id: `CALL-OUT-${Math.floor(1000 + Math.random() * 9000)}`,
      call_type: 'Outbound Resolution Verification',
      phone_number: phone_number || '9848022338',
      caller_name: grievance.citizen_id || 'Resident Citizen',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      duration_seconds: 38,
      status: 'Completed',
      transcript: `AI Agent: "Calling regarding ${grievance.id} in ${grievance.locality}. Has the issue been fixed?"\nCitizen: "${citizen_feedback || 'Yes, the repair was completed.'}"\nAI Agent: "Thank you for the verification. Your feedback of ${rating || 5.0} stars has been logged."`,
      grievance_id: grievance.id,
      ai_sentiment: 'Satisfied',
      result: `Verified Closed (${rating || 5.0} ★)`
    };
  } else {
    // Citizen reported issue still persists! Automatically re-open and escalate!
    updateGrievance(grievance_id, {
      status: 'Escalated',
      escalation_required: true,
      escalation_level: 3,
      escalation_reason: `Citizen reported issue still persisting during Outbound AI Verification Call: "${citizen_feedback || 'Issue unresolved'}"`,
      citizen_rating: rating || 1.0,
      feedback_text: citizen_feedback || 'Citizen stated issue is NOT resolved.'
    });

    callLog = {
      id: `CALL-OUT-${Math.floor(1000 + Math.random() * 9000)}`,
      call_type: 'Outbound Resolution Verification',
      phone_number: phone_number || '9848022338',
      caller_name: grievance.citizen_id || 'Resident Citizen',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      duration_seconds: 52,
      status: 'Completed',
      transcript: `AI Agent: "Calling regarding ${grievance.id} in ${grievance.locality}. Has the issue been fixed?"\nCitizen: "${citizen_feedback || 'No, water is still not coming.'}"\nAI Agent: "We apologize for the inconvenience. We have immediately re-escalated this ticket to Level 3 Supervisor intervention."`,
      grievance_id: grievance.id,
      ai_sentiment: 'Dissatisfied / Re-Escalated',
      result: 'Re-Opened & Level 3 Escalation'
    };
  }

  callLogs.unshift(callLog);

  res.json({
    success: true,
    is_confirmed: isConfirmed,
    updated_status: isConfirmed ? 'Resolved' : 'Escalated',
    call_log: callLog
  });
});

// ==========================================
// TELEPHONY GATEWAY (Twilio / Exotel Webhooks)
// ==========================================

// POST /api/voice/twilio/inbound - TwiML Voice Gateway
router.post('/twilio/inbound', (req, res) => {
  res.type('text/xml');
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Aditi" language="en-IN">Namaste! Welcome to Hyderabad Civic AI Helpline. Please state your civic complaint and your locality or ward after the tone.</Say>
    <Gather input="speech" action="/api/voice/twilio/process" timeout="5" speechTimeout="auto" language="en-IN">
        <Say voice="Polly.Aditi" language="en-IN">We are listening. Please speak now.</Say>
    </Gather>
</Response>`;
  res.send(twiml);
});

// POST /api/voice/twilio/process - Process spoken transcript from mobile phone
router.post('/twilio/process', async (req, res) => {
  const speechText = req.body.SpeechResult || req.body.speech_text || 'Water supply disruption in KPHB Colony';
  const callerPhone = req.body.From || '9848022338';

  const routing = predictDepartmentRouting(speechText);
  const newGrievance = addGrievance({
    title: speechText.substring(0, 50),
    description: speechText,
    category: routing.recommended_department_name?.includes('Water') ? 'Utilities' : 'Sanitation',
    locality: 'KPHB Colony',
    ward: '114',
    citizen_phone: callerPhone,
    channel: 'PSTN Voice Call',
    department_name: routing.recommended_department_name,
    department_id: routing.recommended_department_id
  });

  res.type('text/xml');
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Aditi" language="en-IN">Thank you! Your complaint has been registered under Tracking ID ${newGrievance.id} with ${newGrievance.ai_priority_level} priority. Routed to ${newGrievance.department_name}. An emergency squad is taking action. Goodbye!</Say>
    <Hangup/>
</Response>`;
  res.send(twiml);
});

module.exports = router;
