import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';
import {
  getSkillsApi,
  createSkillApi,
  updateSkillApi,
  deleteSkillApi,
} from '../services/api.js';
import Modal from '../components/Modal.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Skeleton from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function SkillsPage() {
  const { showToast } = useToast();

  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Programming',
    proficiency: 'Advanced',
    yearsOfExperience: 3,
    verified: true,
  });

  const categories = [
    { id: 'All', label: 'All' },
    { id: 'Programming', label: 'Languages' },
    { id: 'Frontend', label: 'Frontend' },
    { id: 'Backend', label: 'Backend' },
    { id: 'Database', label: 'Databases' },
    { id: 'DevOps', label: 'DevOps' },
    { id: 'Cloud', label: 'Cloud' },
    { id: 'AI/ML', label: 'AI/ML' },
    { id: 'Tools', label: 'Tools' },
  ];

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const res = await getSkillsApi();
      if (res.success) {
        setSkills(res.data || []);
      }
    } catch (err) {
      showToast('Failed to load skills matrix.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleOpenAdd = () => {
    setEditingSkill(null);
    setFormData({
      name: '',
      category: 'Programming',
      proficiency: 'Advanced',
      yearsOfExperience: 3,
      verified: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name || '',
      category: skill.category || 'Programming',
      proficiency: skill.proficiency || 'Intermediate',
      yearsOfExperience: skill.yearsOfExperience || 1,
      verified: Boolean(skill.verified),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Skill name is required.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      if (editingSkill) {
        const res = await updateSkillApi(editingSkill._id, formData);
        if (res.success) {
          setSkills((prev) =>
            prev.map((s) => (s._id === editingSkill._id ? res.data : s))
          );
          showToast('Skill updated successfully.', 'success');
        }
      } else {
        const res = await createSkillApi(formData);
        if (res.success) {
          setSkills((prev) => [res.data, ...prev]);
          showToast('Skill added to matrix.', 'success');
        }
      }
      setModalOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save skill.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete skill "${name}"?`)) return;

    try {
      const res = await deleteSkillApi(id);
      if (res.success) {
        setSkills((prev) => prev.filter((s) => s._id !== id));
        showToast('Skill removed.', 'info');
      }
    } catch (err) {
      showToast('Failed to delete skill.', 'error');
    }
  };

  const getProficiencyPercentage = (level) => {
    switch (level) {
      case 'Beginner':
        return 30;
      case 'Intermediate':
        return 60;
      case 'Advanced':
        return 85;
      case 'Expert':
        return 100;
      default:
        return 50;
    }
  };

  const filteredSkills = skills.filter((s) => {
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <PageHeader
        title="Skills Matrix"
        subtitle="Organize, categorize, and showcase your verified technical proficiencies."
        actions={
          <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
            <Plus className="w-3.5 h-3.5" /> Add Skill
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
          <div className="topbar-search" style={{ maxWidth: '260px' }}>
            <Search className="w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px' }}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`btn btn-sm ${selectedCategory === cat.id ? 'btn-secondary' : 'btn-outline'}`}
                style={{
                  fontSize: '0.78rem',
                  borderColor: selectedCategory === cat.id ? 'var(--border-medium)' : 'var(--border-subtle)',
                  fontWeight: selectedCategory === cat.id ? 600 : 400,
                  whiteSpace: 'nowrap',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
          <Skeleton height="100px" />
          <Skeleton height="100px" />
          <Skeleton height="100px" />
        </div>
      ) : filteredSkills.length === 0 ? (
        <EmptyState
          icon={Cpu}
          title={skills.length === 0 ? 'No skills mapped yet' : 'No skills match your filter'}
          description={
            skills.length === 0
              ? 'Add your programming languages, frameworks, databases, and cloud tools to build a comprehensive matrix.'
              : 'Try selecting another category or clearing your search term.'
          }
          action={
            skills.length === 0 ? (
              <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
                <Plus className="w-3.5 h-3.5" /> Add Skill
              </button>
            ) : null
          }
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '12px',
          }}
        >
          {filteredSkills.map((skill) => {
            const pct = getProficiencyPercentage(skill.proficiency);
            return (
              <div
                key={skill._id}
                className="card"
                style={{
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h3 style={{ fontSize: '0.94rem', margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {skill.name}
                      </h3>
                      {skill.verified && (
                        <span title="Verified Proficiency" style={{ color: 'var(--status-success)', display: 'flex' }}>
                          <CheckCircle2 className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>
                      {skill.category}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    <span>{skill.proficiency}</span>
                    <span>{skill.yearsOfExperience} yrs exp</span>
                  </div>

                  <div className="progress-container" style={{ marginBottom: '12px', height: '4px' }}>
                    <div className="progress-fill" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '4px',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '8px',
                  }}
                >
                  <button
                    onClick={() => handleOpenEdit(skill)}
                    className="icon-btn"
                    style={{ width: '26px', height: '26px' }}
                    title="Edit Skill"
                    aria-label="Edit Skill"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(skill._id, skill.name)}
                    className="icon-btn"
                    style={{ width: '26px', height: '26px', color: 'var(--status-danger)' }}
                    title="Delete Skill"
                    aria-label="Delete Skill"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Skill Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSkill ? 'Edit Technical Skill' : 'Add Technical Skill'}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary btn-sm">
              {submitting ? 'Saving...' : editingSkill ? 'Update Skill' : 'Add Skill'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">Skill Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-input"
              placeholder="e.g. React.js, TypeScript, PostgreSQL, Docker"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="form-select"
            >
              <option value="Programming">Programming Languages</option>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Database">Databases</option>
              <option value="DevOps">DevOps</option>
              <option value="Cloud">Cloud</option>
              <option value="AI/ML">AI / Machine Learning</option>
              <option value="Tools">Tools</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Proficiency Level</label>
              <select
                value={formData.proficiency}
                onChange={(e) => setFormData({ ...formData, proficiency: e.target.value })}
                className="form-select"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Years of Experience</label>
              <input
                type="number"
                min="0"
                max="40"
                value={formData.yearsOfExperience}
                onChange={(e) => setFormData({ ...formData, yearsOfExperience: Number(e.target.value) })}
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
            <input
              type="checkbox"
              id="verifiedSkill"
              checked={formData.verified}
              onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
              style={{ cursor: 'pointer', width: '16px', height: '16px' }}
            />
            <label htmlFor="verifiedSkill" className="form-label" style={{ margin: 0, cursor: 'pointer', fontSize: '0.82rem' }}>
              Mark as Verified Proficiency
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
}
