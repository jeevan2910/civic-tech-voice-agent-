import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/api/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import confetti from 'canvas-confetti';
import { 
  Phone, 
  PhoneCall, 
  PhoneIncoming, 
  PhoneOutgoing, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  Sparkles, 
  CheckCircle2, 
  AlertOctagon, 
  Clock, 
  Users, 
  Building, 
  RefreshCw, 
  Star, 
  Radio,
  Play,
  Search,
  RotateCcw,
  Headphones,
  Check
} from 'lucide-react';

export function VoiceAgentPage() {
  const [activeTab, setActiveTab] = useState('inbound'); // 'inbound' | 'outbound' | 'logs'
  const [callStatus, setCallStatus] = useState('idle'); // 'idle' | 'calling' | 'connected' | 'ended'
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [callerName, setCallerName] = useState('Rohan');
  const [callerPhone, setCallerPhone] = useState('8074223136');
  const [agentResponseText, setAgentResponseText] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [callLogs, setCallLogs] = useState([]);
  const [allGrievances, setAllGrievances] = useState([]);
  const [outboundFilter, setOutboundFilter] = useState('all'); // 'all' | 'resolved' | 'open'
  const [outboundSearch, setOutboundSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [registeredGrievance, setRegisteredGrievance] = useState(null);

  // Outbound verification state
  const [selectedOutboundGrv, setSelectedOutboundGrv] = useState(null);
  const [outboundStep, setOutboundStep] = useState('idle'); // 'idle' | 'ringing' | 'connected' | 'completed'
  const [citizenAnswer, setCitizenAnswer] = useState('yes'); // 'yes' | 'no'
  const [citizenRating, setCitizenRating] = useState(5);
  const [citizenFeedbackText, setCitizenFeedbackText] = useState('Yes, the problem was fixed completely. Thank you.');
  const [outboundResult, setOutboundResult] = useState(null);

  const durationTimerRef = useRef(null);
  const recognitionRef = useRef(null);

  // Load call logs and all grievances
  const loadData = async () => {
    setLoading(true);
    try {
      const [logsRes, grvRes] = await Promise.all([
        api.getVoiceLogs(),
        api.getGrievances()
      ]);
      setCallLogs(logsRes?.logs || []);
      
      const rawList = grvRes?.grievances || [];
      // Sort descending by ID number so latest registered ticket (e.g. GRV-1125, GRV-1124) appears at top
      const sorted = [...rawList].sort((a, b) => {
        const numA = parseInt(a.id.replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(b.id.replace(/\D/g, ''), 10) || 0;
        return numB - numA;
      });

      setAllGrievances(sorted);
      if (sorted.length > 0 && !selectedOutboundGrv) {
        setSelectedOutboundGrv(sorted[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Web Speech Synthesis (TTS Voice)
  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // stop previous
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    // Pick an English or Indian accent voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('en-IN') || v.name.includes('India') || v.lang.includes('en-GB') || v.lang.includes('en-US'));
    if (preferredVoice) utterance.voice = preferredVoice;

    window.speechSynthesis.speak(utterance);
  };

  // Speech Recognition (STT Microphone)
  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. You can click the voice sample buttons to simulate.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      setSpeechTranscript(transcript);
    };
    recognition.onerror = (e) => {
      console.warn('Speech recognition error:', e.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Start Inbound Call Simulation
  const startInboundCall = () => {
    setCallStatus('connected');
    setCallDuration(0);
    setRegisteredGrievance(null);
    const greeting = `Namaste ${callerName}! Welcome to Hyderabad Civic AI Helpline. Please speak your civic complaint and which colony or ward you are reporting from.`;
    setAgentResponseText(greeting);
    speakText(greeting);

    durationTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  // End Call
  const endInboundCall = () => {
    setCallStatus('ended');
    clearInterval(durationTimerRef.current);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
  };

  // Submit Spoken Grievance to AI Engine
  const processSpokenGrievance = async () => {
    if (!speechTranscript.trim()) return;

    setLoading(true);
    try {
      const res = await api.submitVoiceCall({
        speech_text: speechTranscript,
        citizen_phone: callerPhone,
        citizen_name: callerName
      });

      setRegisteredGrievance(res.grievance);
      setSelectedOutboundGrv(res.grievance); // Automatically select newly created ticket for Outbound verification
      setAgentResponseText(res.ai_spoken_response);
      speakText(res.ai_spoken_response);

      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      await loadData();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Preset Voice Prompts
  const selectVoicePreset = (text) => {
    setSpeechTranscript(text);
  };

  // 1-Click Mark as Resolved & Select
  const markAsResolvedAndSelect = async (g, e) => {
    if (e) e.stopPropagation();
    try {
      await api.resolveGrievance(g.id, 'Resolved by Field Squad - Automated AI verification initiated');
      await loadData();
      setSelectedOutboundGrv({ ...g, status: 'Resolved' });
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- OUTBOUND RESOLUTION FLOW ----------------
  const startOutboundVerificationCall = () => {
    if (!selectedOutboundGrv) return;
    setOutboundStep('ringing');
    setOutboundResult(null);

    setTimeout(() => {
      setOutboundStep('connected');
      const speech = `Namaste ${selectedOutboundGrv.citizen_name || selectedOutboundGrv.citizen_id || 'Citizen'}. This is the GHMC Automated Resolution Care Agent calling regarding your grievance ${selectedOutboundGrv.id} for ${selectedOutboundGrv.title} in ${selectedOutboundGrv.locality}. Our field crew reported this issue as resolved. Can you please confirm if the issue is fully fixed?`;
      speakText(speech);
    }, 1500);
  };

  const submitOutboundCitizenResponse = async () => {
    if (!selectedOutboundGrv) return;
    setLoading(true);
    try {
      const res = await api.submitOutboundResponse({
        grievance_id: selectedOutboundGrv.id,
        is_resolved: citizenAnswer === 'yes',
        citizen_feedback: citizenFeedbackText,
        rating: citizenAnswer === 'yes' ? citizenRating : 1.0,
        phone_number: selectedOutboundGrv.citizen_phone || callerPhone
      });

      setOutboundResult(res);
      setOutboundStep('completed');
      speakText(res.ai_response_speech);
      await loadData();
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtered grievances for Outbound
  const filteredOutboundList = allGrievances.filter((g) => {
    // Filter by tab
    if (outboundFilter === 'resolved' && g.status !== 'Resolved') return false;
    if (outboundFilter === 'open' && g.status === 'Resolved') return false;

    // Filter by search text
    if (outboundSearch.trim()) {
      const q = outboundSearch.toLowerCase().trim();
      const matchId = g.id.toLowerCase().includes(q);
      const matchTitle = (g.title || '').toLowerCase().includes(q);
      const matchLoc = (g.locality || '').toLowerCase().includes(q);
      const matchPhone = (g.citizen_phone || '').includes(q);
      const matchName = (g.citizen_name || '').toLowerCase().includes(q);
      return matchId || matchTitle || matchLoc || matchPhone || matchName;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8DEC8] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#C87A1E] text-white flex items-center justify-center shadow-xs">
              <Headphones className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-black text-[#231F1B] tracking-tight">
              AI Voice Agent Helpline &amp; Outbound Verification
            </h1>
          </div>
          <p className="text-xs text-[#7A7064] font-medium mt-1">
            Automated Inbound Citizen IVR Helpline (1800-425-GHMC) and AI Outbound Post-Resolution Verification Calling.
          </p>
        </div>

        {/* Tab Switchers */}
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant={activeTab === 'inbound' ? 'default' : 'outline'}
            onClick={() => setActiveTab('inbound')}
            className="text-xs font-bold"
          >
            <PhoneIncoming className="h-3.5 w-3.5 mr-1.5" />
            Inbound Call Agent
          </Button>
          <Button 
            size="sm" 
            variant={activeTab === 'outbound' ? 'default' : 'outline'}
            onClick={() => {
              setActiveTab('outbound');
              loadData();
            }}
            className="text-xs font-bold"
          >
            <PhoneOutgoing className="h-3.5 w-3.5 mr-1.5" />
            Outbound Resolution Call ({allGrievances.length})
          </Button>
          <Button 
            size="sm" 
            variant={activeTab === 'logs' ? 'default' : 'outline'}
            onClick={() => setActiveTab('logs')}
            className="text-xs"
          >
            Call Logs ({callLogs.length})
          </Button>
        </div>
      </div>

      {/* ---------------- TAB 1: INBOUND CITIZEN HELPLINE ---------------- */}
      {activeTab === 'inbound' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: PHONE CALL DIALER SIMULATOR (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <Card className="border-[#E8DEC8] bg-white shadow-md overflow-hidden rounded-2xl">
              <div className="bg-[#231F1B] p-5 text-white text-center space-y-3">
                <div className="flex items-center justify-between text-xs text-[#A8A29E]">
                  <span className="flex items-center gap-1.5">
                    <Radio className="h-3 w-3 text-[#16A34A] animate-pulse" />
                    GHMC Toll-Free IVR Service
                  </span>
                  <Badge variant="amber" className="text-[10px]">
                    1800-425-4462
                  </Badge>
                </div>

                <div className="py-2">
                  <div className="h-16 w-16 rounded-full bg-[#39342F] border-2 border-[#C87A1E] text-[#F3EBDD] flex items-center justify-center mx-auto shadow-inner">
                    <PhoneCall className={`h-8 w-8 ${callStatus === 'connected' ? 'text-[#16A34A] animate-bounce' : 'text-[#C87A1E]'}`} />
                  </div>
                  <h3 className="text-lg font-black mt-2 text-white">
                    {callStatus === 'connected' ? 'Call in Progress...' : 'Citizen Helpline Dialer'}
                  </h3>
                  <p className="text-xs font-mono text-[#F7D49D]">
                    {callStatus === 'connected' 
                      ? `Duration: ${Math.floor(callDuration / 60)}:${(callDuration % 60).toString().padStart(2, '0')}` 
                      : 'Press Start Call to connect'}
                  </p>
                </div>

                {/* Call Control Buttons */}
                <div className="flex justify-center gap-4 pt-1">
                  {callStatus !== 'connected' ? (
                    <Button 
                      onClick={startInboundCall}
                      className="bg-[#16A34A] hover:bg-[#15803D] text-white font-black px-6 py-2 rounded-full shadow-md text-xs flex items-center gap-2"
                    >
                      <Phone className="h-4 w-4" /> Start Inbound Call
                    </Button>
                  ) : (
                    <Button 
                      onClick={endInboundCall}
                      className="bg-[#DC2626] hover:bg-[#B91C1C] text-white font-black px-6 py-2 rounded-full shadow-md text-xs flex items-center gap-2"
                    >
                      <PhoneOff className="h-4 w-4" /> End Call
                    </Button>
                  )}
                </div>
              </div>

              {/* Caller Details & Voice Input */}
              <CardContent className="p-5 space-y-4">
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-[#8C8276]">Caller Name:</label>
                    <Input 
                      value={callerName} 
                      onChange={(e) => setCallerName(e.target.value)} 
                      disabled={callStatus === 'connected'}
                      className="text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[#8C8276]">Caller Mobile:</label>
                    <Input 
                      value={callerPhone} 
                      onChange={(e) => setCallerPhone(e.target.value)} 
                      disabled={callStatus === 'connected'}
                      className="text-xs font-bold font-mono"
                    />
                  </div>
                </div>

                {/* Speech Input Box */}
                <div className="space-y-2 pt-2 border-t border-[#F3EBDD]">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs text-[#231F1B] flex items-center gap-1.5">
                      <Mic className="h-4 w-4 text-[#C87A1E]" />
                      Citizen Spoken Statement (Microphone / Text):
                    </label>
                    <Button 
                      type="button"
                      size="sm" 
                      variant={isListening ? 'danger' : 'outline'}
                      onClick={toggleSpeechRecognition}
                      className="text-xs h-7 gap-1"
                    >
                      {isListening ? (
                        <>
                          <MicOff className="h-3 w-3" /> Listening... (Click to stop)
                        </>
                      ) : (
                        <>
                          <Mic className="h-3 w-3" /> Record Voice
                        </>
                      )}
                    </Button>
                  </div>

                  <Textarea
                    value={speechTranscript}
                    onChange={(e) => setSpeechTranscript(e.target.value)}
                    placeholder="Speak into microphone or type what citizen says: 'No drinking water in KPHB Colony since 3 days, 200 families affected...'"
                    className="min-h-[90px] text-xs font-medium"
                  />

                  {/* Sample Voice Scenarios */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-bold text-[#8C8276] block uppercase">
                      Or click sample caller speech:
                    </span>
                    <div className="flex flex-col gap-1.5 text-[11px]">
                      <button
                        type="button"
                        onClick={() => selectVoicePreset('Namaste, open sewage pipeline is overflowing near Government Primary School in Moosapet for 4 days. Children are getting sick.')}
                        className="text-left p-2 rounded-lg bg-[#FAF6EE] hover:bg-[#FEF6EA] border border-[#E8DEC8] text-[#8C4A00] font-semibold cursor-pointer"
                      >
                        🎙️ "Open sewage near school in Moosapet for 4 days..."
                      </button>
                      <button
                        type="button"
                        onClick={() => selectVoicePreset('There has been no drinking water supply in KPHB Colony for three days. Over 400 families need an emergency water tanker.')}
                        className="text-left p-2 rounded-lg bg-[#FAF6EE] hover:bg-[#FEF6EA] border border-[#E8DEC8] text-[#8C4A00] font-semibold cursor-pointer"
                      >
                        🎙️ "No drinking water in KPHB Colony for 3 days..."
                      </button>
                      <button
                        type="button"
                        onClick={() => selectVoicePreset('Large dangerous pothole at Kukatpally junction. Two bikes fell last night. Please repair immediately.')}
                        className="text-left p-2 rounded-lg bg-[#FAF6EE] hover:bg-[#FEF6EA] border border-[#E8DEC8] text-[#8C4A00] font-semibold cursor-pointer"
                      >
                        🎙️ "Large pothole at Kukatpally junction..."
                      </button>
                    </div>
                  </div>

                  {/* Submit Audio Button */}
                  <div className="pt-2">
                    <Button
                      onClick={processSpokenGrievance}
                      disabled={loading || !speechTranscript.trim()}
                      className="w-full font-black text-xs h-10"
                    >
                      <Sparkles className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                      {loading ? 'AI Voice Engine Processing...' : 'Submit & Register Grievance from Voice Call'}
                    </Button>
                  </div>

                </div>

              </CardContent>
            </Card>
          </div>

          {/* RIGHT: AI AGENT CONVERSATION & TICKET CREATION (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Real-time AI Agent Voice Feedback */}
            <Card className="border-[#F7D49D] bg-gradient-to-br from-[#FEF6EA] via-white to-[#FAF6EE] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#F7D49D]/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-[#C87A1E] text-white flex items-center justify-center shadow-xs">
                    <Volume2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#231F1B]">
                      AI Voice Agent Spoken Response
                    </h3>
                    <p className="text-[10px] text-[#7A7064]">
                      Text-to-Speech (TTS) Interactive Dialogue
                    </p>
                  </div>
                </div>
                {agentResponseText && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => speakText(agentResponseText)}
                    className="text-xs h-7 gap-1 bg-white"
                  >
                    <Play className="h-3 w-3 text-[#C87A1E]" /> Replay Voice
                  </Button>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[#E8DEC8] text-xs font-medium text-[#231F1B] leading-relaxed italic">
                "{agentResponseText || 'Start a call to hear the AI Voice Agent speak...'}"
              </div>

              {/* Registered Ticket Details */}
              {registeredGrievance && (
                <div className="rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] p-4 space-y-3 shadow-xs text-xs animate-in zoom-in-95">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#14532D] flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
                      Ticket Auto-Registered via Voice Call:
                    </span>
                    <Badge variant="critical" className="font-black text-xs">
                      {registeredGrievance.id}
                    </Badge>
                  </div>

                  <div className="space-y-1.5 bg-white p-3 rounded-lg border border-[#BBF7D0]">
                    <div className="flex justify-between">
                      <span className="text-[#8C8276] font-bold">AI Priority Score:</span>
                      <span className="font-black text-[#DC2626]">{registeredGrievance.ai_priority_score}/100 ({registeredGrievance.ai_priority_level})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8C8276] font-bold">Auto-Routed Dept:</span>
                      <span className="font-bold text-[#231F1B]">{registeredGrievance.department_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8C8276] font-bold">Assigned Field Unit:</span>
                      <span className="font-bold text-[#231F1B]">{registeredGrievance.assigned_officer_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8C8276] font-bold">Registered Mobile:</span>
                      <span className="font-mono text-[#C87A1E] font-bold">{registeredGrievance.citizen_phone || callerPhone}</span>
                    </div>
                  </div>

                  {/* 1-Click jump to Outbound Verification */}
                  <Button
                    onClick={() => {
                      setSelectedOutboundGrv(registeredGrievance);
                      setActiveTab('outbound');
                    }}
                    className="w-full text-xs font-bold h-8 bg-[#16A34A] hover:bg-[#15803D] text-white"
                  >
                    <PhoneOutgoing className="h-3.5 w-3.5 mr-1.5" />
                    Test Outbound Verification Call on {registeredGrievance.id} →
                  </Button>
                </div>
              )}
            </Card>

          </div>

        </div>
      )}

      {/* ---------------- TAB 2: OUTBOUND RESOLUTION VERIFICATION CALLS ---------------- */}
      {activeTab === 'outbound' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: SELECT GRIEVANCE TO CALL (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <Card className="border-[#E8DEC8] bg-white shadow-xs p-4 md:p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#F3EBDD] pb-3">
                <div>
                  <h3 className="text-sm font-black text-[#231F1B] flex items-center gap-2">
                    <PhoneOutgoing className="h-4 w-4 text-[#C87A1E]" />
                    Select Grievance for AI Verification Call
                  </h3>
                  <p className="text-xs text-[#7A7064]">
                    AI agent calls the citizen to verify resolution or progress status.
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={loadData} className="h-7 text-xs">
                  <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
                </Button>
              </div>

              {/* Search & Filter Bar */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-[#8C8276]" />
                  <Input
                    value={outboundSearch}
                    onChange={(e) => setOutboundSearch(e.target.value)}
                    placeholder="Search by ID (e.g. GRV-1125), phone 8074223136, or area..."
                    className="pl-8 text-xs h-8"
                  />
                </div>

                <div className="flex gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setOutboundFilter('all')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                      outboundFilter === 'all' ? 'bg-[#C87A1E] text-white' : 'bg-[#FAF6EE] text-[#5C5449] border border-[#E8DEC8]'
                    }`}
                  >
                    All ({allGrievances.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutboundFilter('resolved')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                      outboundFilter === 'resolved' ? 'bg-[#16A34A] text-white' : 'bg-[#FAF6EE] text-[#5C5449] border border-[#E8DEC8]'
                    }`}
                  >
                    Resolved ({allGrievances.filter(g => g.status === 'Resolved').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutboundFilter('open')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                      outboundFilter === 'open' ? 'bg-[#DC2626] text-white' : 'bg-[#FAF6EE] text-[#5C5449] border border-[#E8DEC8]'
                    }`}
                  >
                    Active / Open ({allGrievances.filter(g => g.status !== 'Resolved').length})
                  </button>
                </div>
              </div>

              {/* Grievances List (Sorted latest first) */}
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {filteredOutboundList.length === 0 ? (
                  <div className="text-center py-6 text-xs text-[#7A7064]">
                    No grievances found matching "{outboundSearch}".
                  </div>
                ) : (
                  filteredOutboundList.map((g) => (
                    <div
                      key={g.id}
                      onClick={() => setSelectedOutboundGrv(g)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer text-xs space-y-1.5 ${
                        selectedOutboundGrv?.id === g.id
                          ? 'bg-[#FEF6EA] border-[#C87A1E] ring-1 ring-[#C87A1E] shadow-xs'
                          : 'bg-[#FAF6EE]/50 border-[#E8DEC8] hover:bg-[#FAF6EE]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-sm text-[#C87A1E]">{g.id}</span>
                          <Badge 
                            variant={
                              g.status === 'Resolved' ? 'low' : 
                              g.status === 'Escalated' ? 'critical' : 'amber'
                            } 
                            className="text-[10px]"
                          >
                            {g.status}
                          </Badge>
                        </div>
                        <span className="text-[10px] font-mono text-[#8C8276]">{g.citizen_phone || '8074223136'}</span>
                      </div>

                      <div className="font-bold text-[#231F1B] line-clamp-1">{g.title}</div>
                      
                      <div className="text-[10px] text-[#7A7064] flex items-center justify-between">
                        <span>{g.locality} • {g.department_name ? g.department_name.split(' ')[0] : 'Municipal'}</span>
                        {g.status !== 'Resolved' && (
                          <button
                            type="button"
                            onClick={(e) => markAsResolvedAndSelect(g, e)}
                            className="text-[10px] font-bold text-[#16A34A] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="h-3 w-3" /> Mark Resolved
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {selectedOutboundGrv && (
                <div className="pt-1">
                  <Button 
                    onClick={startOutboundVerificationCall}
                    className="w-full text-xs font-bold h-10 gap-2"
                  >
                    <PhoneOutgoing className="h-4 w-4" />
                    Trigger Automated AI Call for {selectedOutboundGrv.id} ({selectedOutboundGrv.citizen_phone || callerPhone})
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* RIGHT: OUTBOUND CALL SIMULATOR (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <Card className="border-[#E8DEC8] bg-white shadow-md overflow-hidden rounded-2xl">
              
              <div className="bg-[#1E293B] p-5 text-white text-center space-y-2">
                <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                  <span>AI Automated Outbound Engine</span>
                  <Badge variant="amber" className="text-[10px]">Auto-Care</Badge>
                </div>

                <div className="py-2">
                  <div className="h-14 w-14 rounded-full bg-[#334155] text-[#38BDF8] flex items-center justify-center mx-auto shadow-inner">
                    <PhoneOutgoing className={`h-7 w-7 ${outboundStep === 'connected' ? 'text-[#4ADE80] animate-pulse' : 'text-[#38BDF8]'}`} />
                  </div>
                  <h3 className="text-base font-black mt-2 text-white">
                    {outboundStep === 'ringing' && 'Dialing Citizen... 🔔'}
                    {outboundStep === 'connected' && `Connected: ${selectedOutboundGrv?.citizen_phone || callerPhone}`}
                    {outboundStep === 'completed' && 'Verification Call Completed'}
                    {outboundStep === 'idle' && 'Ready to Initiate Outbound Call'}
                  </h3>
                </div>
              </div>

              <CardContent className="p-5 space-y-4 text-xs">
                
                {outboundStep === 'idle' && (
                  <div className="text-center py-8 text-[#7A7064] space-y-2">
                    <PhoneOutgoing className="h-8 w-8 mx-auto text-[#C87A1E] opacity-60" />
                    <p className="font-semibold">
                      Select {selectedOutboundGrv?.id || 'a complaint'} on the left and click "Trigger Automated AI Call" to simulate the outbound citizen verification call.
                    </p>
                  </div>
                )}

                {outboundStep === 'connected' && selectedOutboundGrv && (
                  <div className="space-y-4 animate-in fade-in-50">
                    
                    {/* What AI Asks Out Loud */}
                    <div className="p-3 rounded-xl bg-[#FAF6EE] border border-[#E8DEC8] space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-[#8C4A00] block">
                        AI Agent Asks Citizen ({selectedOutboundGrv.citizen_phone || callerPhone}):
                      </span>
                      <p className="text-xs text-[#2B2620] font-medium leading-relaxed italic">
                        "Namaste {selectedOutboundGrv.citizen_name || 'Citizen'}. This is GHMC Automated Care calling regarding grievance {selectedOutboundGrv.id} for {selectedOutboundGrv.title}. Has your issue been resolved by the field squad?"
                      </p>
                    </div>

                    {/* Interactive Citizen Response Selection */}
                    <div className="space-y-2 p-3.5 rounded-xl bg-white border border-[#E8DEC8]">
                      <span className="font-bold text-xs text-[#231F1B] block">
                        Citizen Responds on Call:
                      </span>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCitizenAnswer('yes');
                            setCitizenFeedbackText('Yes, the problem was fixed completely. Thank you.');
                          }}
                          className={`p-2.5 rounded-lg border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                            citizenAnswer === 'yes'
                              ? 'bg-[#F0FDF4] border-[#16A34A] text-[#166534] shadow-xs'
                              : 'bg-white border-[#E8DEC8] text-[#5C5449]'
                          }`}
                        >
                          <CheckCircle2 className="h-4 w-4 text-[#16A34A]" /> Yes, Issue is Resolved!
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setCitizenAnswer('no');
                            setCitizenFeedbackText('No, the issue is NOT fixed yet. Water is still overflowing.');
                          }}
                          className={`p-2.5 rounded-lg border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                            citizenAnswer === 'no'
                              ? 'bg-[#FEF2F2] border-[#DC2626] text-[#991B1B] shadow-xs'
                              : 'bg-white border-[#E8DEC8] text-[#5C5449]'
                          }`}
                        >
                          <AlertOctagon className="h-4 w-4 text-[#DC2626]" /> No, Issue Still Persists!
                        </button>
                      </div>

                      {citizenAnswer === 'yes' && (
                        <div className="pt-2 flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#8C8276]">Citizen Rating:</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setCitizenRating(star)}
                                className={`text-base cursor-pointer ${star <= citizenRating ? 'text-[#C87A1E]' : 'text-[#E8DEC8]'}`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-2">
                        <Label className="text-[11px] text-[#8C8276]">Citizen Feedback Transcript:</Label>
                        <Input 
                          value={citizenFeedbackText} 
                          onChange={(e) => setCitizenFeedbackText(e.target.value)}
                          className="text-xs mt-1" 
                        />
                      </div>

                    </div>

                    <Button 
                      onClick={submitOutboundCitizenResponse}
                      disabled={loading}
                      className="w-full font-black text-xs h-10"
                    >
                      Record Citizen Response &amp; Process Ticket Outcome
                    </Button>

                  </div>
                )}

                {outboundStep === 'completed' && outboundResult && (
                  <div className="space-y-3 animate-in zoom-in-95">
                    <Alert variant={outboundResult.is_confirmed ? 'default' : 'destructive'} className="border">
                      <AlertTitle className="font-black text-xs">
                        {outboundResult.is_confirmed ? '✅ Resolution Verified by Citizen' : '🚨 Citizen Reported Issue Unresolved!'}
                      </AlertTitle>
                      <AlertDescription className="text-xs mt-1">
                        {outboundResult.ai_response_speech}
                      </AlertDescription>
                    </Alert>

                    <div className="p-3 rounded-lg bg-[#FAF6EE] border border-[#E8DEC8] text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-[#8C8276]">Updated Status:</span>
                        <Badge variant={outboundResult.updated_status === 'Resolved' ? 'low' : 'critical'}>
                          {outboundResult.updated_status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8C8276]">Call Log ID:</span>
                        <span className="font-mono font-bold text-[#231F1B]">{outboundResult.call_log?.id}</span>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      onClick={() => setOutboundStep('idle')} 
                      className="w-full text-xs"
                    >
                      Call Another Citizen
                    </Button>
                  </div>
                )}

              </CardContent>
            </Card>
          </div>

        </div>
      )}

      {/* ---------------- TAB 3: CALL LOGS & TRANSCRIPTS ---------------- */}
      {activeTab === 'logs' && (
        <Card className="border-[#E8DEC8] bg-white shadow-xs overflow-hidden">
          <CardHeader className="p-4 md:p-5 border-b border-[#F3EBDD] flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-extrabold text-[#231F1B]">
                IVR Voice Call History &amp; Transcripts
              </CardTitle>
              <CardDescription className="text-xs text-[#7A7064]">
                Complete audit trail of inbound helpline registrations and automated post-resolution verification calls.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadData} className="bg-white">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[110px]">Call ID</TableHead>
                  <TableHead className="w-[140px]">Type</TableHead>
                  <TableHead>Caller &amp; Phone</TableHead>
                  <TableHead>Transcript Excerpt</TableHead>
                  <TableHead>Outcome / Result</TableHead>
                  <TableHead className="text-right">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {callLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs font-bold text-[#C87A1E]">
                      {log.id}
                    </TableCell>
                    <TableCell>
                      <Badge variant={log.call_type.includes('Inbound') ? 'blue' : 'amber'} className="text-[10px]">
                        {log.call_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="font-bold text-[#231F1B]">{log.caller_name}</div>
                      <div className="text-[10px] text-[#7A7064] font-mono">{log.phone_number}</div>
                    </TableCell>
                    <TableCell className="max-w-md text-xs">
                      <p className="text-[11px] text-[#5C5449] line-clamp-2 whitespace-pre-line bg-[#FAF6EE] p-2 rounded border border-[#E8DEC8]">
                        {log.transcript}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={log.result?.includes('Critical') || log.result?.includes('Escalation') ? 'critical' : 'low'} className="text-[10px]">
                        {log.result}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs text-[#7A7064]">
                      {log.timestamp}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
