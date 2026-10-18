import React, { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  ExternalLink,
  Edit2,
  Trash2,
  Calendar,
  ShieldCheck,
  Search,
  Lock,
  Globe,
  Eye,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';
import {
  getCertificatesApi,
  createCertificateApi,
  updateCertificateApi,
  deleteCertificateApi,
} from '../services/api.js';
import Modal from '../components/Modal.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Skeleton from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function CertificatesPage() {
  const { showToast } = useToast();

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'public' | 'private' | 'active'

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    credentialUrl: '',
    certificateImage: '',
    isPublic: true,
  });

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await getCertificatesApi();
      if (res.success) {
        setCertificates(res.data || []);
      }
    } catch (err) {
      showToast('Failed to load certificates from server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleOpenAdd = () => {
    setEditingCert(null);
    setFormData({
      title: '',
      issuer: '',
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      credentialId: '',
      credentialUrl: '',
      certificateImage: '',
      isPublic: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (cert) => {
    setEditingCert(cert);
    setFormData({
      title: cert.title || '',
      issuer: cert.issuer || '',
      issueDate: cert.issueDate ? new Date(cert.issueDate).toISOString().split('T')[0] : '',
      expiryDate: cert.expiryDate ? new Date(cert.expiryDate).toISOString().split('T')[0] : '',
      credentialId: cert.credentialId || '',
      credentialUrl: cert.credentialUrl || '',
      certificateImage: cert.certificateImage || '',
      isPublic: cert.isPublic !== false,
    });
    setModalOpen(true);
  };

  const handleOpenView = (cert) => {
    setSelectedCert(cert);
    setViewModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.issuer.trim() || !formData.issueDate) {
      showToast('Title, Issuing Organization, and Issue Date are required.', 'error');
      return;
    }

    if (formData.expiryDate && new Date(formData.expiryDate) < new Date(formData.issueDate)) {
      showToast('Expiry date cannot be earlier than the issue date.', 'error');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      issuer: formData.issuer.trim(),
      issueDate: new Date(formData.issueDate),
      expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : null,
      credentialId: formData.credentialId.trim(),
      credentialUrl: formData.credentialUrl.trim(),
      certificateImage: formData.certificateImage.trim(),
      isPublic: formData.isPublic,
    };

    try {
      setSubmitting(true);
      if (editingCert) {
        const res = await updateCertificateApi(editingCert._id, payload);
        if (res.success) {
          setCertificates((prev) =>
            prev.map((c) => (c._id === editingCert._id ? res.data : c))
          );
          showToast('Certificate updated successfully.', 'success');
        }
      } else {
        const res = await createCertificateApi(payload);
        if (res.success) {
          setCertificates((prev) => [res.data, ...prev]);
          showToast('Certificate added to your records.', 'success');
        }
      }
      setModalOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save certificate.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete certificate "${title}"?`)) return;

    try {
      const res = await deleteCertificateApi(id);
      if (res.success) {
        setCertificates((prev) => prev.filter((c) => c._id !== id));
        if (selectedCert?._id === id) {
          setViewModalOpen(false);
        }
        showToast('Certificate deleted.', 'info');
      }
    } catch (err) {
      showToast('Failed to delete certificate.', 'error');
    }
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const filteredCerts = certificates.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.issuer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.credentialId?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'public') return c.isPublic !== false;
    if (filter === 'private') return c.isPublic === false;
    if (filter === 'active') return !isExpired(c.expiryDate);

    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <PageHeader
        title="Certificates"
        subtitle="Keep your professional achievements organized, verified, and ready to share."
        actions={
          <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
            <Plus className="w-3.5 h-3.5" /> Add Certificate
          </button>
        }
      />

      {/* Filter & Search Toolbar */}
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
              placeholder="Search certificates, issuers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            {[
              { id: 'all', label: 'All' },
              { id: 'public', label: 'Public' },
              { id: 'private', label: 'Private' },
              { id: 'active', label: 'Active / Valid' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setFilter(item.id)}
                className={`btn btn-sm ${filter === item.id ? 'btn-secondary' : 'btn-outline'}`}
                style={{
                  fontSize: '0.78rem',
                  borderColor: filter === item.id ? 'var(--border-medium)' : 'var(--border-subtle)',
                  fontWeight: filter === item.id ? 600 : 400,
                  whiteSpace: 'nowrap',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Certificates List / Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
          <Skeleton height="160px" />
          <Skeleton height="160px" />
          <Skeleton height="160px" />
        </div>
      ) : filteredCerts.length === 0 ? (
        <EmptyState
          icon={Award}
          title={certificates.length === 0 ? 'No certificates yet' : 'No matching certificates'}
          description={
            certificates.length === 0
              ? 'Add your cloud certifications, degrees, and verified credentials to enrich your developer profile.'
              : 'Try clearing your search query or switching filters.'
          }
          action={
            certificates.length === 0 ? (
              <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
                <Plus className="w-3.5 h-3.5" /> Add Certificate
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
          {filteredCerts.map((cert) => {
            const expired = isExpired(cert.expiryDate);

            return (
              <div
                key={cert._id}
                className="card"
                style={{
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-surface-secondary)',
                          color: 'var(--accent-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <h3
                          onClick={() => handleOpenView(cert)}
                          style={{
                            fontSize: '0.96rem',
                            fontWeight: 600,
                            margin: 0,
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                          }}
                        >
                          {cert.title}
                        </h3>
                        <span style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 500 }}>
                          {cert.issuer}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      {cert.isPublic === false ? (
                        <span className="badge badge-neutral" title="Private certificate" style={{ fontSize: '0.64rem' }}>
                          <Lock className="w-2.5 h-2.5" /> Private
                        </span>
                      ) : (
                        <span className="badge badge-green" title="Publicly listed on portfolio" style={{ fontSize: '0.64rem' }}>
                          <Globe className="w-2.5 h-2.5" /> Public
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar className="w-3 h-3 text-muted" />
                      <span>
                        Issued: {new Date(cert.issueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                      </span>
                      {cert.expiryDate && (
                        <span>
                          · {expired ? <strong style={{ color: 'var(--status-danger)' }}>Expired</strong> : `Expires: ${new Date(cert.expiryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}`}
                        </span>
                      )}
                    </div>

                    {cert.credentialId && (
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        ID: <code>{cert.credentialId}</code>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '10px',
                    marginTop: '14px',
                  }}
                >
                  <div>
                    {cert.credentialUrl ? (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline btn-sm"
                        style={{ padding: '3px 8px', fontSize: '0.74rem' }}
                      >
                        <ExternalLink className="w-3 h-3" /> Verify Link
                      </a>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Verified Record</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => handleOpenView(cert)}
                      className="icon-btn"
                      style={{ width: '28px', height: '28px' }}
                      title="View Details"
                      aria-label="View Details"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(cert)}
                      className="icon-btn"
                      style={{ width: '28px', height: '28px' }}
                      title="Edit Certificate"
                      aria-label="Edit Certificate"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(cert._id, cert.title)}
                      className="icon-btn"
                      style={{ width: '28px', height: '28px', color: 'var(--status-danger)' }}
                      title="Delete Certificate"
                      aria-label="Delete Certificate"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Certificate Details Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={selectedCert?.title || 'Certificate Details'}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <button
              onClick={() => {
                if (selectedCert) handleDelete(selectedCert._id, selectedCert.title);
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
                  if (selectedCert) {
                    setViewModalOpen(false);
                    handleOpenEdit(selectedCert);
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
        {selectedCert && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 2px', color: 'var(--text-primary)' }}>
                  {selectedCert.title}
                </h4>
                <span style={{ color: 'var(--accent-primary)', fontSize: '0.86rem', fontWeight: 500 }}>
                  {selectedCert.issuer}
                </span>
              </div>
              <span className={`badge ${selectedCert.isPublic !== false ? 'badge-green' : 'badge-neutral'}`}>
                {selectedCert.isPublic !== false ? 'Public on Portfolio' : 'Private'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Issue Date:</span>
                <span style={{ fontWeight: 500 }}>
                  {new Date(selectedCert.issueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>

              {selectedCert.expiryDate && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Expiration:</span>
                  <span style={{ fontWeight: 500, color: isExpired(selectedCert.expiryDate) ? 'var(--status-danger)' : 'inherit' }}>
                    {new Date(selectedCert.expiryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    {isExpired(selectedCert.expiryDate) && ' (Expired)'}
                  </span>
                </div>
              )}

              {selectedCert.credentialId && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Credential ID:</span>
                  <code>{selectedCert.credentialId}</code>
                </div>
              )}
            </div>

            {selectedCert.credentialUrl && (
              <div style={{ marginTop: '6px' }}>
                <a
                  href={selectedCert.credentialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Verify Credential on {selectedCert.issuer}
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add / Edit Certificate Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCert ? 'Edit Certificate' : 'Add Certificate'}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary btn-sm">
              {submitting ? 'Saving...' : editingCert ? 'Update Certificate' : 'Save Certificate'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">Certificate Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="form-input"
              placeholder="e.g. AWS Certified Solutions Architect"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Issuing Organization *</label>
            <input
              type="text"
              value={formData.issuer}
              onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
              className="form-input"
              placeholder="e.g. Amazon Web Services, Google, MongoDB"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Issue Date *</label>
              <input
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Expiration Date (Optional)</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Credential ID (Optional)</label>
            <input
              type="text"
              value={formData.credentialId}
              onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
              className="form-input"
              placeholder="e.g. AWS-ASA-849201"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Credential Verification URL</label>
            <input
              type="url"
              value={formData.credentialUrl}
              onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
              className="form-input"
              placeholder="https://www.credly.com/badges/..."
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <input
              type="checkbox"
              id="certPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              style={{ cursor: 'pointer', width: '16px', height: '16px' }}
            />
            <label htmlFor="certPublic" className="form-label" style={{ margin: 0, cursor: 'pointer', fontSize: '0.82rem' }}>
              Publicly visible on my developer portfolio
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
}
