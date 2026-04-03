import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Github, ExternalLink, Edit2, Trash2, Plus } from "lucide-react";
import { projectsAPI, Project } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import AddItemModal, { FormField } from "@/components/AddItemModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ProjectsPage = () => {
  const { isAuthenticated } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    domains: '',
    status: 'active' as 'active' | 'completed' | 'archived',
    repo: '',
    demo: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addProjectFields: FormField[] = [
    { name: 'title', label: 'Project Title', type: 'text', required: true, placeholder: 'Enter project name' },
    { name: 'summary', label: 'Summary', type: 'textarea', required: true, placeholder: 'Brief description of the project' },
    { name: 'domains', label: 'Domains (comma-separated)', type: 'text', required: true, placeholder: 'e.g., AI/ML, Web Dev, Backend' },
    { name: 'repo', label: 'Repository URL', type: 'url', required: false, placeholder: 'https://github.com/...' },
    { name: 'demo', label: 'Demo URL', type: 'url', required: false, placeholder: 'https://demo.example.com' },
    { name: 'status', label: 'Status', type: 'select', required: false, options: [
      { label: 'Active', value: 'active' },
      { label: 'Completed', value: 'completed' },
      { label: 'Archived', value: 'archived' }
    ]},
  ];

  const handleAddProjectSubmit = async (fd: FormData) => {
    try {
      const title = fd.get('title') as string;
      const summary = fd.get('summary') as string;
      const domains = (fd.get('domains') as string).split(',').map(d => d.trim()).filter(d => d);
      const repo = fd.get('repo') as string;
      const demo = fd.get('demo') as string;
      const status = (fd.get('status') as string) || 'active';

      await projectsAPI.create({
        title,
        summary,
        domains,
        repo: repo || undefined,
        demo: demo || undefined,
        status: status as 'active' | 'completed' | 'archived',
      });

      setIsAddModalOpen(false);
      await fetchProjects();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await projectsAPI.getAll();
      setProjects(response.data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      summary: project.summary,
      domains: project.domains.join(', '),
      status: project.status,
      repo: project.repo || '',
      demo: project.demo || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingProject) {
        const domains = formData.domains
          .split(',')
          .map((d) => d.trim())
          .filter((d) => d);

        await projectsAPI.update(editingProject.id, {
          title: formData.title,
          summary: formData.summary,
          domains,
          status: formData.status,
          repo: formData.repo || undefined,
          demo: formData.demo || undefined,
        });
      }

      await fetchProjects();
      setEditingProject(null);
      setFormData({
        title: '',
        summary: '',
        domains: '',
        status: 'active',
        repo: '',
        demo: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      await projectsAPI.delete(id);
      await fetchProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="py-24">
        <div className="container">
          <div className="text-center space-y-4 mb-16 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Our <span className="gradient-text">Projects</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Real-world applications built by our community
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md mb-8 text-center">
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center items-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Add New Project Card - Only visible if authenticated */}
                {isAuthenticated && (
                  <Card
                    className="p-6 border-2 border-dashed border-muted-foreground/50 hover:border-muted-foreground transition-all cursor-pointer flex items-center justify-center min-h-64"
                    onClick={() => setIsAddModalOpen(true)}
                  >
                    <div className="text-center space-y-3">
                      <div className="flex justify-center">
                        <div className="p-3 bg-primary/10 rounded-full">
                          <Plus className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <h3 className="font-semibold text-lg">Add New Project</h3>
                      <p className="text-sm text-muted-foreground">Click to create a new project</p>
                    </div>
                  </Card>
                )}

                {/* Project Cards */}
              {projects.map((project, index) => (
                <Card
                  key={project.id}
                  className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-slide-up border-border/40 flex flex-col relative group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-semibold">{project.title}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="rounded-full">
                          {project.status}
                        </Badge>
                        {isAuthenticated && (
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditClick(project)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Edit Project</DialogTitle>
                                  <DialogDescription>Update project details</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium">Title</label>
                                    <Input
                                      value={formData.title}
                                      onChange={(e) =>
                                        setFormData({ ...formData, title: e.target.value })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Summary</label>
                                    <Input
                                      value={formData.summary}
                                      onChange={(e) =>
                                        setFormData({ ...formData, summary: e.target.value })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Domains (comma-separated)</label>
                                    <Input
                                      value={formData.domains}
                                      onChange={(e) =>
                                        setFormData({ ...formData, domains: e.target.value })
                                      }
                                      placeholder="e.g., AI/ML, Web Dev"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Status</label>
                                    <select
                                      value={formData.status}
                                      onChange={(e) =>
                                        setFormData({
                                          ...formData,
                                          status: e.target.value as 'active' | 'completed' | 'archived',
                                        })
                                      }
                                      className="w-full px-3 py-2 border rounded-md"
                                    >
                                      <option value="active">Active</option>
                                      <option value="completed">Completed</option>
                                      <option value="archived">Archived</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Repository URL</label>
                                    <Input
                                      value={formData.repo}
                                      onChange={(e) =>
                                        setFormData({ ...formData, repo: e.target.value })
                                      }
                                      placeholder="https://github.com/..."
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Demo URL</label>
                                    <Input
                                      value={formData.demo}
                                      onChange={(e) =>
                                        setFormData({ ...formData, demo: e.target.value })
                                      }
                                      placeholder="https://demo.example.com"
                                    />
                                  </div>
                                  <Button type="submit" disabled={isSubmitting} className="w-full">
                                    {isSubmitting ? 'Updating...' : 'Update Project'}
                                  </Button>
                                </form>
                              </DialogContent>
                            </Dialog>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(project.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-muted-foreground">{project.summary}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.domains.map((domain) => (
                        <Badge key={domain} variant="outline" className="rounded-full">
                          {domain}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6 pt-6 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-full"
                      disabled={!project.repo}
                      asChild={!!project.repo}
                    >
                      {project.repo ? (
                        <a href={project.repo} target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4 mr-2" />
                          Repo
                        </a>
                      ) : (
                        <span className="text-gray-400 cursor-not-allowed">
                          <Github className="h-4 w-4 mr-2" />
                          Repo
                        </span>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-full"
                      disabled={!project.demo}
                      asChild={!!project.demo}
                    >
                      {project.demo ? (
                        <a href={project.demo} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Demo
                        </a>
                      ) : (
                        <span className="text-gray-400 cursor-not-allowed">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Demo
                        </span>
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
              </div>

              {!isLoading && projects.length === 0 && !isAuthenticated && (
                <p className="text-center text-muted-foreground">No projects available yet.</p>
              )}
            </>
          )}
        </div>
      </main>

      {/* Add Project Modal */}
      <AddItemModal
        isOpen={isAddModalOpen}
        title="Create New Project"
        description="Add a new project to showcase your work"
        fields={addProjectFields}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddProjectSubmit}
      />

      <Footer />
    </div>
  );
};

export default ProjectsPage;
