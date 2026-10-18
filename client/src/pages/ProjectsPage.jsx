import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  Plus,
  Search,
  ExternalLink,
  Github,
  Trash2,
  Edit2,
  Star,
  Eye,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  Archive,
  Lock,
  Globe,
} from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';
import {
  getProjectsApi,
  createProjectApi,
  updateProjectApi,
  deleteProjectApi,
} from '../services/api.js';
import Modal from '../components/Modal.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Skeleton from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function ProjectsPage() {
  const { showToast } = useToast();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // View Details Modal State
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Full Stack',
    technologies: '',
    githubUrl: '',
    liveUrl: '',
    image: '',
    startDate: '',
    endDate: '',
    status: 'completed',
    featured: false,
    isPublic: true,
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await getProjectsApi();
      if (res.success) {
        setProjects(res.data || []);
      }
    } catch (err) {
      showToast('Failed to load projects from server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenAdd = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      description: '',
      category: 'Full Stack',
      technologies: '',
      githubUrl: '',
      liveUrl: '',
      image: '',
      startDate: '',
      endDate: '',
      status: 'completed',
      featured: false,
      isPublic: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title || '',
      description: project.description || '',
      category: project.category || 'Full Stack',
      technologies: Array.isArray(project.technologies) ? project.technologies.join(', ') : '',
      githubUrl: project.githubUrl || '',
      liveUrl: project.liveUrl || '',
      image: project.image || '',
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
      status: (project.status || 'completed').toLowerCase(),
      featured: Boolean(project.featured),
      isPublic: project.isPublic !== false,
    });
    setModalOpen(true);
  };

  const handleOpenView = (project) => {
    setSelectedProject(project);
    setViewModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      showToast('Project title and description are required.', 'error');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      technologies: formData.technologies
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      githubUrl: formData.githubUrl.trim(),
      liveUrl: formData.liveUrl.trim(),
      image: formData.image.trim(),
      startDate: formData.startDate ? new Date(formData.startDate) : null,
      endDate: formData.endDate ? new Date(formData.endDate) : null,
      status: formData.status.toLowerCase(),
      featured: formData.featured,
      isPublic: formData.isPublic,
    };

    try {
      setSubmitting(true);
      if (editingProject) {
        const res = await updateProjectApi(editingProject._id, payload);
        if (res.success) {
          setProjects((prev) =>
            prev.map((p) => (p._id === editingProject._id ? res.data : p))
          );
          showToast('Project updated successfully.', 'success');
        }
      } else {
        const res = await createProjectApi(payload);
        if (res.success) {
          setProjects((prev) => [res.data, ...prev]);
          showToast('Project created successfully.', 'success');
        }
      }
      setModalOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save project.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete project "${title}"?`)) return;

    try {
      const res = await deleteProjectApi(id);
      if (res.success) {
        setProjects((prev) => prev.filter((p) => p._id !== id));
        if (selectedProject?._id === id) {
          setViewModalOpen(false);
        }
        showToast('Project removed.', 'info');
      }
    } catch (err) {
      showToast('Failed to delete project.', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || 'completed').toLowerCase();
    if (s === 'completed') {
      return (
        <span className="badge badge-green" style={{ fontSize: '0.68rem', gap: '3px' }}>
          <CheckCircle2 className="w-3 h-3" /> Completed
        </span>
      );
    }
    if (s === 'in-progress' || s === 'in progress') {
      return (
        <span className="badge badge-blue" style={{ fontSize: '0.68rem', gap: '3px' }}>
          <Clock className="w-3 h-3" /> In Progress
        </span>
      );
    }
    return (
      <span className="badge badge-neutral" style={{ fontSize: '0.68rem', gap: '3px' }}>
        <Archive className="w-3 h-3" /> Archived
      </span>
    );
  };

  const filteredProjects = projects.filter((p) => {
    const statusLower = (p.status || '').toLowerCase();
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'featured'
        ? Boolean(p.featured)
        : filter === 'completed'
        ? statusLower === 'completed'
        : filter === 'in-progress'
        ? statusLower === 'in-progress' || statusLower === 'in progress'
        : filter === 'archived'
        ? statusLower === 'archived'
        : p.category === filter;

    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.technologies?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <PageHeader
        title="Projects"
        subtitle="Showcase the work that represents your developer journey."
        actions={
          <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
            <Plus className="w-3.5 h-3.5" /> Add Project
          </button>
        }
      />

      {/* Filter & Search Bar */}
      <div
        className="card"
        style={{
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
          <div className="topbar-search" style={{ maxWidth: '280px' }}>
            <Search className="w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search projects or tech..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px' }}>
            {[
              { id: 'all', label: 'All' },
              { id: 'featured', label: 'Featured' },
              { id: 'completed', label: 'Completed' },
              { id: 'in-progress', label: 'In Progress' },
              { id: 'archived', label: 'Archived' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`btn btn-sm ${filter === cat.id ? 'btn-secondary' : 'btn-outline'}`}
                style={{
                  fontSize: '0.78rem',
                  borderColor: filter === cat.id ? 'var(--border-medium)' : 'var(--border-subtle)',
                  fontWeight: filter === cat.id ? 600 : 400,
                  whiteSpace: 'nowrap',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
          <Skeleton height="180px" />
          <Skeleton height="180px" />
          <Skeleton height="180px" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title={projects.length === 0 ? 'No projects yet' : 'No projects match your filter'}
          description={
            projects.length === 0
              ? 'Showcase the work that represents your developer journey. Add your first project.'
              : 'Try selecting another filter or clearing your search term.'
          }
          action={
            projects.length === 0 ? (
              <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
                <Plus className="w-3.5 h-3.5" /> Add Project
              </button>
            ) : null
          }
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '14px',
          }}
        >
          {filteredProjects.map((project) => (
            <div
              key={project._id}
              className="card"
              style={{
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h3
                      onClick={() => handleOpenView(project)}
                      style={{
                        fontSize: '1rem',
                        margin: 0,
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                      }}
                    >
                      {project.title}
                    </h3>
                    {project.featured && (
                      <span title="Featured Project" style={{ color: 'var(--status-warning)', display: 'flex' }}>
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {getStatusBadge(project.status)}
                    {project.isPublic === false && (
                      <span className="badge badge-neutral" title="Private project" style={{ fontSize: '0.64rem' }}>
                        <Lock className="w-2.5 h-2.5" /> Private
                      </span>
                    )}
                  </div>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '14px', lineHeight: 1.45 }}>
                  {project.description?.length > 130 ? `${project.description.substring(0, 130)}...` : project.description}
                </p>
              </div>

              <div>
                {/* Tech Stack Badges */}
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {project.technologies?.map((tech, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-secondary)',
                        background: 'var(--bg-surface-secondary)',
                        border: '1px solid var(--border-subtle)',
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Footer Links & Actions */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '10px',
                  }}
                >
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline btn-sm"
                        style={{ padding: '3px 8px', fontSize: '0.74rem' }}
                      >
                        <Github className="w-3 h-3" /> Code
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline btn-sm"
                        style={{ padding: '3px 8px', fontSize: '0.74rem' }}
                      >
                        <ExternalLink className="w-3 h-3" /> Demo
                      </a>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => handleOpenView(project)}
                      className="icon-btn"
                      style={{ width: '28px', height: '28px' }}
                      title="View Details"
                      aria-label="View Details"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(project)}
                      className="icon-btn"
                      style={{ width: '28px', height: '28px' }}
                      title="Edit Project"
                      aria-label="Edit Project"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(project._id, project.title)}
                      className="icon-btn"
                      style={{ width: '28px', height: '28px', color: 'var(--status-danger)' }}
                      title="Delete Project"
                      aria-label="Delete Project"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Project Details Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={selectedProject?.title || 'Project Details'}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <button
              onClick={() => {
                if (selectedProject) handleDelete(selectedProject._id, selectedProject.title);
              }}
              className="btn btn-danger btn-sm"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setViewModalOpen(false)} className="btn btn-secondary btn-sm">
                Close
              </button>
              <button
                onClick={() => {
                  if (selectedProject) {
                    setViewModalOpen(false);
                    handleOpenEdit(selectedProject);
                  }
                }}
                className="btn btn-primary btn-sm"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Project
              </button>
            </div>
          </div>
        }
      >
        {selectedProject && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="badge badge-neutral">{selectedProject.category || 'Full Stack'}</span>
                {getStatusBadge(selectedProject.status)}
              </div>
              {selectedProject.featured && (
                <span className="badge badge-yellow">
                  <Star className="w-3 h-3 fill-current" /> Featured
                </span>
              )}
            </div>

            <div>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Description
              </h4>
              <p style={{ color: 'var(--text-primary)', fontSize: '0.88rem', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                {selectedProject.description}
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Technologies & Architecture
              </h4>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {selectedProject.technologies?.map((tech, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.74rem',
                      color: 'var(--text-primary)',
                      background: 'var(--bg-surface-secondary)',
                      border: '1px solid var(--border-subtle)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
              {selectedProject.githubUrl && (
                <a
                  href={selectedProject.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  <Github className="w-3.5 h-3.5" /> View Repository
                </a>
              )}
              {selectedProject.liveUrl && (
                <a
                  href={selectedProject.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary btn-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Live Application
                </a>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Add / Edit Project Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'Add Project'}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary btn-sm">
              {submitting ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">Project Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="form-input"
              placeholder="e.g. Distributed Task Queue Platform"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="form-select"
              >
                <option value="Full Stack">Full Stack</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="AI/ML">AI/ML</option>
                <option value="Mobile">Mobile</option>
                <option value="DevOps">DevOps</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="form-select"
              >
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-textarea"
              rows={3}
              placeholder="Architecture, key technical challenges solved, and outcome..."
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Technologies (comma-separated)</label>
            <input
              type="text"
              value={formData.technologies}
              onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
              className="form-input"
              placeholder="e.g. React, Node.js, MongoDB, TypeScript, Redis"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">GitHub Repository URL</label>
              <input
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                className="form-input"
                placeholder="https://github.com/username/repo"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Live Demo URL</label>
              <input
                type="url"
                value={formData.liveUrl}
                onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                className="form-input"
                placeholder="https://app.example.com"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="checkbox"
                id="featuredProj"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                style={{ cursor: 'pointer', width: '16px', height: '16px' }}
              />
              <label htmlFor="featuredProj" className="form-label" style={{ margin: 0, cursor: 'pointer', fontSize: '0.82rem' }}>
                Featured Project
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="checkbox"
                id="publicProj"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                style={{ cursor: 'pointer', width: '16px', height: '16px' }}
              />
              <label htmlFor="publicProj" className="form-label" style={{ margin: 0, cursor: 'pointer', fontSize: '0.82rem' }}>
                Publicly Visible on Portfolio
              </label>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
