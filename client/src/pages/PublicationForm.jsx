import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  ArrowLeft,
  Save,
  Send,
  Search,
  Plus,
  Trash2,
  FileText,
  AlertCircle,
  CheckCircle2,
  Upload,
  Globe,
  Quote,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PublicationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const isEditMode = !!id;
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [lookingUpDoi, setLookingUpDoi] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    publicationType: 'journal',
    academicYear: '2024-2025',
    authors: [
      {
        name: user?.name || '',
        affiliation: 'Apex Institute of Technology',
        isCorresponding: true,
        contributionRole: 'Primary Author & Research Design',
      },
    ],
    journalOrConferenceName: '',
    publisher: '',
    publicationDate: new Date().toISOString().split('T')[0],
    volume: '',
    issue: '',
    pageNumbers: '',
    doi: '',
    issnOrIsbn: '',
    indexingStatus: {
      isScopus: false,
      isWoS: false,
      isUgcCare: false,
      isPeerReviewed: true,
      quartile: 'None',
    },
    citationCount: 0,
    citationSource: 'Manual',
    publisherUrl: '',
    conferenceLocation: '',
    fundingDetails: '',
    keywords: '',
  });

  const [supportingFile, setSupportingFile] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      fetchExistingPublication();
    }
  }, [id]);

  const fetchExistingPublication = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/publications/${id}`);
      if (res.data?.success) {
        const pub = res.data.data;
        setFormData({
          title: pub.title || '',
          abstract: pub.abstract || '',
          publicationType: pub.publicationType || 'journal',
          academicYear: pub.academicYear || '2024-2025',
          authors: pub.authors?.length
            ? pub.authors
            : [{ name: '', affiliation: '', isCorresponding: false, contributionRole: '' }],
          journalOrConferenceName: pub.journalOrConferenceName || '',
          publisher: pub.publisher || '',
          publicationDate: pub.publicationDate ? pub.publicationDate.split('T')[0] : '',
          volume: pub.volume || '',
          issue: pub.issue || '',
          pageNumbers: pub.pageNumbers || '',
          doi: pub.doi || '',
          issnOrIsbn: pub.issnOrIsbn || '',
          indexingStatus: {
            isScopus: !!pub.indexingStatus?.isScopus,
            isWoS: !!pub.indexingStatus?.isWoS,
            isUgcCare: !!pub.indexingStatus?.isUgcCare,
            isPeerReviewed: pub.indexingStatus?.isPeerReviewed ?? true,
            quartile: pub.indexingStatus?.quartile || 'None',
          },
          citationCount: pub.citationCount || 0,
          citationSource: pub.citationSource || 'Manual',
          publisherUrl: pub.publisherUrl || '',
          conferenceLocation: pub.conferenceLocation || '',
          fundingDetails: pub.fundingDetails || '',
          keywords: Array.isArray(pub.keywords) ? pub.keywords.join(', ') : pub.keywords || '',
        });
      }
    } catch (err) {
      showToast('Failed to load publication record.', 'error');
      navigate('/publications');
    } finally {
      setLoading(false);
    }
  };

  // Crossref DOI Lookup integration
  const handleDoiLookup = async () => {
    if (!formData.doi.trim()) {
      showToast('Please enter a DOI string to look up metadata.', 'error');
      return;
    }
    setLookingUpDoi(true);
    try {
      const res = await api.get(`/publications/doi-lookup?doi=${encodeURIComponent(formData.doi.trim())}`);
      if (res.data?.success && res.data.metadata) {
        const meta = res.data.metadata;
        setFormData((prev) => ({
          ...prev,
          title: meta.title || prev.title,
          journalOrConferenceName: meta.journalName || prev.journalOrConferenceName,
          publisher: meta.publisher || prev.publisher,
          publicationDate: meta.publicationDate || prev.publicationDate,
          volume: meta.volume || prev.volume,
          issue: meta.issue || prev.issue,
          pageNumbers: meta.pageNumbers || prev.pageNumbers,
          issnOrIsbn: meta.issn || prev.issnOrIsbn,
          publisherUrl: meta.url || prev.publisherUrl,
          authors: meta.authors?.length
            ? meta.authors.map((a, i) => ({
                name: a.name,
                affiliation: a.affiliation || 'Department of Engineering',
                isCorresponding: i === 0,
                contributionRole: i === 0 ? 'Lead Author' : 'Co-Author',
              }))
            : prev.authors,
        }));
        showToast('Scholarly metadata retrieved from Crossref registry!', 'success');
      } else {
        showToast('No Crossref record found for this DOI. You can enter details manually.', 'info');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'External Crossref service unavailable.', 'error');
    } finally {
      setLookingUpDoi(false);
    }
  };

  // Duplicate Check
  const checkDuplicate = async (title, doi) => {
    if (!title && !doi) return;
    try {
      const res = await api.post('/publications/check-duplicate', {
        title,
        doi,
        excludeId: id,
      });
      if (res.data?.isDuplicate) {
        setDuplicateWarning(res.data.matches?.[0] || 'Similar publication already registered.');
      } else {
        setDuplicateWarning(null);
      }
    } catch (e) {}
  };

  const handleTitleBlur = () => {
    checkDuplicate(formData.title, formData.doi);
  };

  // Author List management
  const addAuthor = () => {
    setFormData((prev) => ({
      ...prev,
      authors: [
        ...prev.authors,
        { name: '', affiliation: '', isCorresponding: false, contributionRole: 'Co-Author' },
      ],
    }));
  };

  const updateAuthor = (index, field, value) => {
    const updated = [...formData.authors];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, authors: updated }));
  };

  const removeAuthor = (index) => {
    if (formData.authors.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      authors: prev.authors.filter((_, idx) => idx !== index),
    }));
  };

  const handleSubmit = async (submitForReview = false) => {
    if (!formData.title.trim()) {
      showToast('Please provide a publication title.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === 'authors' || key === 'indexingStatus') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else {
          submitData.append(key, formData[key]);
        }
      });

      if (supportingFile) {
        submitData.append('supportingDoc', supportingFile);
      }

      if (submitForReview) {
        submitData.append('verificationStatus', 'submitted');
      }

      if (isEditMode) {
        await api.put(`/publications/${id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Publication record updated successfully.', 'success');
      } else {
        const res = await api.post('/publications', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (submitForReview && res.data?.data?._id) {
          await api.post(`/publications/${res.data.data._id}/submit`);
        }
        showToast('Publication created successfully!', 'success');
      }

      navigate('/publications');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save publication.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading publication record..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/publications"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-royal-600 dark:text-royal-400 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Publications
        </Link>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {isEditMode ? 'Edit Publication Record' : 'New Publication Submission'}
        </span>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-5 mb-6">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {isEditMode ? 'Edit Research Publication' : 'Submit Research Publication'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Provide verifiable scholarly metadata, author contributions, and documentary proof for institutional appraisal.
          </p>
        </div>

        {/* Duplicate Warning Alert */}
        {duplicateWarning && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Potential Duplicate Publication Detected:</p>
              <p className="mt-0.5">
                A matching title or DOI already exists in the institutional database: "{duplicateWarning.title}". Please verify before submitting.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()} className="space-y-6 text-xs">
          {/* Section 1: Classification & DOI Lookup */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-royal-700 dark:text-royal-400">
              1. Type & DOI Autofill
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Publication Category *
                </label>
                <select
                  value={formData.publicationType}
                  onChange={(e) => setFormData({ ...formData, publicationType: e.target.value })}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                >
                  <option value="journal">Journal Article</option>
                  <option value="conference">Conference Proceeding</option>
                  <option value="book">Authored Book</option>
                  <option value="book_chapter">Book Chapter</option>
                  <option value="patent">Patent (Granted/Published)</option>
                  <option value="review_paper">Review Paper</option>
                  <option value="research_report">Research Report</option>
                  <option value="other">Other Academic Work</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Academic Session *
                </label>
                <select
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                >
                  <option value="2025-2026">2025-2026</option>
                  <option value="2024-2025">2024-2025</option>
                  <option value="2023-2024">2023-2024</option>
                  <option value="2022-2023">2022-2023</option>
                  <option value="2021-2022">2021-2022</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Digital Object Identifier (DOI)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.doi}
                    onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
                    onBlur={handleTitleBlur}
                    placeholder="10.1109/..."
                    className="flex-1 p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleDoiLookup}
                    disabled={lookingUpDoi}
                    className="px-3 bg-royal-600 hover:bg-royal-700 text-white rounded-xl font-bold flex items-center gap-1 shrink-0"
                    title="Lookup via Crossref API"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {lookingUpDoi ? 'Fetching...' : 'Lookup'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Core Details */}
          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Publication Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                onBlur={handleTitleBlur}
                placeholder="Full title of the article, paper, or monograph"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Abstract / Synopsis
              </label>
              <textarea
                rows={3}
                value={formData.abstract}
                onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                placeholder="Brief summary of the research methodology and findings..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            {/* Venue & Publisher Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Journal / Conference / Book Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.journalOrConferenceName}
                  onChange={(e) =>
                    setFormData({ ...formData, journalOrConferenceName: e.target.value })
                  }
                  placeholder="e.g. IEEE Transactions on Neural Networks"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Publisher / Issuing Body
                </label>
                <input
                  type="text"
                  value={formData.publisher}
                  onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                  placeholder="e.g. IEEE, Springer, Elsevier"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>

            {/* Date, Vol, Issue, Pages */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Publication Date
                </label>
                <input
                  type="date"
                  value={formData.publicationDate}
                  onChange={(e) =>
                    setFormData({ ...formData, publicationDate: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Volume
                </label>
                <input
                  type="text"
                  value={formData.volume}
                  onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                  placeholder="e.g. 14"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Issue / Number
                </label>
                <input
                  type="text"
                  value={formData.issue}
                  onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                  placeholder="e.g. 3"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Page Numbers
                </label>
                <input
                  type="text"
                  value={formData.pageNumbers}
                  onChange={(e) => setFormData({ ...formData, pageNumbers: e.target.value })}
                  placeholder="e.g. 102-115"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Authors & Contribution Roles */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-royal-700 dark:text-royal-400">
                  2. Author Credits & Contribution
                </h3>
                <p className="text-[11px] text-slate-500">
                  Specify all contributing co-authors and define the corresponding author.
                </p>
              </div>
              <button
                type="button"
                onClick={addAuthor}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl font-bold"
              >
                <Plus className="w-3.5 h-3.5" /> Add Author
              </button>
            </div>

            <div className="space-y-3">
              {formData.authors.map((author, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center"
                >
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Author Name</label>
                    <input
                      type="text"
                      required
                      value={author.name}
                      onChange={(e) => updateAuthor(idx, 'name', e.target.value)}
                      placeholder="e.g. Dr. Aarav Sharma"
                      className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Affiliation</label>
                    <input
                      type="text"
                      value={author.affiliation}
                      onChange={(e) => updateAuthor(idx, 'affiliation', e.target.value)}
                      placeholder="e.g. Apex Institute of Technology"
                      className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Role / Work</label>
                    <input
                      type="text"
                      value={author.contributionRole}
                      onChange={(e) => updateAuthor(idx, 'contributionRole', e.target.value)}
                      placeholder="e.g. Experimentation & Analysis"
                      className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-4">
                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={author.isCorresponding}
                        onChange={(e) => updateAuthor(idx, 'isCorresponding', e.target.checked)}
                        className="rounded text-royal-600"
                      />
                      Corr. Author
                    </label>
                    {formData.authors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAuthor(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Indexing & Citations */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-royal-700 dark:text-royal-400">
              3. Indexing & Citations Verification
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.indexingStatus.isScopus}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      indexingStatus: { ...formData.indexingStatus, isScopus: e.target.checked },
                    })
                  }
                  className="rounded text-royal-600"
                />
                Scopus Indexed
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.indexingStatus.isWoS}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      indexingStatus: { ...formData.indexingStatus, isWoS: e.target.checked },
                    })
                  }
                  className="rounded text-royal-600"
                />
                Web of Science
              </label>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Journal Quartile
                </label>
                <select
                  value={formData.indexingStatus.quartile}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      indexingStatus: { ...formData.indexingStatus, quartile: e.target.value },
                    })
                  }
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                  <option value="None">None / Unranked</option>
                  <option value="Q1">Q1 (Top 25%)</option>
                  <option value="Q2">Q2 (25% - 50%)</option>
                  <option value="Q3">Q3 (50% - 75%)</option>
                  <option value="Q4">Q4 (75% - 100%)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Recorded Citations
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.citationCount}
                  onChange={(e) =>
                    setFormData({ ...formData, citationCount: parseInt(e.target.value) || 0 })
                  }
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Supporting Evidence Document Upload */}
          <div className="space-y-2 pt-2">
            <label className="block font-semibold text-slate-700 dark:text-slate-300">
              Supporting Proof / Publication Reprint (PDF, max 10MB)
            </label>
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-royal-500 transition-colors bg-slate-50/50 dark:bg-slate-800/30">
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                {supportingFile ? (
                  <span className="font-bold text-royal-600">{supportingFile.name}</span>
                ) : (
                  'Click to browse or drag and drop paper reprint / accept letter'
                )}
              </p>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setSupportingFile(e.target.files?.[0] || null)}
                className="mt-3 text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-royal-50 file:text-royal-700 hover:file:bg-royal-100"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <Link
              to="/publications"
              className="w-full sm:w-auto px-5 py-2.5 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-center"
            >
              Cancel
            </Link>

            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit(false)}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm"
            >
              <Save className="w-4 h-4" /> Save as Draft
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit(true)}
              className="w-full sm:w-auto px-6 py-2.5 bg-royal-600 hover:bg-royal-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-royal-600/20"
            >
              <Send className="w-4 h-4" /> Submit for Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicationForm;
