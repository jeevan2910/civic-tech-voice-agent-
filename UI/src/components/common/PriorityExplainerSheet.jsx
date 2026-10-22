import React, { useState, useEffect } from 'react';
import { Sheet } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  Sparkles, 
  Clock, 
  MapPin, 
  Users, 
  Building, 
  CheckCircle2, 
  ArrowUpRight, 
  Layers, 
  Send, 
  FileText, 
  ShieldAlert,
  Flame,
  CheckCircle,
  TrendingUp,
  Activity,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { api } from '@/api/client';

export function PriorityExplainerSheet({ grievanceId, open, onOpenChange, onGrievanceUpdated }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [resolveNote, setResolveNote] = useState('');
  const [showResolveInput, setShowResolveInput] = useState(false);

  useEffect(() => {
    if (grievanceId && open) {
      setLoading(true);
      api.getAIExplanation(grievanceId)
        .then(res => {
          setData(res);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [grievanceId, open]);

  if (!open) return null;

  const handleEscalate = async () => {
    if (!data) return;
    setActionLoading(true);
    try {
      await api.escalateGrievance(data.grievance_id, 'Emergency Priority Escalation triggered by Grievance Officer');
      if (onGrievanceUpdated) onGrievanceUpdated();
      // Reload explanation
      const refreshed = await api.getAIExplanation(data.grievance_id);
      setData(refreshed);
    } catch (e) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!data) return;
    setActionLoading(true);
    try {
      await api.resolveGrievance(data.grievance_id, resolveNote || 'Field repair & corrective verification completed by departmental unit.');
      if (onGrievanceUpdated) onGrievanceUpdated();
      setShowResolveInput(false);
      const refreshed = await api.getAIExplanation(data.grievance_id);
      setData(refreshed);
    } catch (e) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const score = data?.ai_priority_score || 50;
  let scoreColor = 'low';
  let badgeVariant = 'low';
  if (score >= 80) { scoreColor = 'critical'; badgeVariant = 'critical'; }
  else if (score >= 60) { scoreColor = 'high'; badgeVariant = 'high'; }
  else if (score >= 35) { scoreColor = 'medium'; badgeVariant = 'medium'; }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {loading || !data ? (
        <div className="flex h-56 items-center justify-center">
          <div className="text-center space-y-2.5">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#181d26] border-t-transparent mx-auto" />
            <p className="text-xs font-medium text-[#555b66]">
              Running LLM Priority Assessment &amp; Grouping Engine...
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-5">
          
          {/* Header */}
          <div className="space-y-1.5 border-b border-[#dddddd] pb-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] font-medium text-[#555b66]">
                {data.grievance_id}
              </span>
              <div className="flex items-center gap-1.5">
                <Badge variant={badgeVariant} className="text-[10px] px-2 py-0.2 uppercase tracking-wider font-semibold">
                  {data.ai_priority_level} Priority
                </Badge>
                <Badge variant={data.status === 'Resolved' ? 'low' : data.status === 'Escalated' ? 'critical' : 'blue'} className="text-[10px] py-0.2">
                  {data.status}
                </Badge>
              </div>
            </div>

            <h2 className="text-lg sm:text-xl font-medium text-[#181d26] leading-snug">
              {data.title}
            </h2>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#555b66]">
              <span className="flex items-center gap-1 font-medium text-[#181d26]">
                <MapPin className="h-3 w-3 text-[#181d26]" />
                {data.locality} (Ward {data.ward}, {data.zone})
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3 text-[#555b66]" />
                ~{data.affected_people || 50} Citizens
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-[#555b66]" />
                {data.days_open}d active
              </span>
            </div>
          </div>

          {/* AI Priority Meter Card */}
          <div className="rounded-[10px] border border-[#dddddd] bg-[#f8fafc] p-3.5 sm:p-4 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-[#181d26] text-white shadow-2xs">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-[#181d26]">
                    AI Priority Assessment
                  </h3>
                  <p className="text-[10px] text-[#555b66]">
                    Multi-factor explainable ranking
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xl sm:text-2xl font-normal tracking-tight text-[#181d26]">
                  {score}<span className="text-xs font-normal text-[#555b66]">/100</span>
                </div>
                <div className="text-[9px] font-medium uppercase tracking-wider text-[#555b66]">
                  {data.ai_priority_level} Rank
                </div>
              </div>
            </div>

            {/* Score Bar */}
            <Progress value={score} color={scoreColor} className="h-2" />

            <p className="text-xs text-[#333840] font-normal leading-relaxed bg-white p-2.5 rounded-[6px] border border-[#dddddd]">
              "{data.description}"
            </p>

            {/* Photographic Evidence Attachment */}
            {(data.image_url || data.attachment_ref) && (
              <div className="rounded-xl border border-[#E8DEC8] bg-white p-3 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8C8276] flex items-center gap-1.5">
                    <Camera className="h-3.5 w-3.5 text-[#C87A1E]" />
                    Photographic Evidence Attached
                  </span>
                  <Badge variant="amber" className="text-[9px]">
                    {data.attachment_ref || 'incident_photo.jpg'}
                  </Badge>
                </div>
                <div className="relative rounded-lg overflow-hidden border border-[#E8DEC8] bg-[#FAF6EE] group">
                  <img
                    src={data.image_url || 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=600&auto=format&fit=crop&q=80'}
                    alt="Scene Evidence"
                    className="w-full h-44 object-cover group-hover:scale-102 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-mono">
                    📍 {data.locality} • Geo-Tagged Evidence
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Why High Priority / Risk Factors */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-medium uppercase tracking-wider text-[#181d26] flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-[#aa2d00]" />
              Why is this Complaint Prioritized?
            </h4>

            <div className="grid gap-1.5">
              {data.why_high_priority && data.why_high_priority.map((reason, idx) => (
                <div 
                  key={idx}
                  className="flex items-start gap-2 rounded-[6px] border border-[#dddddd] bg-white p-2.5 text-xs text-[#333840] shadow-2xs"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-[#aa2d00] mt-1 shrink-0" />
                  <span className="font-normal leading-relaxed text-[11px] sm:text-xs">{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Grouped / Similar Complaints */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-medium uppercase tracking-wider text-[#181d26] flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-[#1b61c9]" />
                Correlated Incidents ({data.similar_complaints?.length || 0} Linked)
              </h4>
              {data.incident_group_info?.is_systemic_issue && (
                <Badge variant="critical" className="text-[9px] py-0 font-medium">
                  Systemic Cluster
                </Badge>
              )}
            </div>

            {data.incident_group_info?.systemic_summary && (
              <Alert variant={data.incident_group_info.is_systemic_issue ? 'warning' : 'default'} className="text-xs rounded-[6px] border border-[#dddddd] p-2.5">
                <AlertDescription className="text-[11px] leading-relaxed">
                  {data.incident_group_info.systemic_summary}
                </AlertDescription>
              </Alert>
            )}

            {data.similar_complaints && data.similar_complaints.length > 0 && (
              <div className="max-h-40 overflow-y-auto space-y-1.5 rounded-[6px] border border-[#dddddd] bg-white p-2.5">
                {data.similar_complaints.map(sim => (
                  <div key={sim.id} className="flex items-center justify-between border-b border-[#dddddd] pb-1.5 last:border-0 last:pb-0 text-xs">
                    <div>
                      <div className="font-medium text-[#181d26] text-xs">{sim.id}: {sim.title}</div>
                      <div className="text-[9px] text-[#555b66]">
                        {sim.created_at} • via {sim.channel} • {sim.locality}
                      </div>
                    </div>
                    <Badge variant={sim.is_duplicate ? 'purple' : 'default'} className="text-[8px] py-0">
                      {sim.is_duplicate ? 'Duplicate' : sim.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Recommended Department & Actions */}
          <div className="rounded-[10px] border border-[#dddddd] bg-white p-3.5 sm:p-4 space-y-2.5 shadow-2xs">
            <h4 className="text-[11px] font-medium uppercase tracking-wider text-[#181d26] flex items-center gap-1.5">
              <Building className="h-3.5 w-3.5 text-[#181d26]" />
              AI Department &amp; Action Directives
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded-[6px] bg-[#f8fafc] border border-[#dddddd]">
                <span className="text-[9px] font-medium text-[#555b66] uppercase block">
                  Recommended Department
                </span>
                <span className="font-medium text-xs text-[#181d26] mt-0.5 block truncate">
                  {data.routing_recommendation?.recommended_department}
                </span>
                <span className="text-[9px] text-[#006400] font-medium">
                  {data.routing_recommendation?.confidence} Confidence
                </span>
              </div>

              <div className="p-2.5 rounded-[6px] bg-[#f8fafc] border border-[#dddddd]">
                <span className="text-[9px] font-medium text-[#555b66] uppercase block">
                  Estimated SLA
                </span>
                <span className="font-medium text-xs text-[#181d26] mt-0.5 block">
                  {data.estimated_resolution}
                </span>
                <span className="text-[9px] text-[#555b66]">
                  Priority based
                </span>
              </div>
            </div>

            <div className="space-y-1 pt-0.5">
              <span className="text-[10px] font-medium text-[#555b66] block">
                Recommended Next Steps:
              </span>
              <ul className="space-y-1">
                {data.suggested_actions?.map((act, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-[11px] sm:text-xs text-[#333840]">
                    <CheckCircle className="h-3 w-3 text-[#006400] shrink-0" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-[#dddddd] pt-3 space-y-2">
            {showResolveInput ? (
              <div className="space-y-2 rounded-[6px] bg-white border border-[#dddddd] p-2.5">
                <label className="text-xs font-medium text-[#181d26]">
                  Resolution Action &amp; Field Notes:
                </label>
                <input
                  type="text"
                  value={resolveNote}
                  onChange={(e) => setResolveNote(e.target.value)}
                  placeholder="e.g. Dispatched emergency tanker and completed pipeline pressure repair."
                  className="w-full rounded-[6px] border border-[#dddddd] p-2 text-xs text-[#181d26] focus:ring-1 focus:ring-[#181d26] outline-none"
                />
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="ghost" onClick={() => setShowResolveInput(false)} className="text-xs h-8">
                    Cancel
                  </Button>
                  <Button size="sm" variant="success" onClick={handleResolve} disabled={actionLoading} className="text-xs h-8">
                    Confirm Resolution
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 justify-end">
                {data.status !== 'Escalated' && (
                  <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={handleEscalate} 
                    disabled={actionLoading}
                    className="flex items-center gap-1 text-xs h-8 px-3"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    Escalate to Supervisor
                  </Button>
                )}

                {data.status !== 'Resolved' && (
                  <Button 
                    variant="success" 
                    size="sm" 
                    onClick={() => setShowResolveInput(true)} 
                    disabled={actionLoading}
                    className="flex items-center gap-1 text-xs h-8 px-3"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Mark Resolved
                  </Button>
                )}

                <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="bg-white text-xs h-8 px-3">
                  Close
                </Button>
              </div>
            )}
          </div>

        </div>
      )}
    </Sheet>
  );
}

