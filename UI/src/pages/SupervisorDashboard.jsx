import React, { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { PriorityExplainerSheet } from '@/components/common/PriorityExplainerSheet';
import { 
  Building2, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Users, 
  Wrench, 
  MapPin, 
  Flame, 
  Sparkles, 
  TrendingUp, 
  ShieldAlert, 
  ArrowRight, 
  RefreshCw, 
  Layers, 
  AlertOctagon, 
  Info, 
  ListFilter
} from 'lucide-react';

export function SupervisorDashboard() {
  const { user } = useAuth();
  const [selectedDeptId, setSelectedDeptId] = useState(user?.department_id || 'DEP-WATER-HYD');
  const [departments, setDepartments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedGrievanceId, setSelectedGrievanceId] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState('all');

  const loadData = async (deptId) => {
    setLoading(true);
    try {
      const [deptsRes, analyticsRes] = await Promise.all([
        api.getDepartments(),
        api.getSupervisorAnalytics(deptId)
      ]);
      setDepartments(deptsRes || []);
      setAnalytics(analyticsRes);
    } catch (err) {
      console.error('Failed to load supervisor data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedDeptId);
  }, [selectedDeptId]);

  const handleDeptChange = (newDeptId) => {
    setSelectedDeptId(newDeptId);
    setPriorityFilter('all');
  };

  if (loading && !analytics) {
    return (
      <div className="flex h-80 items-center justify-center">
        <div className="text-center space-y-2.5">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#181d26] border-t-transparent mx-auto" />
          <p className="text-xs font-medium text-[#555b66]">
            Loading Departmental Operations &amp; Zonal Caseloads...
          </p>
        </div>
      </div>
    );
  }

  const pb = analytics?.priority_breakdown || { critical: 0, high: 0, medium: 0, low: 0 };
  const allDeptGrievances = analytics?.grievances || [];
  
  const filteredGrievances = allDeptGrievances.filter(g => {
    if (priorityFilter === 'critical') return g.ai_priority_score >= 80;
    if (priorityFilter === 'high') return g.ai_priority_score >= 60 && g.ai_priority_score < 80;
    if (priorityFilter === 'medium') return g.ai_priority_score >= 35 && g.ai_priority_score < 60;
    if (priorityFilter === 'low') return g.ai_priority_score < 35 || g.status === 'Resolved';
    return true;
  });

  return (
    <div className="space-y-5 pb-10">
      
      {/* Header & Department Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#dddddd] pb-3.5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-medium text-[#181d26] tracking-tight">
              Departmental Operational Supervisor
            </h1>
            <Badge variant="default" className="text-[10px] font-medium">
              {analytics?.department_name || 'Municipal Operations'}
            </Badge>
          </div>
          <p className="text-xs text-[#555b66] font-normal mt-0.5 leading-relaxed">
            Department-level prioritization, escalation triage, and systemic asset failure diagnosis.
          </p>
        </div>

        {/* Department Switcher */}
        <div className="flex items-center gap-2 w-full sm:w-auto sm:min-w-[260px]">
          <Building2 className="h-4 w-4 text-[#181d26] shrink-0" />
          <Select
            value={selectedDeptId}
            onChange={(e) => handleDeptChange(e.target.value)}
            className="text-xs font-medium bg-white h-9"
          >
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </Select>
          <Button variant="outline" size="sm" onClick={() => loadData(selectedDeptId)} className="bg-white h-9 px-2.5 shrink-0">
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* DEPARTMENT-SCOPED PRIORITY BREAKDOWN CARDS */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-[#555b66] flex items-center gap-1">
            <ListFilter className="h-3 w-3 text-[#181d26]" />
            Department Prioritized Escalations Queue:
          </span>
          {priorityFilter !== 'all' && (
            <button 
              onClick={() => setPriorityFilter('all')}
              className="text-[10px] sm:text-[11px] text-[#1b61c9] font-medium underline hover:text-[#1a3866] cursor-pointer"
            >
              Show All ({allDeptGrievances.length})
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Critical */}
          <div 
            onClick={() => setPriorityFilter(priorityFilter === 'critical' ? 'all' : 'critical')}
            className={`rounded-[10px] border p-3.5 sm:p-4 transition-all duration-150 cursor-pointer shadow-2xs ${
              priorityFilter === 'critical' 
                ? 'bg-[#fef2f2] border-[#aa2d00] ring-1 ring-[#aa2d00]/30' 
                : 'bg-white border-[#dddddd] hover:bg-[#fef2f2]/40 hover:border-[#aa2d00]/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-[#aa2d00] flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#aa2d00] animate-pulse" />
                Critical
              </span>
              <AlertOctagon className="h-3.5 w-3.5 text-[#aa2d00]" />
            </div>
            <div className="text-2xl sm:text-3xl font-normal text-[#aa2d00] mt-2 leading-none">
              {pb.critical}
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#aa2d00]/90 font-medium mt-1">
              Immediate 4–12 hr intervention
            </p>
          </div>

          {/* High */}
          <div 
            onClick={() => setPriorityFilter(priorityFilter === 'high' ? 'all' : 'high')}
            className={`rounded-[10px] border p-3.5 sm:p-4 transition-all duration-150 cursor-pointer shadow-2xs ${
              priorityFilter === 'high' 
                ? 'bg-[#fff7ed] border-[#ea580c] ring-1 ring-[#ea580c]/30' 
                : 'bg-white border-[#dddddd] hover:bg-[#fff7ed]/40 hover:border-[#ea580c]/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-[#ea580c] flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ea580c]" />
                High Priority
              </span>
              <AlertTriangle className="h-3.5 w-3.5 text-[#ea580c]" />
            </div>
            <div className="text-2xl sm:text-3xl font-normal text-[#ea580c] mt-2 leading-none">
              {pb.high}
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#ea580c]/90 font-medium mt-1">
              Target SLA within 24 hours
            </p>
          </div>

          {/* Medium */}
          <div 
            onClick={() => setPriorityFilter(priorityFilter === 'medium' ? 'all' : 'medium')}
            className={`rounded-[10px] border p-3.5 sm:p-4 transition-all duration-150 cursor-pointer shadow-2xs ${
              priorityFilter === 'medium' 
                ? 'bg-[#fefce8] border-[#d9a441] ring-1 ring-[#d9a441]/30' 
                : 'bg-white border-[#dddddd] hover:bg-[#fefce8]/40 hover:border-[#d9a441]/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-[#d9a441] flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#d9a441]" />
                Medium Priority
              </span>
              <Info className="h-3.5 w-3.5 text-[#d9a441]" />
            </div>
            <div className="text-2xl sm:text-3xl font-normal text-[#d9a441] mt-2 leading-none">
              {pb.medium}
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#555b66] font-normal mt-1">
              Standard 48 hr resolution queue
            </p>
          </div>

          {/* Low / Resolved */}
          <div 
            onClick={() => setPriorityFilter(priorityFilter === 'low' ? 'all' : 'low')}
            className={`rounded-[10px] border p-3.5 sm:p-4 transition-all duration-150 cursor-pointer shadow-2xs ${
              priorityFilter === 'low' 
                ? 'bg-[#f0fdf4] border-[#006400] ring-1 ring-[#006400]/30' 
                : 'bg-white border-[#dddddd] hover:bg-[#f0fdf4]/40 hover:border-[#006400]/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-[#006400] flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#006400]" />
                Low / Resolved
              </span>
              <CheckCircle2 className="h-3.5 w-3.5 text-[#006400]" />
            </div>
            <div className="text-2xl sm:text-3xl font-normal text-[#006400] mt-2 leading-none">
              {pb.low}
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#555b66] font-normal mt-1">
              Routine civic requests &amp; closed
            </p>
          </div>

        </div>
      </div>

      {/* DEPARTMENT COMPLAINTS TABLE FILTERED BY PRIORITY */}
      <Card className="border-[#dddddd] bg-white shadow-2xs overflow-hidden rounded-[10px]">
        <CardHeader className="p-3.5 sm:p-4 pb-2.5 border-b border-[#dddddd] flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm sm:text-base font-medium text-[#181d26] flex items-center gap-2">
              {analytics?.department_name} — Active Grievance Queue
              <Badge variant="default" className="text-[10px]">
                {filteredGrievances.length} Tickets
              </Badge>
            </CardTitle>
            <CardDescription className="text-[11px] text-[#555b66]">
              {priorityFilter === 'all' 
                ? 'Showing all department tickets sorted by AI urgency score.' 
                : `Filtered by: ${priorityFilter.toUpperCase()} priority only.`}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[110px]">AI Score</TableHead>
                <TableHead className="w-[90px]">ID / Date</TableHead>
                <TableHead>Issue Title &amp; Citizen Description</TableHead>
                <TableHead>Locality / Ward</TableHead>
                <TableHead>Assigned Officer</TableHead>
                <TableHead className="text-right">Status / SLA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGrievances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-xs text-[#555b66]">
                    No grievances in this department matching the "{priorityFilter}" priority filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredGrievances.map((g) => {
                  const score = g.ai_priority_score;
                  let scoreVariant = 'low';
                  let barColor = 'low';
                  if (score >= 80) { scoreVariant = 'critical'; barColor = 'critical'; }
                  else if (score >= 60) { scoreVariant = 'high'; barColor = 'high'; }
                  else if (score >= 35) { scoreVariant = 'medium'; barColor = 'medium'; }

                  return (
                    <TableRow 
                      key={g.id}
                      onClick={() => {
                        setSelectedGrievanceId(g.id);
                        setSheetOpen(true);
                      }}
                      className="cursor-pointer hover:bg-[#f8fafc] transition-colors"
                    >
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <Badge variant={scoreVariant} className="text-[10px] font-semibold px-1 py-0">
                              {score}/100
                            </Badge>
                            <span className="text-[9px] font-medium uppercase text-[#555b66]">
                              {g.ai_priority_level}
                            </span>
                          </div>
                          <Progress value={score} color={barColor} className="h-1.5 w-14" />
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-mono text-[11px] font-medium text-[#181d26]">{g.id}</div>
                        <div className="text-[9px] text-[#555b66]">{g.created_at?.substring(5, 10)}</div>
                      </TableCell>

                      <TableCell className="max-w-md">
                        <div className="font-medium text-xs text-[#181d26] flex items-center gap-1">
                          {g.title}
                          {g.health_risk && <AlertTriangle className="h-3 w-3 text-[#aa2d00] shrink-0" title="Health Hazard" />}
                          {g.safety_risk && <ShieldAlert className="h-3 w-3 text-[#ea580c] shrink-0" title="Safety Hazard" />}
                        </div>
                        <p className="text-[11px] text-[#555b66] line-clamp-1 mt-0.5">
                          {g.description}
                        </p>
                      </TableCell>


                      <TableCell className="text-xs">
                        <div className="font-medium text-[#181d26] flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-[#181d26]" />
                          {g.locality}
                        </div>
                        <div className="text-[10px] text-[#555b66]">Ward {g.ward}</div>
                      </TableCell>

                      <TableCell className="text-xs text-[#555b66]">
                        {g.assigned_officer_name?.split('(')[0]}
                      </TableCell>

                      <TableCell className="text-right">
                        <Badge 
                          variant={
                            g.status === 'Resolved' ? 'low' : 
                            g.status === 'Escalated' ? 'critical' : 
                            g.status === 'In Progress' ? 'blue' : 'default'
                          }
                          className="text-[9px] py-0"
                        >
                          {g.status}
                        </Badge>
                        {g.is_overdue && (
                          <span className="block text-[8px] font-medium text-[#aa2d00] mt-0.5">
                            SLA Breached
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* AI DETECTED RECURRING INFRASTRUCTURE ISSUES: Brand Voltage Signature Card */}
      <Card className="border-[#dddddd] bg-white shadow-2xs rounded-[10px]">
        <CardHeader className="p-3.5 sm:p-4 pb-2.5 border-b border-[#dddddd]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-[6px] bg-[#181d26] text-white flex items-center justify-center shadow-xs">
                <Wrench className="h-3.5 w-3.5" />
              </div>
              <div>
                <CardTitle className="text-sm sm:text-base font-medium text-[#181d26] flex items-center gap-1.5 flex-wrap">
                  AI-Detected Recurring Infrastructure Hotspots
                  <Badge variant="critical" className="text-[9px] py-0">
                    Root Cause Diagnosis
                  </Badge>
                </CardTitle>
                <CardDescription className="text-[11px] text-[#555b66]">
                  AI automatically detects chronic equipment/pipeline failures where spot repairs are failing repeatedly.
                </CardDescription>
              </div>
            </div>
            <span className="text-[11px] font-medium text-[#555b66] hidden sm:block">
              {analytics?.recurring_issues?.length || 0} Patterns Found
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-3.5 sm:p-4 space-y-3">
          {analytics?.recurring_issues?.length === 0 ? (
            <p className="text-xs text-[#555b66] italic">
              No chronic recurring failure patterns detected for this department.
            </p>
          ) : (
            analytics?.recurring_issues?.map((rec) => (
              <div 
                key={rec.id}
                className="rounded-[8px] border border-[#dddddd] bg-white p-3.5 sm:p-4 space-y-2.5 shadow-2xs hover:border-[#9297a0] transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-[#dddddd]/70 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#aa2d00] animate-pulse shrink-0" />
                    <h3 className="text-xs sm:text-sm font-semibold text-[#181d26]">
                      {rec.infrastructure_asset}
                    </h3>
                  </div>
                  <Badge variant="critical" className="text-[10px] self-start sm:self-auto font-medium">
                    {rec.repeat_incident_count} Incidents • ~{rec.total_citizens_affected} Citizens
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-[6px] bg-[#f8fafc] border border-[#dddddd]">
                    <span className="text-[9px] font-medium uppercase text-[#181d26] block">
                      AI Diagnostic Finding
                    </span>
                    <p className="text-xs text-[#333840] mt-0.5 font-normal leading-relaxed">
                      {rec.ai_pattern_insight}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-[6px] bg-[#f0fdf4] border border-[#bbf7d0]">
                    <span className="text-[9px] font-medium uppercase text-[#006400] block">
                      Recommended Engineering Solution
                    </span>
                    <p className="text-xs text-[#061e09] mt-0.5 font-medium leading-relaxed">
                      {rec.recommended_permanent_fix}
                    </p>
                  </div>
                </div>

                {/* Sample Tickets in this recurring hotspot */}
                <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                  <span className="text-[10px] font-medium text-[#555b66]">Linked Tickets:</span>
                  <div className="flex flex-wrap gap-1">
                    {rec.sample_complaints?.map(sc => (
                      <button
                        key={sc.id}
                        onClick={() => {
                          setSelectedGrievanceId(sc.id);
                          setSheetOpen(true);
                        }}
                        className="text-[10px] font-medium text-[#181d26] bg-[#f8fafc] hover:bg-[#e0e2e6] px-2 py-0.5 rounded-[4px] border border-[#dddddd] transition-colors cursor-pointer"
                      >
                        {sc.id} ({sc.status})
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* 2-COLUMN SECTION: AREA BREAKDOWN & OFFICER WORKLOAD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        
        {/* WHICH AREAS HAVE THE MOST? */}
        <Card className="border-[#dddddd] bg-white shadow-2xs rounded-[10px]">
          <CardHeader className="p-3.5 sm:p-4 pb-2.5 border-b border-[#dddddd]">
            <CardTitle className="text-xs sm:text-sm font-medium text-[#181d26] flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#181d26]" />
              Which Areas Have the Most Grievances?
            </CardTitle>
            <CardDescription className="text-[11px] text-[#555b66]">
              High concentration localities requiring additional zonal squad allocation.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-3.5 sm:p-4 space-y-2.5">
            {analytics?.areas?.slice(0, 6).map((area, idx) => {
              const maxCount = analytics?.areas[0]?.count || 1;
              const pct = Math.round((area.count / maxCount) * 100);

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-[#181d26] flex items-center gap-1">
                      <span className="text-[9px] font-mono text-[#555b66]">#{idx + 1}</span>
                      {area.name} (Ward {area.ward})
                    </span>
                    <div className="flex items-center gap-1.5">
                      {area.critical > 0 && (
                        <Badge variant="critical" className="text-[8px] py-0">
                          {area.critical} Critical
                        </Badge>
                      )}
                      <span className="text-[#181d26] font-semibold text-[11px]">{area.count} complaints</span>
                    </div>
                  </div>
                  <Progress value={pct} color="default" className="h-1.5 bg-[#f8fafc]" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* WHICH OFFICERS ARE OVERLOADED? */}
        <Card className="border-[#dddddd] bg-white shadow-2xs rounded-[10px]">
          <CardHeader className="p-3.5 sm:p-4 pb-2.5 border-b border-[#dddddd]">
            <CardTitle className="text-xs sm:text-sm font-medium text-[#181d26] flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-[#1b61c9]" />
              Which Officers are Overloaded?
            </CardTitle>
            <CardDescription className="text-[11px] text-[#555b66]">
              Real-time active caseload per zonal engineer and load-balancing alerts.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-3.5 sm:p-4 space-y-3">
            {analytics?.officers?.slice(0, 5).map((off) => {
              const isOver = off.workload_status === 'Overloaded';
              return (
                <div key={off.officer_id} className="p-2.5 sm:p-3 rounded-[8px] border border-[#dddddd] bg-[#f8fafc] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <div className="font-medium text-[#181d26]">{off.officer_name}</div>
                      <div className="text-[9px] text-[#555b66]">{off.officer_id}</div>
                    </div>
                    <Badge variant={isOver ? 'critical' : off.workload_status === 'Moderate' ? 'high' : 'low'}>
                      {off.workload_status} ({off.active_cases} Active)
                    </Badge>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[9px] text-[#555b66] font-medium">
                      <span>Capacity Allocation</span>
                      <span>{off.capacity_percentage}%</span>
                    </div>
                    <Progress 
                      value={off.capacity_percentage} 
                      color={isOver ? 'critical' : off.capacity_percentage > 60 ? 'high' : 'low'}
                      className="h-1.5"
                    />
                  </div>

                  {off.overdue_cases > 0 && (
                    <p className="text-[9px] text-[#aa2d00] font-medium flex items-center gap-1">
                      <AlertTriangle className="h-2.5 w-2.5 shrink-0" />
                      <span>{off.overdue_cases} cases past SLA deadline</span>
                    </p>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

      </div>

      {/* WHICH COMPLAINTS ARE OVERDUE? */}
      <Card className="border-[#dddddd] bg-white shadow-2xs rounded-[10px]">
        <CardHeader className="p-3.5 sm:p-4 pb-2.5 border-b border-[#dddddd] flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xs sm:text-sm font-medium text-[#181d26] flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#aa2d00]" />
              Overdue Complaints Requiring Supervisor Intervention
            </CardTitle>
            <CardDescription className="text-[11px] text-[#555b66]">
              Complaints that breached departmental SLA timeframes. Click to review or escalate.
            </CardDescription>
          </div>
          <Badge variant="critical">
            {analytics?.overdue_complaints || 0} Overdue
          </Badge>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[90px]">ID</TableHead>
                <TableHead>Issue &amp; Locality</TableHead>
                <TableHead>Assigned Officer</TableHead>
                <TableHead>Days Open / Overdue</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics?.overdue_list?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-xs text-[#006400] font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#006400] inline mr-1" /> Excellent! No overdue complaints in this department.
                  </TableCell>
                </TableRow>
              ) : (

                analytics?.overdue_list?.map((g) => (
                  <TableRow key={g.id} className="hover:bg-[#fef2f2]/30">
                    <TableCell className="font-mono text-xs font-medium text-[#aa2d00]">
                      {g.id}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-xs text-[#181d26]">{g.title}</div>
                      <div className="text-[9px] text-[#555b66]">{g.locality} (Ward {g.ward})</div>
                    </TableCell>
                    <TableCell className="text-xs text-[#555b66]">
                      {g.assigned_officer_name?.split('(')[0]}
                    </TableCell>
                    <TableCell>
                      <Badge variant="critical" className="text-[9px]">
                        {g.days_open} days ({g.overdue_hours}h overdue)
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={() => {
                          setSelectedGrievanceId(g.id);
                          setSheetOpen(true);
                        }}
                        className="text-[11px] h-7.5 px-2.5"
                      >
                        Inspect
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Priority Explainer Sheet */}
      <PriorityExplainerSheet
        grievanceId={selectedGrievanceId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onGrievanceUpdated={() => loadData(selectedDeptId)}
      />

    </div>
  );
}


