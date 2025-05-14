
import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { History, ArrowLeft, RefreshCcw, Filter, Calendar } from "lucide-react";
import { FadeIn, ScaleIn, StaggerContainer, StaggerItem } from "@/components/ui/animations";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

type AccessLog = {
  id: string;
  token_id: string;
  user_id: string;
  access_type: 'view' | 'copy';
  created_at: string;
  ip_address: string | null;
  user_agent: string | null;
  device_name: string | null;
  location_data: any | null;
  token_name?: string;
  token_issuer?: string;
};

const TracesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");
  const [timeRange, setTimeRange] = useState<string>("all");

  const fetchLogs = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Join the logs table with the tokens table to get token names
      const { data, error } = await supabase
        .from('token_access_logs')
        .select(`
          *,
          token:token_id (
            name,
            issuer
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }

      // Transform the data to include token name and issuer
      const transformedLogs = data.map((log: any) => ({
        ...log,
        token_name: log.token?.name || 'Unknown',
        token_issuer: log.token?.issuer || 'Unknown'
      }));
      
      setLogs(transformedLogs);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast({
        title: "Error fetching logs",
        description: "There was a problem loading your access logs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [user]);

  const getFilteredLogs = () => {
    let filtered = [...logs];
    
    // Apply time range filter
    if (timeRange !== "all") {
      const now = new Date();
      let cutoff = new Date();
      
      switch (timeRange) {
        case "day":
          cutoff.setDate(now.getDate() - 1);
          break;
        case "week":
          cutoff.setDate(now.getDate() - 7);
          break;
        case "month":
          cutoff.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(log => new Date(log.created_at) >= cutoff);
    }
    
    // Apply text filter
    if (filter) {
      const lowercaseFilter = filter.toLowerCase();
      filtered = filtered.filter(log => 
        log.token_name?.toLowerCase().includes(lowercaseFilter) ||
        log.token_issuer?.toLowerCase().includes(lowercaseFilter) ||
        log.device_name?.toLowerCase().includes(lowercaseFilter) ||
        log.ip_address?.includes(lowercaseFilter)
      );
    }
    
    return filtered;
  };

  const filteredLogs = getFilteredLogs();

  return (
    <div className="container max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>
      
      <PageHeader 
        title="AdiNox Traces" 
        description="View your authentication token access history"
        icon={<History className="h-8 w-8 text-primary" />}
      />
      
      <StaggerContainer delayChildren={0.3} staggerChildren={0.1}>
        <StaggerItem>
          <div className="mb-6">
            <motion.div 
              className="h-1 bg-gradient-to-r from-adinox-purple via-adinox-light-purple to-adinox-red rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
            />
          </div>
        </StaggerItem>
        
        <StaggerItem>
          <div className="rounded-xl bg-card/30 backdrop-blur-sm p-4 border border-border/50 shadow-lg mb-6">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-grow">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter logs..."
                  className="pl-9 bg-background/70 backdrop-blur-sm border-input/50"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
              
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[160px] bg-background/70 backdrop-blur-sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="day">Last 24 Hours</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={fetchLogs} disabled={loading}>
                <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </StaggerItem>
        
        <StaggerItem>
          <FadeIn>
            <div className="rounded-xl bg-card/30 backdrop-blur-sm border border-border/50 shadow-lg overflow-hidden">
              {loading ? (
                <div className="flex justify-center items-center p-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : filteredLogs.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">Token & Service</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Device</TableHead>
                        <TableHead>Location</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map((log) => (
                        <TableRow key={log.id} className="animate-in fade-in-50">
                          <TableCell className="font-medium">
                            <div className="font-semibold">{log.token_issuer}</div>
                            <div className="text-xs text-muted-foreground">{log.token_name}</div>
                          </TableCell>
                          <TableCell>
                            <div>{format(new Date(log.created_at), 'MMM d, yyyy')}</div>
                            <div className="text-xs text-muted-foreground">{format(new Date(log.created_at), 'h:mm a')}</div>
                          </TableCell>
                          <TableCell>
                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              {log.access_type === 'copy' ? 'Copied' : 'Viewed'}
                            </div>
                          </TableCell>
                          <TableCell>{log.device_name || 'Unknown'}</TableCell>
                          <TableCell>
                            {log.location_data ? (
                              <div>
                                <div>{log.location_data.region || 'Unknown'}</div>
                                <div className="text-xs text-muted-foreground">{log.ip_address}</div>
                              </div>
                            ) : (
                              <div>Unknown</div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                    <History className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium">No access logs found</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                    {filter || timeRange !== "all" 
                      ? "Try adjusting your filters to see more results." 
                      : "Your token access history will appear here once you start using your tokens."}
                  </p>
                </div>
              )}
            </div>
          </FadeIn>
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
};

export default TracesPage;
