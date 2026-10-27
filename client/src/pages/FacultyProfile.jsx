import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  GraduationCap,
  Calendar,
  Globe,
  ExternalLink,
  Edit3,
  Camera,
  CheckCircle,
  AlertCircle,
  Clock,
  BookOpen,
  Award,
  Layers,
  History,
  X,
  Plus,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const FacultyProfile = () => {
  const { id } = useParams();
  const { user: currentUser, updateProfileState } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState({});
  const [interestInput, setInterestInput] = useState('');

  const isOwner = !id || id === currentUser?._id;
  const canEdit = isOwner || currentUser?.role === 'admin';

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const targetId = id || currentUser?._id;
      const res = await api.get(`/faculty/${targetId}`);
      if (res.data?.success) {
        setProfile(res.data.data);
        setFormData({
          fullName: res.data.data.fullName || '',
          phoneNumber: res.data.data.phoneNumber || '',
          designation: res.data.data.designation || '',
          highestQualification: res.data.data.highestQualification || 'Ph.D.',
          specialization: res.data.data.specialization || '',
          employmentStatus: res.data.data.employmentStatus || 'Regular',
          biography: res.data.data.biography || '',
          orcidId: res.data.data.orcidId || '',
          googleScholarUrl: res.data.data.googleScholarUrl || '',
          scopusId: res.data.data.scopusId || '',
          researchGateUrl: res.data.data.researchGateUrl || '',
          linkedInUrl: res.data.data.linkedInUrl || '',
          researchInterests: res.data.data.researchInterests || [],
          experience: res.data.data.experience || [],
          coursesTaught: res.data.data.coursesTaught || [],
        });
      }
    } catch (err) {
      showToast('Failed to load faculty profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file (JPG, PNG).', 'error');
      return;
    }

    const targetId = id || currentUser?._id;
    const uploadForm = new FormData();
    uploadForm.append('photo', file);

    setUploadingPhoto(true);
    try {
      const res = await api.post(`/faculty/${targetId}/photo`, uploadForm, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success) {
        setProfile((prev) => ({
          ...prev,
          profilePhotoUrl: res.data.profilePhotoUrl,
        }));
        if (isOwner) {
          updateProfileState({ ...profile, profilePhotoUrl: res.data.profilePhotoUrl });
        }
        showToast('Profile photo updated successfully!', 'success');
      }
    } catch (err) {
      showToast('Failed to upload photo.', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const targetId = id || currentUser?._id;

    try {
      const res = await api.put(`/faculty/${targetId}`, formData);
      if (res.data?.success) {
        setProfile(res.data.data);
        if (isOwner) updateProfileState(res.data.data);
        setIsEditing(false);
        showToast('Faculty profile updated successfully!', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    }
  };

  const addInterest = () => {
    if (interestInput.trim() && !formData.researchInterests?.includes(interestInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        researchInterests: [...(prev.researchInterests || []), interestInput.trim()],
      }));
      setInterestInput('');
    }
  };

  const removeInterest = (item) => {
    setFormData((prev) => ({
      ...prev,
      researchInterests: prev.researchInterests.filter((i) => i !== item),
    }));
  };

  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experience: [
        ...(prev.experience || []),
        { title: '', organization: '', startYear: '', endYear: '', isCurrent: false },
      ],
    }));
  };

  const removeExperience = (index) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, idx) => idx !== index),
    }));
  };

  const addCourse = () => {
    setFormData((prev) => ({
      ...prev,
      coursesTaught: [
        ...(prev.coursesTaught || []),
        { courseCode: '', courseName: '', academicYear: '2024-2025', level: 'Undergraduate' },
      ],
    }));
  };

  const removeCourse = (index) => {
    setFormData((prev) => ({
      ...prev,
      coursesTaught: prev.coursesTaught.filter((_, idx) => idx !== index),
    }));
  };

  if (loading) {
    return <LoadingSpinner text="Loading faculty profile..." />;
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Faculty record not found.</p>
        <Link to="/" className="text-royal-600 font-semibold mt-2 inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header Banner */}
      <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-royal-800 via-royal-700 to-primary-900"></div>

        <div className="px-6 pb-6 pt-0 sm:flex sm:items-end sm:justify-between -mt-16 sm:-mt-12 gap-6 relative">
          <div className="sm:flex sm:items-end gap-5">
            {/* Avatar with Upload button */}
            <div className="relative inline-block">
              <div className="w-28 h-28 rounded-2xl bg-white dark:bg-slate-900 p-1.5 shadow-xl">
                <div className="w-full h-full rounded-xl bg-royal-600 text-white flex items-center justify-center text-3xl font-black overflow-hidden ring-2 ring-white dark:ring-slate-800">
                  {profile.profilePhotoUrl ? (
                    <img
                      src={profile.profilePhotoUrl}
                      alt={profile.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    profile.fullName?.substring(0, 2).toUpperCase() || 'FA'
                  )}
                </div>
              </div>
              {canEdit && (
                <label className="absolute bottom-1 right-1 p-2 bg-royal-600 hover:bg-royal-700 text-white rounded-xl shadow-md cursor-pointer transition-transform hover:scale-105">
                  <Camera className="w-3.5 h-3.5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhoto}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Basic Info */}
            <div className="mt-3 sm:mt-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {profile.fullName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-royal-100 text-royal-700 dark:bg-royal-950/60 dark:text-royal-300">
                  {profile.facultyId}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {profile.employmentStatus || 'Regular'}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-royal-700 dark:text-royal-400 mt-1">
                {profile.designation} • {profile.department?.name || 'Department'}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {profile.officialEmail}
                </span>
                {profile.phoneNumber && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {profile.phoneNumber}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  {profile.highestQualification}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons & Profile Completion */}
          <div className="mt-4 sm:mt-0 flex flex-col items-start sm:items-end gap-3 shrink-0">
            {canEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-royal-600 hover:bg-royal-700 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            )}

            {/* Profile Completion Bar */}
            <div className="w-48 bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                <span>Profile Completion</span>
                <span className="text-royal-600 dark:text-royal-400">{profile.completionPercentage || 0}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-royal-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${profile.completionPercentage || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-t border-slate-100 dark:border-slate-800 flex gap-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-royal-600 text-royal-600 dark:text-royal-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Overview & Research
          </button>
          <button
            onClick={() => setActiveTab('experience')}
            className={`py-3.5 border-b-2 transition-colors ${
              activeTab === 'experience'
                ? 'border-royal-600 text-royal-600 dark:text-royal-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Teaching & Experience
          </button>
          {canEdit && profile.auditTrail?.length > 0 && (
            <button
              onClick={() => setActiveTab('audit')}
              className={`py-3.5 border-b-2 transition-colors ${
                activeTab === 'audit'
                  ? 'border-royal-600 text-royal-600 dark:text-royal-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Profile Audit Trail
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Overview & Research */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Academic IDs & Specialization */}
          <div className="space-y-6">
            {/* Academic Scholarly IDs */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Scholarly Author Identifiers
              </h3>

              <div className="space-y-3 text-xs">
                {/* ORCID */}
                <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">ORCID iD</span>
                  {profile.orcidId ? (
                    <a
                      href={`https://orcid.org/${profile.orcidId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-royal-600 dark:text-royal-400 hover:underline flex items-center gap-1"
                    >
                      {profile.orcidId} <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Not configured</span>
                  )}
                </div>

                {/* Scopus Author ID */}
                <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Scopus ID</span>
                  {profile.scopusId ? (
                    <span className="font-mono text-slate-800 dark:text-slate-200">{profile.scopusId}</span>
                  ) : (
                    <span className="text-slate-400 italic">Not configured</span>
                  )}
                </div>

                {/* Google Scholar */}
                <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Google Scholar</span>
                  {profile.googleScholarUrl ? (
                    <a
                      href={profile.googleScholarUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-royal-600 dark:text-royal-400 hover:underline flex items-center gap-1"
                    >
                      View Profile <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Not configured</span>
                  )}
                </div>

                {/* ResearchGate */}
                {profile.researchGateUrl && (
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">ResearchGate</span>
                    <a
                      href={profile.researchGateUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-royal-600 dark:text-royal-400 hover:underline flex items-center gap-1"
                    >
                      View Profile <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* LinkedIn */}
                {profile.linkedInUrl && (
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">LinkedIn</span>
                    <a
                      href={profile.linkedInUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-royal-600 dark:text-royal-400 hover:underline flex items-center gap-1"
                    >
                      Connect <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Specialization */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                Core Specialization
              </h3>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {profile.specialization || 'Not specified'}
              </p>
            </div>
          </div>

          {/* Right Columns: Biography & Research Interests */}
          <div className="lg:col-span-2 space-y-6">
            {/* Biography */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                Academic Biography
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {profile.biography ||
                  'No professional biography provided yet. Edit your profile to present your academic background, research vision, and institutional milestones.'}
              </p>
            </div>

            {/* Research Interests */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                Research Interests & Focus Domains
              </h3>
              {profile.researchInterests?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.researchInterests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-royal-50 dark:bg-royal-950/50 text-royal-700 dark:text-royal-300 border border-royal-200 dark:border-royal-800 rounded-xl text-xs font-semibold"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No research interests listed.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Teaching & Experience */}
      {activeTab === 'experience' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Professional Experience */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-royal-600" /> Professional Experience
            </h3>
            {profile.experience?.length > 0 ? (
              <div className="space-y-4">
                {profile.experience.map((exp, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">{exp.title}</h4>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {exp.startYear} - {exp.isCurrent ? 'Present' : exp.endYear}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-royal-600 dark:text-royal-400 mt-0.5">
                      {exp.organization}
                    </p>
                    {exp.roleDescription && (
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        {exp.roleDescription}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No experience records added.</p>
            )}
          </div>

          {/* Courses Taught */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-royal-600" /> Courses Taught
            </h3>
            {profile.coursesTaught?.length > 0 ? (
              <div className="space-y-3">
                {profile.coursesTaught.map((course, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-royal-600 dark:text-royal-400 mr-2">
                        {course.courseCode}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-white">
                        {course.courseName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {course.level}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {course.academicYear}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No courses listed.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Audit Trail */}
      {activeTab === 'audit' && canEdit && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <History className="w-4 h-4 text-royal-600" /> Profile Modification Audit Trail
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Field</th>
                  <th className="py-2.5 px-3">Old Value</th>
                  <th className="py-2.5 px-3">New Value</th>
                  <th className="py-2.5 px-3">Changed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {profile.auditTrail.map((log, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {log.field}
                    </td>
                    <td className="py-2 px-3 text-slate-500 font-mono truncate max-w-xs">
                      {String(log.oldValue || '-')}
                    </td>
                    <td className="py-2 px-3 text-royal-600 dark:text-royal-400 font-mono truncate max-w-xs">
                      {String(log.newValue || '-')}
                    </td>
                    <td className="py-2 px-3 text-slate-400">
                      {new Date(log.changedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Edit Faculty Profile
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
              {/* Row 1: Designation & Qualification */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Highest Qualification
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.highestQualification}
                    onChange={(e) =>
                      setFormData({ ...formData, highestQualification: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              {/* Row 2: Specialization & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Specialization
                  </label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder="e.g. Artificial Intelligence, Cryptography"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              {/* Biography */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Academic Biography
                </label>
                <textarea
                  rows={4}
                  value={formData.biography}
                  onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                  placeholder="Enter your academic summary..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              {/* Scholarly IDs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ORCID iD
                  </label>
                  <input
                    type="text"
                    value={formData.orcidId}
                    onChange={(e) => setFormData({ ...formData, orcidId: e.target.value })}
                    placeholder="0000-0002-1825-0097"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Scopus Author ID
                  </label>
                  <input
                    type="text"
                    value={formData.scopusId}
                    onChange={(e) => setFormData({ ...formData, scopusId: e.target.value })}
                    placeholder="57200000000"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Google Scholar URL
                  </label>
                  <input
                    type="url"
                    value={formData.googleScholarUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, googleScholarUrl: e.target.value })
                    }
                    placeholder="https://scholar.google.com/citations?user=..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              {/* Research Interests tag editor */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Research Interests
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addInterest();
                      }
                    }}
                    placeholder="Add an interest and press Add"
                    className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={addInterest}
                    className="px-3 py-2 bg-slate-200 dark:bg-slate-700 rounded-xl font-bold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.researchInterests?.map((item, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-royal-50 dark:bg-royal-950/50 text-royal-700 dark:text-royal-300 rounded-lg border border-royal-200"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => removeInterest(item)}
                        className="hover:text-rose-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-royal-600 hover:bg-royal-700 text-white font-bold rounded-xl shadow-md"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyProfile;
