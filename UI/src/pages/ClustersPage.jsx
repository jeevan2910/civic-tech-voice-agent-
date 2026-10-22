import React, { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { PriorityExplainerSheet } from '@/components/common/PriorityExplainerSheet';
import { 
  Layers, 
  MapPin, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Building, 
  Sparkles,
  RefreshCw,
  ChevronRight
} from 'lucide-react';

export function ClustersPage() {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrievanceId, setSelectedGrievanceId] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [filterType, setFilterType] = useState('all');

  const loadClusters = async () => {
    setLoading(true);
    try {
      const res = await api.getClusters();
      setClusters(res.clusters || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClusters();
  }, []);

  const filteredClusters = clusters.filter(c => {
    if (filterType === 'systemic') return c.is_systemic;
    if (filterType === 'critical') return c.max_priority_score >= 80;
    return true;
  });

  return (
    <div className="space-y-5 pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#dddddd] pb-3.5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-medium text-[#181d26] tracking-tight">
              AI Problem Grouping &amp; Systemic Incident Clusters
            </h1>
            <Badge variant="default" className="text-[10px] font-medium">
              Auto-Deduplication
            </Badge>
          </div>
          <p className="text-xs text-[#555b66] font-normal mt-0.5 leading-relaxed">
            Complaints correlated by <strong>Geographic Proximity</strong>, <strong>Issue Type</strong>, and <strong>Timeline</strong> to detect city-wide infrastructural failures.
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Button 
            size="sm" 
            variant={filterType === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterType('all')}
            className="text-[11px] sm:text-xs h-8 px-2.5"
          >
            All ({clusters.length})
          </Button>
          <Button 
            size="sm" 
            variant={filterType === 'systemic' ? 'default' : 'outline'}
            onClick={() => setFilterType('systemic')}
            className="text-[11px] sm:text-xs h-8 px-2.5"
          >
            Systemic (3+)
          </Button>
          <Button 
            size="sm" 
            variant={filterType === 'critical' ? 'danger' : 'outline'}
            onClick={() => setFilterType('critical')}
            className="text-[11px] sm:text-xs h-8 px-2.5"
          >
            Critical
          </Button>
          <Button variant="outline" size="sm" onClick={loadClusters} className="bg-white h-8 px-2.5">
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Cluster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {filteredClusters.map((cluster) => {
          const isCrit = cluster.max_priority_score >= 80;
          return (
            <Card 
              key={cluster.group_id}
              className={`border border-[#dddddd] transition-all duration-150 shadow-2xs hover:border-[#9297a0] bg-white rounded-[10px]`}
            >
              <CardHeader className="p-3.5 sm:p-4 pb-2.5 border-b border-[#dddddd]">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[9px] font-medium text-[#555b66]">
                        {cluster.group_id}
                      </span>
                      {cluster.is_systemic && (
                        <Badge variant="critical" className="text-[8px] py-0 font-medium">
                          Systemic Failure
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-sm sm:text-base font-medium text-[#181d26]">
                      {cluster.title}
                    </CardTitle>
                  </div>

                  <Badge variant={isCrit ? 'critical' : cluster.max_priority_score >= 60 ? 'high' : 'medium'} className="text-[10px] font-semibold shrink-0">
                    {cluster.complaint_count} Complaints
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#555b66] pt-1">
                  <span className="flex items-center gap-1 font-medium text-[#181d26]">
                    <MapPin className="h-3 w-3 text-[#181d26]" />
                    {cluster.locality} (Ward {cluster.ward})
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-[#555b66]" />
                    ~{cluster.total_affected_people} Citizens Impacted
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-3.5 sm:p-4 space-y-3">
                
                {/* AI Cluster Diagnosis */}
                <div className="p-2.5 sm:p-3 rounded-[8px] bg-[#f8fafc] border border-[#dddddd] space-y-0.5">
                  <span className="text-[9px] font-medium uppercase text-[#181d26] flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-[#aa2d00]" /> AI Cluster Diagnosis
                  </span>
                  <p className="text-xs text-[#333840] font-normal leading-relaxed">
                    {cluster.ai_summary}
                  </p>
                </div>

                {/* Recommended Operational Action */}
                <div className="p-2.5 sm:p-3 rounded-[8px] bg-[#f0fdf4] border border-[#bbf7d0] space-y-0.5">
                  <span className="text-[9px] font-medium uppercase text-[#006400] flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Recommended Operational Action
                  </span>
                  <p className="text-xs text-[#061e09] font-medium leading-relaxed">
                    {cluster.recommended_action}
                  </p>
                </div>

                {/* Complaints List in this cluster */}
                <div className="space-y-1.5 pt-0.5">
                  <span className="text-[10px] font-medium text-[#555b66] block">
                    Individual Correlated Grievances ({cluster.complaints.length}):
                  </span>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {cluster.complaints.map(c => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedGrievanceId(c.id);
                          setSheetOpen(true);
                        }}
                        className="flex items-center justify-between p-2 rounded-[6px] border border-[#dddddd] bg-[#f8fafc] hover:bg-white hover:border-[#181d26] transition-colors cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-1.5 truncate pr-2">
                          <span className="font-mono text-[9px] font-medium text-[#181d26] shrink-0">{c.id}</span>
                          <span className="truncate font-medium text-[#181d26]">{c.title}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Badge variant={c.ai_priority_score >= 80 ? 'critical' : 'default'} className="text-[8px] py-0">
                            {c.ai_priority_score} pts
                          </Badge>
                          <ChevronRight className="h-3 w-3 text-[#555b66]" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </CardContent>
            </Card>
          );
        })}
      </div>

      <PriorityExplainerSheet
        grievanceId={selectedGrievanceId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onGrievanceUpdated={loadClusters}
      />

    </div>
  );
}


