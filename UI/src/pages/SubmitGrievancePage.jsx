import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/api/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  Send, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  FileText,
  Camera,
  Upload,
  X,
  Image as ImageIcon,
  Building, 
  AlertTriangle, 
  ShieldCheck, 
  Flame, 
  HelpCircle,
  Clock,
  ArrowRight,
  Zap
} from 'lucide-react';

const SAMPLE_GRIEVANCES = [
  {
    label: 'Contaminated Drinking Water (Critical 92/100)',
    title: 'Severe fecal odor & black water supply in residential pipes',
    description: 'Since yesterday evening, tap water in our entire apartment building has turned murky dark with intense sewage odor. Over 150 residents cannot cook or drink. 4 children have developed severe vomiting and diarrhea.',
    category: 'Water Contamination & Sewage Ingress',
    ward: 104,
    locality: 'Kukatpally Housing Board',
    citizen_name: 'Dr. Srinivas Rao',
    citizen_phone: '9848011223',
    presetImage: {
      url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=600&auto=format&fit=crop&q=80',
      name: 'kukatpally_water_pipeline_leak.jpg'
    }
  },
  {
    label: 'Deep Open Trench on Main Arterial Road (High 84/100)',
    title: 'Unbarricaded open excavation crater causing major traffic risk',
    description: 'Deep 6-foot road excavation left completely unbarricaded without warning signs near metro pillar 1042. Two two-wheelers already skidded into it during rainfall last night. Extreme hazard for school buses tomorrow.',
    category: 'Roads & Potholes',
    ward: 110,
    locality: 'Madhapur Metro Corridor',
    citizen_name: 'Meera Nambiar',
    citizen_phone: '9440192837',
    presetImage: {
      url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
      name: 'madhapur_crater_pothole.jpg'
    }
  },
  {
    label: 'Fallen Transformer & Sparking Wire (Critical 96/100)',
    title: 'Live 11kV wire dangling over flooded walkway near park gate',
    description: 'High voltage electrical cable snapped from pole during thunderstorm and is currently submerged in 1 foot of standing water right in front of primary school gate. Continuous loud sparks observed.',
    category: 'Electricity & Streetlights',
    ward: 98,
    locality: 'Banjara Hills Rd 12',
    citizen_name: 'Anand Varma',
    citizen_phone: '9885012345',
    presetImage: {
      url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=600&auto=format&fit=crop&q=80',
      name: 'banjara_hills_transformer_spark.jpg'
    }
  }
];

export function SubmitGrievancePage({ onGrievanceSubmitted }) {
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Water Contamination & Sewage Ingress',
    department_id: '',
    ward: 104,
    locality: 'Kukatpally Housing Board',
    citizen_name: '',
    citizen_phone: '',
    channel: 'Citizen Portal'
  });

  const [attachedImage, setAttachedImage] = useState(null);
  const [imageFileName, setImageFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);
  const [previewScore, setPreviewScore] = useState({ score: 0, level: 'Low', factors: [] });
  const fileInputRef = useRef(null);

  useEffect(() => {
    api.getDepartments().then(depts => {
      setDepartments(depts || []);
      if (depts && depts.length > 0) {
        setFormData(prev => ({ ...prev, department_id: depts[0].id }));
      }
    });
  }, []);

  // Real-time AI preview calculation
  useEffect(() => {
    const text = (formData.title + ' ' + formData.description).toLowerCase();
    let score = 20;
    let factors = [];

    if (text.includes('hospital') || text.includes('school') || text.includes('children') || text.includes('icu')) {
      score += 25;
      factors.push('Sensitive Vulnerable Location (+25)');
    }
    if (text.includes('contaminat') || text.includes('black water') || text.includes('diarrhea') || text.includes('vomit') || text.includes('sewage odor') || text.includes('spark') || text.includes('fire') || text.includes('11kv') || text.includes('shock')) {
      score += 35;
      factors.push('Severe Health & Safety Threat (+35)');
    }
    if (text.includes('entire') || text.includes('150') || text.includes('building') || text.includes('main road') || text.includes('traffic')) {
      score += 20;
      factors.push('High Citizen Density Impact (+20)');
    }
    if (text.includes('since') || text.includes('days') || text.includes('repeat') || text.includes('already skidded')) {
      score += 15;
      factors.push('Chronicity / Repeat Indicator (+15)');
    }
    if (attachedImage) {
      score += 10;
      factors.push('Visual Evidence Attached (+10)');
    }

    score = Math.min(99, Math.max(15, score));
    let level = 'Low';
    if (score >= 80) level = 'Critical';
    else if (score >= 60) level = 'High';
    else if (score >= 35) level = 'Medium';

    setPreviewScore({ score, level, factors });
  }, [formData.title, formData.description, attachedImage]);

  const handleQuickFill = (sample) => {
    setFormData(prev => ({
      ...prev,
      title: sample.title,
      description: sample.description,
      category: sample.category,
      ward: sample.ward,
      locality: sample.locality,
      citizen_name: sample.citizen_name,
      citizen_phone: sample.citizen_phone
    }));
    if (sample.presetImage) {
      setAttachedImage(sample.presetImage.url);
      setImageFileName(sample.presetImage.name);
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handlePresetImage = (url, name) => {
    setAttachedImage(url);
    setImageFileName(name);
  };

  const removeImage = () => {
    setAttachedImage(null);
    setImageFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    setSubmitting(true);
    try {
      const res = await api.submitGrievance({
        ...formData,
        attachment_ref: imageFileName || (attachedImage ? 'citizen_evidence.jpg' : null),
        image_url: attachedImage
      });
      setSubmittedResult(res.grievance || res);
      if (onGrievanceSubmitted) onGrievanceSubmitted();
    } catch (err) {
      console.error('Failed to submit grievance:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedResult(null);
    setAttachedImage(null);
    setImageFileName('');
    setFormData({
      title: '',
      description: '',
      category: 'Water Contamination & Sewage Ingress',
      department_id: departments[0]?.id || '',
      ward: 104,
      locality: 'Kukatpally Housing Board',
      citizen_name: '',
      citizen_phone: '',
      channel: 'Citizen Portal'
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-10">
      
      {/* Header */}
      <div className="border-b border-[#dddddd] pb-3.5">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-medium text-[#181d26] tracking-tight">
            Citizen Grievance Lodging &amp; AI Triage
          </h1>
          <Badge variant="default" className="text-[10px] font-medium">
            Automated Scoring
          </Badge>
        </div>
        <p className="text-xs text-[#555b66] font-normal mt-0.5 leading-relaxed">
          Submit your civic complaint. The AI engine will immediately evaluate safety and health hazards, compute an SLA score, analyze visual photo evidence, and route the ticket to the nearest field officer.
        </p>
      </div>

      {/* SUCCESS CONFIRMATION ALERT */}
      {submittedResult && (
        <Card className="border-[#bbf7d0] bg-[#f0fdf4] shadow-2xs p-4 sm:p-5 rounded-[10px] space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-[#006400] text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[#006400]">
                  Grievance Successfully Registered &amp; Prioritized
                </h3>
                <Badge variant="low" className="text-[10px]">
                  {submittedResult.tracking_id || submittedResult.id}
                </Badge>
              </div>
              <p className="text-xs text-[#061e09] font-medium leading-relaxed">
                {submittedResult.message || 'Your complaint has been processed and routed to the zonal field response team.'}
              </p>
            </div>
          </div>

          {/* AI Result Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
            <div className="p-3 rounded-[8px] bg-white border border-[#bbf7d0] space-y-0.5">
              <span className="text-[9px] text-[#555b66] uppercase font-medium">Assigned AI Priority</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-semibold text-[#181d26]">{submittedResult.ai_priority_score}/100</span>
                <Badge variant={submittedResult.ai_priority_score >= 80 ? 'critical' : 'high'} className="text-[9px]">
                  {submittedResult.ai_priority_level}
                </Badge>
              </div>
            </div>

            <div className="p-3 rounded-[8px] bg-white border border-[#bbf7d0] space-y-0.5">
              <span className="text-[9px] text-[#555b66] uppercase font-medium">Auto-Dispatched Department</span>
              <div className="text-xs font-semibold text-[#181d26] truncate">
                {submittedResult.routed_department || submittedResult.department_name}
              </div>
              <span className="text-[9px] text-[#555b66] block">
                Target SLA: {submittedResult.target_sla_hours || 12} Hours
              </span>
            </div>

            <div className="p-3 rounded-[8px] bg-white border border-[#bbf7d0] space-y-0.5">
              <span className="text-[9px] text-[#555b66] uppercase font-medium">Officer Assigned</span>
              <div className="text-xs font-semibold text-[#181d26] truncate">
                {submittedResult.assigned_officer || submittedResult.assigned_officer_name || 'Zonal Response Squad'}
              </div>
              <span className="text-[9px] text-[#006400] font-medium flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Field squad notified
              </span>
            </div>
          </div>

          {submittedResult.image_url && (
            <div className="pt-2 border-t border-[#bbf7d0]">
              <span className="text-[11px] text-[#555b66] font-semibold block mb-1">Attached Photographic Evidence:</span>
              <img 
                src={submittedResult.image_url} 
                alt="Incident Evidence" 
                className="w-full max-w-sm h-32 object-cover rounded-lg border border-[#bbf7d0]" 
              />
            </div>
          )}

          <div className="pt-1 flex justify-end gap-2">
            <Button variant="default" onClick={handleReset} className="text-xs h-8 px-3">
              Submit Another Grievance
            </Button>
          </div>
        </Card>
      )}

      {/* SAMPLE QUICK FILL BUTTONS */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[#555b66]">
          <Sparkles className="h-3.5 w-3.5 text-[#181d26]" />
          <span>Quick Demo Test Scenarios (Click to auto-populate form):</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {SAMPLE_GRIEVANCES.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickFill(sample)}
              className="text-left p-2.5 sm:p-3 rounded-[8px] border border-[#dddddd] bg-white hover:bg-[#f8fafc] hover:border-[#181d26] transition-all cursor-pointer shadow-2xs space-y-0.5"
            >
              <div className="font-semibold text-xs text-[#181d26] line-clamp-1">
                {sample.label}
              </div>
              <p className="text-[11px] text-[#555b66] line-clamp-2">
                {sample.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* MAIN 2-COLUMN FORM & LIVE AI TRIAGE INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        
        {/* FORM CONTAINER (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="border-[#dddddd] bg-white shadow-2xs rounded-[10px]">
            <CardHeader className="p-3.5 sm:p-4 pb-2.5 border-b border-[#dddddd]">
              <CardTitle className="text-sm sm:text-base font-medium text-[#181d26]">
                Grievance Details
              </CardTitle>
              <CardDescription className="text-[11px] text-[#555b66]">
                Provide exact details so AI can categorize, analyze photos, and dispatch your ticket immediately.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="p-3.5 sm:p-4 space-y-3">
                
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#181d26] flex items-center justify-between">
                    <span>Issue Summary Title *</span>
                    <span className="text-[10px] text-[#555b66] font-normal">e.g., Contaminated Water Supply</span>
                  </label>
                  <Input
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Briefly state the emergency civic issue..."
                    className="text-xs h-9"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#181d26] flex items-center justify-between">
                    <span>Detailed Citizen Complaint &amp; Impact *</span>
                    <span className="text-[10px] text-[#555b66] font-normal">AI parses keywords automatically</span>
                  </label>
                  <Textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the problem, street address, odor/hazard, duration, how many residents affected..."
                    className="text-xs leading-relaxed"
                  />
                </div>

                {/* Photo Attachment Section */}
                <div className="space-y-1.5 pt-1 border-t border-[#dddddd]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-[#181d26] flex items-center gap-1.5">
                      <Camera className="h-3.5 w-3.5 text-[#181d26]" />
                      Attach Photographic Evidence
                    </label>
                    <span className="text-[10px] text-[#555b66]">JPG, PNG or WebP</span>
                  </div>

                  {attachedImage ? (
                    <div className="relative rounded-[8px] border border-[#dddddd] bg-[#f8fafc] p-2.5 flex items-center gap-3">
                      <img 
                        src={attachedImage} 
                        alt="Uploaded Evidence" 
                        className="h-12 w-16 object-cover rounded-[6px] border border-[#dddddd] shrink-0" 
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#181d26] truncate">
                          {imageFileName || 'incident_photo.jpg'}
                        </p>
                        <Badge variant="low" className="text-[9px] mt-0.5">
                          Evidence Attached
                        </Badge>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={removeImage}
                        className="text-[#aa2d00] hover:bg-[#fef2f2] p-1 h-7 w-7"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-[8px] border border-dashed border-[#dddddd] hover:border-[#181d26] bg-[#f8fafc] hover:bg-white p-3 text-center cursor-pointer transition-colors space-y-1"
                    >
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageFileChange} 
                        className="hidden" 
                      />
                      <Upload className="h-4 w-4 text-[#555b66] mx-auto" />
                      <p className="text-xs font-medium text-[#181d26]">
                        Click to upload incident photo
                      </p>
                      <p className="text-[10px] text-[#555b66]">
                        Captures visual scene signals for AI urgency weighting
                      </p>
                    </div>
                  )}

                  {!attachedImage && (
                    <div className="flex items-center gap-1.5 pt-0.5 text-[10px] text-[#555b66]">
                      <span>Quick sample photos:</span>
                      <button
                        type="button"
                        onClick={() => handlePresetImage('https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=600&auto=format&fit=crop&q=80', 'pipeline_burst.jpg')}
                        className="text-[#1b61c9] hover:underline font-medium cursor-pointer"
                      >
                        Water Pipeline
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => handlePresetImage('https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=600&auto=format&fit=crop&q=80', 'sewage_leak.jpg')}
                        className="text-[#1b61c9] hover:underline font-medium cursor-pointer"
                      >
                        Sewage Leak
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => handlePresetImage('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80', 'pothole_crater.jpg')}
                        className="text-[#1b61c9] hover:underline font-medium cursor-pointer"
                      >
                        Road Pothole
                      </button>
                    </div>
                  )}
                </div>

                {/* Category & Department */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#181d26]">Civic Category</label>
                    <Select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="text-xs h-9"
                    >
                      <option value="Water Contamination & Sewage Ingress">Water Contamination &amp; Sewage</option>
                      <option value="Roads & Potholes">Roads &amp; Deep Potholes</option>
                      <option value="Electricity & Streetlights">Electricity &amp; Fallen Cables</option>
                      <option value="Drainage & Stormwater Flooding">Drainage &amp; Urban Flooding</option>
                      <option value="Garbage & Solid Waste Sanitation">Garbage &amp; Sanitation</option>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#181d26]">Responsible Department</label>
                    <Select
                      value={formData.department_id}
                      onChange={e => setFormData({ ...formData, department_id: e.target.value })}
                      className="text-xs font-medium h-9"
                    >
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </Select>
                  </div>
                </div>

                {/* Locality & Ward */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#181d26]">Locality / Colony</label>
                    <Input
                      value={formData.locality}
                      onChange={e => setFormData({ ...formData, locality: e.target.value })}
                      placeholder="e.g. Kukatpally Phase 2"
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#181d26]">Ward Number</label>
                    <Input
                      type="number"
                      value={formData.ward}
                      onChange={e => setFormData({ ...formData, ward: parseInt(e.target.value) || 100 })}
                      className="text-xs font-mono h-9"
                    />
                  </div>
                </div>

                {/* Citizen Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#181d26]">Citizen Full Name</label>
                    <Input
                      value={formData.citizen_name}
                      onChange={e => setFormData({ ...formData, citizen_name: e.target.value })}
                      placeholder="e.g. Ramesh Reddy"
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#181d26]">Mobile Number</label>
                    <Input
                      value={formData.citizen_phone}
                      onChange={e => setFormData({ ...formData, citizen_phone: e.target.value })}
                      placeholder="e.g. 9848012345"
                      className="text-xs font-mono h-9"
                    />
                  </div>
                </div>

              </CardContent>

              <CardFooter className="p-3.5 sm:p-4 border-t border-[#dddddd] flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] text-[#555b66] font-normal flex items-center gap-1">
                  <Zap className="h-3 w-3 text-[#ea580c]" />
                  <span>SLA clock begins on submission</span>
                </span>
                <Button 
                  type="submit" 
                  disabled={submitting || !formData.title || !formData.description}
                  className="text-xs px-4 h-9"
                >
                  <Send className="h-3 w-3 mr-1" />
                  {submitting ? 'Triaging with AI...' : 'Submit Grievance'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* RIGHT: LIVE AI TRIAGE PREVIEW INSPECTOR (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <Card className="signature-cream-card rounded-[10px] p-3.5 sm:p-4 space-y-3 sticky top-16 shadow-2xs border border-[#dddddd]">
            <div className="flex items-center justify-between border-b border-[#dddddd] pb-2.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#aa2d00]" />
                <span className="font-semibold text-xs text-[#181d26] uppercase tracking-wider">
                  Live AI Triage Inspector
                </span>
              </div>
              <Badge variant="outline" className="text-[8px] bg-white py-0">
                Pre-Submission NLP
              </Badge>
            </div>

            {/* Real-time Estimated Score */}
            <div className="bg-white p-3 rounded-[8px] border border-[#dddddd] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#555b66]">Estimated Urgency Score:</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-normal text-[#181d26]">{previewScore.score}/100</span>
                  <Badge variant={previewScore.score >= 80 ? 'critical' : previewScore.score >= 60 ? 'high' : 'medium'} className="text-[9px]">
                    {previewScore.level}
                  </Badge>
                </div>
              </div>
              <Progress 
                value={previewScore.score} 
                color={previewScore.score >= 80 ? 'critical' : previewScore.score >= 60 ? 'high' : 'medium'}
                className="h-1.5"
              />
            </div>

            {/* Photo preview in inspector if attached */}
            {attachedImage && (
              <div className="p-2.5 rounded-[6px] bg-white border border-[#dddddd] space-y-1">
                <span className="text-[10px] font-medium text-[#555b66] block">Attached Scene Evidence:</span>
                <img 
                  src={attachedImage} 
                  alt="Preview" 
                  className="w-full h-24 object-cover rounded-[5px] border border-[#dddddd]" 
                />
              </div>
            )}

            {/* AI Decision Factors Detected in Real-time */}
            <div className="space-y-1.5 text-xs">
              <span className="text-[10px] font-medium text-[#181d26] block">
                Safety &amp; Severity Risk Triggers Detected:
              </span>

              {previewScore.factors.length === 0 ? (
                <p className="text-[11px] text-[#555b66] italic bg-white p-2.5 rounded-[6px] border border-[#dddddd]">
                  Type complaint description or attach photo to see real-time AI keyword extraction and priority triggers.
                </p>
              ) : (
                <div className="space-y-1">
                  {previewScore.factors.map((fact, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 p-1.5 rounded-[5px] bg-white border border-[#dddddd] text-xs font-medium text-[#181d26]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#aa2d00] shrink-0" />
                      <span className="text-[11px]">{fact}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Explanation box */}
            <div className="p-2.5 rounded-[6px] bg-white border border-[#dddddd] space-y-0.5 text-xs text-[#555b66]">
              <span className="font-semibold text-[10px] text-[#181d26] block">How does the AI triage?</span>
              <p className="text-[10px] text-[#333840] leading-relaxed">
                Rather than First-Come-First-Serve, the neural classifier calculates hazard severity, visual signals, vulnerable location proximity (ICUs/Schools), and population density to ensure life-threatening emergencies receive sub-4hr resolution.
              </p>
            </div>

          </Card>
        </div>

      </div>

    </div>
  );
}


