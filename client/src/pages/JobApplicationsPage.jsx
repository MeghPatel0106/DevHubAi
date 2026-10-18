import React, { useState, useEffect } from 'react';
import {
  Send,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Building,
  DollarSign,
  ExternalLink,
  MapPin,
  Search,
  LayoutGrid,
  List,
  Clock,
  CheckCircle2,
  XCircle,
  Briefcase,
  UserCheck,
  Mail,
  Eye,
  AlertCircle,
  Filter,
  ArrowUpDown,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';
import {
  getJobApplicationsApi,
  createJobApplicationApi,
  updateJobApplicationApi,
  updateJobApplicationStatusApi,
  deleteJobApplicationApi,
} from '../services/api.js';
import Modal from '../components/Modal.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Skeleton from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';

const PIPELINE_STATUSES = [
  { id: 'Wishlist', label: 'Wishlist', color: 'var(--text-secondary)', bg: 'var(--bg-surface-secondary)' },
  { id: 'Applied', label: 'Applied', color: 'var(--accent-primary)', bg: 'var(--accent-subtle)' },
  { id: 'Screening', label: 'Screening', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
  { id: 'Interview', label: 'Interview', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  { id: 'Offer', label: 'Offer', color: 'var(--status-success)', bg: 'rgba(16, 185, 129, 0.1)' },
  { id: 'Rejected', label: 'Rejected', color: 'var(--status-danger)', bg: 'rgba(239, 68, 68, 0.1)' },
  { id: 'Withdrawn', label: 'Withdrawn', color: 'var(--text-muted)', bg: 'var(--bg-surface-secondary)' },
];

export default function JobApplicationsPage() {
  const { showToast } = useToast();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('board'); // 'board' | 'list'

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [workModeFilter, setWorkModeFilter] = useState('All');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    company: '',
    jobTitle: '',
    jobUrl: '',
    location: '',
    workMode: 'Remote',
    employmentType: 'Full-time',
    status: 'Applied',
    appliedDate: '',
    deadline: '',
    interviewDate: '',
    salary: '',
    contactPerson: '',
    contactEmail: '',
    source: '',
    notes: '',
  });

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await getJobApplicationsApi({
        status: statusFilter,
        workMode: workModeFilter,
        employmentType: employmentTypeFilter,
        search: searchQuery,
        sortBy: sortBy,
      });
      if (res.success) {
        setApplications(res.data || []);
      }
    } catch (err) {
      showToast('Failed to load job applications.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, workModeFilter, employmentTypeFilter, sortBy]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchApplications();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleOpenAdd = (defaultStatus = 'Applied') => {
    setEditingApp(null);
    setFormData({
      company: '',
      jobTitle: '',
      jobUrl: '',
      location: '',
      workMode: 'Remote',
      employmentType: 'Full-time',
      status: defaultStatus,
      appliedDate: new Date().toISOString().split('T')[0],
      deadline: '',
      interviewDate: '',
      salary: '',
      contactPerson: '',
      contactEmail: '',
      source: '',
      notes: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (app) => {
    setEditingApp(app);
    setFormData({
      company: app.company || '',
      jobTitle: app.jobTitle || app.position || '',
      jobUrl: app.jobUrl || '',
      location: app.location || '',
      workMode: app.workMode || 'Remote',
      employmentType: app.employmentType || 'Full-time',
      status: app.status || 'Applied',
      appliedDate: app.appliedDate ? new Date(app.appliedDate).toISOString().split('T')[0] : '',
      deadline: app.deadline ? new Date(app.deadline).toISOString().split('T')[0] : '',
      interviewDate: app.interviewDate ? new Date(app.interviewDate).toISOString().split('T')[0] : '',
      salary: app.salary || '',
      contactPerson: app.contactPerson || '',
      contactEmail: app.contactEmail || '',
      source: app.source || '',
      notes: app.notes || '',
    });
    setModalOpen(true);
  };

  const handleOpenDetails = (app) => {
    setSelectedApp(app);
    setDetailsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company.trim() || !formData.jobTitle.trim()) {
      showToast('Company name and job title are required.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      if (editingApp) {
        const res = await updateJobApplicationApi(editingApp._id, formData);
        if (res.success) {
          setApplications((prev) =>
            prev.map((a) => (a._id === editingApp._id ? res.data : a))
          );
          if (selectedApp?._id === editingApp._id) {
            setSelectedApp(res.data);
          }
          showToast('Job application updated.', 'success');
        }
      } else {
        const res = await createJobApplicationApi(formData);
        if (res.success) {
          setApplications((prev) => [res.data, ...prev]);
          showToast('Job application tracked successfully.', 'success');
        }
      }
      setModalOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save application.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (appId, newStatus) => {
    try {
      const res = await updateJobApplicationStatusApi(appId, newStatus);
      if (res.success) {
        setApplications((prev) =>
          prev.map((a) => (a._id === appId ? res.data : a))
        );
        if (selectedApp?._id === appId) {
          setSelectedApp(res.data);
        }
        showToast(`Moved to ${newStatus}.`, 'success');
      }
    } catch (err) {
      showToast('Failed to update status.', 'error');
    }
  };

  const handleDelete = async (id, company) => {
    if (!window.confirm(`Delete application for ${company}?`)) return;

    try {
      const res = await deleteJobApplicationApi(id);
      if (res.success) {
        setApplications((prev) => prev.filter((a) => a._id !== id));
        if (selectedApp?._id === id) {
          setDetailsModalOpen(false);
        }
        showToast('Application deleted.', 'info');
      }
    } catch (err) {
      showToast('Failed to delete application.', 'error');
    }
  };

  // Metrics computation from real application records
  const totalCount = applications.length;
  const appliedCount = applications.filter((a) => a.status === 'Applied').length;
  const interviewCount = applications.filter((a) => ['Screening', 'Interview'].includes(a.status)).length;
  const offerCount = applications.filter((a) => a.status === 'Offer').length;
  const rejectedCount = applications.filter((a) => a.status === 'Rejected').length;

  const getStatusBadge = (status) => {
    const config = PIPELINE_STATUSES.find((s) => s.id === status) || {
      label: status,
      color: 'var(--text-secondary)',
      bg: 'var(--bg-surface-secondary)',
    };
    return (
      <span
        style={{
          fontSize: '0.72rem',
          fontWeight: 600,
          color: config.color,
          background: config.bg,
          padding: '2px 8px',
          borderRadius: 'var(--radius-sm)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <PageHeader
        title="Job Applications"
        subtitle="Track your applications, interviews and career opportunities."
        actions={
          <button onClick={() => handleOpenAdd()} className="btn btn-primary btn-sm">
            <Plus className="w-3.5 h-3.5" /> Add Application
          </button>
        }
      />

      {/* Real Metrics Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px',
        }}
      >
        {[
          { label: 'Total Tracked', count: totalCount, icon: Send, color: 'var(--text-primary)' },
          { label: 'Applied', count: appliedCount, icon: Briefcase, color: 'var(--accent-primary)' },
          { label: 'Interviews', count: interviewCount, icon: UserCheck, color: '#f59e0b' },
          { label: 'Offers', count: offerCount, icon: CheckCircle2, color: 'var(--status-success)' },
          { label: 'Rejected', count: rejectedCount, icon: XCircle, color: 'var(--status-danger)' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="card"
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: item.color, marginTop: '2px' }}>
                  {loading ? '—' : item.count}
                </div>
              </div>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: item.color,
                }}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Search, Filter & View Controls */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px', flexWrap: 'wrap' }}>
          {/* Search */}
          <div className="topbar-search" style={{ maxWidth: '240px' }}>
            <Search className="w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search company, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Work Mode Filter */}
          <select
            value={workModeFilter}
            onChange={(e) => setWorkModeFilter(e.target.value)}
            className="form-input"
            style={{ width: 'auto', padding: '6px 10px', fontSize: '0.78rem' }}
          >
            <option value="All">All Work Modes</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>

          {/* Employment Type Filter */}
          <select
            value={employmentTypeFilter}
            onChange={(e) => setEmploymentTypeFilter(e.target.value)}
            className="form-input"
            style={{ width: 'auto', padding: '6px 10px', fontSize: '0.78rem' }}
          >
            <option value="All">All Job Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="form-input"
            style={{ width: 'auto', padding: '6px 10px', fontSize: '0.78rem' }}
          >
            <option value="newest">Sort: Newest Applied</option>
            <option value="oldest">Sort: Oldest Applied</option>
            <option value="interviewDate">Sort: Interview Date</option>
            <option value="company">Sort: Company (A-Z)</option>
            <option value="status">Sort: Status</option>
          </select>
        </div>

        {/* View Switcher: Board vs List */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-surface-secondary)', padding: '3px', borderRadius: 'var(--radius-md)' }}>
          <button
            onClick={() => setViewMode('board')}
            className={`btn btn-sm ${viewMode === 'board' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '4px 8px', fontSize: '0.76rem', border: 'none' }}
            title="Kanban Board View"
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Board
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '4px 8px', fontSize: '0.76rem', border: 'none' }}
            title="List View"
          >
            <List className="w-3.5 h-3.5" /> List
          </button>
        </div>
      </div>

      {/* Status Tabs on mobile/tablet or when filtering */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '4px',
        }}
      >
        {[{ id: 'All', label: `All (${totalCount})` }, ...PIPELINE_STATUSES.map((s) => ({
          id: s.id,
          label: `${s.label} (${applications.filter((a) => (s.id === 'Wishlist' ? ['Wishlist', 'Saved'].includes(a.status) : a.status === s.id)).length})`,
        }))].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`btn btn-sm ${statusFilter === tab.id ? 'btn-secondary' : 'btn-outline'}`}
            style={{
              fontSize: '0.76rem',
              whiteSpace: 'nowrap',
              fontWeight: statusFilter === tab.id ? 600 : 400,
              borderColor: statusFilter === tab.id ? 'var(--border-medium)' : 'var(--border-subtle)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area: Board View vs List View */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          <Skeleton height="200px" />
          <Skeleton height="200px" />
          <Skeleton height="200px" />
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={Send}
          title={statusFilter === 'All' && !searchQuery ? 'No applications tracked yet' : 'No matching applications'}
          description={
            statusFilter === 'All' && !searchQuery
              ? 'Start tracking your software engineering job applications, interview timelines, and recruiter offers in one place.'
              : 'Try clearing your search query or switching filters.'
          }
          action={
            <button onClick={() => handleOpenAdd()} className="btn btn-primary btn-sm">
              <Plus className="w-3.5 h-3.5" /> Add Application
            </button>
          }
        />
      ) : viewMode === 'board' ? (
        /* Board (Kanban) View */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '14px',
            alignItems: 'start',
          }}
        >
          {PIPELINE_STATUSES.filter((s) => statusFilter === 'All' || statusFilter === s.id || (statusFilter === 'Wishlist' && s.id === 'Wishlist')).map((column) => {
            const columnApps = applications.filter((a) =>
              column.id === 'Wishlist' ? ['Wishlist', 'Saved'].includes(a.status) : a.status === column.id
            );

            return (
              <div
                key={column.id}
                style={{
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  minHeight: '260px',
                }}
              >
                {/* Column Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: column.color,
                      }}
                    />
                    <span style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                      {column.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="badge badge-neutral" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                      {columnApps.length}
                    </span>
                    <button
                      onClick={() => handleOpenAdd(column.id)}
                      className="icon-btn"
                      style={{ width: '22px', height: '22px' }}
                      title={`Add to ${column.label}`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Column Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {columnApps.length === 0 ? (
                    <div style={{ padding: '24px 10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.76rem', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                      No {column.label.toLowerCase()} applications
                    </div>
                  ) : (
                    columnApps.map((app) => (
                      <div
                        key={app._id}
                        className="card card-interactive"
                        onClick={() => handleOpenDetails(app)}
                        style={{
                          padding: '12px 14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h4 style={{ fontSize: '0.88rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                            {app.company}
                          </h4>
                          <span className="badge badge-neutral" style={{ fontSize: '0.64rem' }}>
                            {app.workMode || 'Remote'}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 500 }}>
                          {app.jobTitle || app.position}
                        </div>

                        {app.location && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin className="w-3 h-3 text-muted" /> {app.location}
                          </div>
                        )}

                        {app.interviewDate && (
                          <div
                            style={{
                              fontSize: '0.72rem',
                              color: '#f59e0b',
                              background: 'rgba(245, 158, 11, 0.08)',
                              padding: '2px 6px',
                              borderRadius: 'var(--radius-sm)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontWeight: 500,
                            }}
                          >
                            <Calendar className="w-3 h-3" /> Interview: {new Date(app.interviewDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                        )}

                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderTop: '1px solid var(--border-subtle)',
                            paddingTop: '6px',
                            marginTop: '4px',
                            fontSize: '0.7rem',
                            color: 'var(--text-muted)',
                          }}
                        >
                          <span>
                            {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Saved'}
                          </span>

                          <div style={{ display: 'flex', gap: '2px' }} onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleOpenEdit(app)}
                              className="icon-btn"
                              style={{ width: '22px', height: '22px' }}
                              title="Edit"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(app._id, app.company)}
                              className="icon-btn"
                              style={{ width: '22px', height: '22px', color: 'var(--status-danger)' }}
                              title="Delete"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Company & Role</th>
                  <th style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Location / Mode</th>
                  <th style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                  <th style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Applied Date</th>
                  <th style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Interview</th>
                  <th style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr
                    key={app._id}
                    onClick={() => handleOpenDetails(app)}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                    }}
                    className="table-row-hover"
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{app.company}</div>
                      <div style={{ color: 'var(--accent-primary)', fontSize: '0.78rem' }}>
                        {app.jobTitle || app.position}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      <div>{app.location || 'Not specified'}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{app.workMode || 'Remote'} · {app.employmentType || 'Full-time'}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {getStatusBadge(app.status)}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {app.interviewDate ? (
                        <span style={{ color: '#f59e0b', fontWeight: 500, fontSize: '0.78rem' }}>
                          {new Date(app.interviewDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        <button
                          onClick={() => handleOpenDetails(app)}
                          className="icon-btn"
                          style={{ width: '28px', height: '28px' }}
                          title="View Details"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(app)}
                          className="icon-btn"
                          style={{ width: '28px', height: '28px' }}
                          title="Edit"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(app._id, app.company)}
                          className="icon-btn"
                          style={{ width: '28px', height: '28px', color: 'var(--status-danger)' }}
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Application Details Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={selectedApp?.company ? `${selectedApp.company} — Application Details` : 'Application Details'}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <button
              onClick={() => {
                if (selectedApp) handleDelete(selectedApp._id, selectedApp.company);
              }}
              className="btn btn-danger btn-sm"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setDetailsModalOpen(false)} className="btn btn-secondary btn-sm">
                Close
              </button>
              <button
                onClick={() => {
                  if (selectedApp) {
                    setDetailsModalOpen(false);
                    handleOpenEdit(selectedApp);
                  }
                }}
                className="btn btn-primary btn-sm"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
          </div>
        }
      >
        {selectedApp && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 2px', color: 'var(--text-primary)' }}>
                  {selectedApp.company}
                </h3>
                <div style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: 500 }}>
                  {selectedApp.jobTitle || selectedApp.position}
                </div>
              </div>

              {/* Quick Status Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Status:</span>
                <select
                  value={selectedApp.status}
                  onChange={(e) => handleQuickStatusChange(selectedApp._id, e.target.value)}
                  className="form-input"
                  style={{ width: 'auto', padding: '4px 8px', fontSize: '0.78rem', fontWeight: 600 }}
                >
                  {PIPELINE_STATUSES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '14px', background: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.74rem' }}>Work Mode & Type:</span>
                <span style={{ fontWeight: 500 }}>{selectedApp.workMode || 'Remote'} · {selectedApp.employmentType || 'Full-time'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.74rem' }}>Location:</span>
                <span style={{ fontWeight: 500 }}>{selectedApp.location || 'Not specified'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.74rem' }}>Applied Date:</span>
                <span style={{ fontWeight: 500 }}>
                  {selectedApp.appliedDate ? new Date(selectedApp.appliedDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.74rem' }}>Interview Date:</span>
                <span style={{ fontWeight: 500, color: selectedApp.interviewDate ? '#f59e0b' : 'inherit' }}>
                  {selectedApp.interviewDate ? new Date(selectedApp.interviewDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'None scheduled'}
                </span>
              </div>
              {selectedApp.salary && (
                <div>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.74rem' }}>Salary / Compensation:</span>
                  <span style={{ fontWeight: 500 }}>{selectedApp.salary}</span>
                </div>
              )}
              {selectedApp.source && (
                <div>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.74rem' }}>Source:</span>
                  <span style={{ fontWeight: 500 }}>{selectedApp.source}</span>
                </div>
              )}
            </div>

            {(selectedApp.contactPerson || selectedApp.contactEmail) && (
              <div style={{ padding: '12px', background: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Recruiter / Contact Person:</div>
                <div style={{ color: 'var(--text-secondary)' }}>
                  {selectedApp.contactPerson} {selectedApp.contactEmail && `(${selectedApp.contactEmail})`}
                </div>
              </div>
            )}

            {selectedApp.notes && (
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Notes & Interview Prep:</div>
                <div style={{ padding: '10px 12px', background: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                  {selectedApp.notes}
                </div>
              </div>
            )}

            {selectedApp.jobUrl && (
              <div>
                <a
                  href={selectedApp.jobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View Original Job Posting
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add / Edit Application Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingApp ? 'Edit Job Application' : 'Add Job Application'}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary btn-sm">
              {submitting ? 'Saving...' : editingApp ? 'Update Application' : 'Save Application'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Company Name *</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="form-input"
                placeholder="e.g. Google, Stripe, Linear"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Job Title / Role *</label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className="form-input"
                placeholder="e.g. Senior Full Stack Engineer"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Work Mode</label>
              <select
                value={formData.workMode}
                onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                className="form-input"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Job Type</label>
              <select
                value={formData.employmentType}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                className="form-input"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Application Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="form-input"
              >
                {PIPELINE_STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Applied Date</label>
              <input
                type="date"
                value={formData.appliedDate}
                onChange={(e) => setFormData({ ...formData, appliedDate: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Interview Date (Optional)</label>
              <input
                type="date"
                value={formData.interviewDate}
                onChange={(e) => setFormData({ ...formData, interviewDate: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Deadline (Optional)</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="form-input"
                placeholder="e.g. San Francisco, CA or Remote"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Salary / Compensation</label>
              <input
                type="text"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="form-input"
                placeholder="e.g. $140,000 - $160,000"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Job Posting URL</label>
            <input
              type="url"
              value={formData.jobUrl}
              onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
              className="form-input"
              placeholder="https://jobs.lever.co/..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Recruiter / Contact Name</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="form-input"
                placeholder="e.g. Sarah Connor"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="form-input"
                placeholder="sarah@company.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Source</label>
            <input
              type="text"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className="form-input"
              placeholder="e.g. LinkedIn, Referral, Careers Page, Wellfound"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes & Interview Insights</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="form-input"
              placeholder="Key notes, talking points, salary expectations, tech stack questions..."
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
