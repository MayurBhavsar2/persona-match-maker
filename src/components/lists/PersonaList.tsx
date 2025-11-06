import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Edit, Trash2, Search, Target, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface PersonaListItem {
  id: string;
  name: string;
  jd_id: string;
  jd_title: string;
  role_name: string;
  created_at: string;
  evaluation_count: number;
  status: 'draft' | 'active';
}

interface PersonaListProps {
  onEdit: (personaId: string) => void;
  onCreate: () => void;
  onDelete: (personaId: string) => void;
}

const PersonaList = ({ onEdit, onCreate, onDelete }: PersonaListProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [personas, setPersonas] = useState<PersonaListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [jdFilter, setJdFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string; hasEvaluations: boolean } | null>(null);
  const [availableJDs, setAvailableJDs] = useState<{ id: string; title: string }[]>([]);

  // Fetch personas and JDs from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch personas and JDs in parallel
        const [personasResponse, jdsResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/v1/persona/`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          fetch(`${import.meta.env.VITE_API_URL}/api/v1/jd/`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
        ]);

        if (!personasResponse.ok) throw new Error(`Failed to fetch personas: ${personasResponse.status}`);
        if (!jdsResponse.ok) throw new Error(`Failed to fetch JDs: ${jdsResponse.status}`);

        const personasData = await personasResponse.json();
        const jdsData = await jdsResponse.json();
        
        // Transform JDs data for filter dropdown
        const jdsList = (jdsData.job_descriptions || jdsData || []).map((jd: any) => ({
          id: jd.id,
          title: jd.title || jd.role || 'Untitled JD'
        }));
        setAvailableJDs(jdsList);

        // Transform personas data to match our interface
        const transformedPersonas: PersonaListItem[] = (personasData.personas || personasData || []).map((persona: any) => {
          // Find matching JD for this persona
          const matchingJD = jdsList.find((jd: any) => jd.id === persona.job_description_id);
          
          return {
            id: persona.id,
            name: persona.name || 'Unnamed Persona',
            jd_id: persona.job_description_id || '',
            jd_title: matchingJD?.title || 'Unknown JD',
            role_name: persona.role_name || matchingJD?.title || 'Unknown Role',
            created_at: persona.created_at || new Date().toISOString(),
            evaluation_count: persona.evaluation_count || 0,
            status: persona.status || 'active',
          };
        });

        setPersonas(transformedPersonas);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error fetching personas",
          description: "Could not load personas. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    const token = localStorage.getItem("token");
    if (token) {
      fetchData();
    } else {
      toast({
        title: "You're not logged in.",
        description: "Please login to continue.",
      });
      navigate("/login");
    }
  }, [navigate, toast]);

  // Filter personas based on search, JD, and status
  const filteredPersonas = personas.filter(persona => {
    const matchesSearch = persona.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         persona.jd_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         persona.role_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJD = jdFilter === "all" || persona.jd_id === jdFilter;
    const matchesStatus = statusFilter === "all" || persona.status === statusFilter;
    return matchesSearch && matchesJD && matchesStatus;
  });

  const handleDelete = async (personaId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/persona/${personaId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete persona");

      // Remove from local state
      setPersonas(prev => prev.filter(persona => persona.id !== personaId));
      
      toast({
        title: "Persona Deleted",
        description: "Persona has been deleted successfully.",
      });
      
      onDelete(personaId);
    } catch (error) {
      console.error("Error deleting persona:", error);
      toast({
        title: "Delete failed",
        description: "Could not delete the persona. Please try again.",
        variant: "destructive",
      });
    }
    setDeleteConfirm(null);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "secondary",
      active: "default"
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-muted-foreground">Loading personas...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Persona Management</h2>
          <p className="text-muted-foreground">Configure evaluation criteria for different roles</p>
        </div>
        <Button onClick={onCreate} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Create Persona</span>
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search personas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={jdFilter} onValueChange={setJdFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by JD" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Job Descriptions</SelectItem>
                {availableJDs.map((jd) => (
                  <SelectItem key={jd.id} value={jd.id}>
                    {jd.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Persona List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-primary" />
            <span>Personas ({filteredPersonas.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPersonas.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {personas.length === 0 ? "No personas yet" : "No matching personas"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {personas.length === 0 
                  ? "Create your first persona to define evaluation criteria."
                  : "Try adjusting your search or filter criteria."
                }
              </p>
              {personas.length === 0 && (
                <Button onClick={onCreate} className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Create First Persona</span>
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Persona Name</TableHead>
                    <TableHead>Associated JD</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Evaluations</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPersonas.map((persona) => (
                    <TableRow key={persona.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="font-medium text-foreground">{persona.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{persona.jd_title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{persona.role_name}</span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(persona.status)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <Target className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{persona.evaluation_count}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(persona.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(persona.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm({ 
                              id: persona.id, 
                              name: persona.name,
                              hasEvaluations: persona.evaluation_count > 0
                            })}
                            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Persona</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirm?.name}"? 
              {deleteConfirm?.hasEvaluations && (
                <span className="block mt-2 text-destructive font-medium">
                  Warning: This persona has {deleteConfirm.hasEvaluations ? 'existing evaluations' : ''} that will be affected.
                </span>
              )}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PersonaList;