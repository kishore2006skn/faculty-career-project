import React, { useState, useEffect } from 'react';
import { Sliders, Save, ShieldCheck, CheckCircle2, AlertCircle, Edit3, Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdvancementPolicies = () => {
  const { showToast } = useToast();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPolicy();
  }, []);

  const fetchPolicy = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/policy');
      if (res.data?.success) {
        setPolicy(res.data.data);
      }
    } catch (err) {
      showToast('Failed to load advancement policy.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = (idx, field, value) => {
    const updatedStages = [...policy.stages];
    updatedStages[idx][field] = value;
    setPolicy({ ...policy, stages: updatedStages });
  };

  const handleRuleChange = (idx, field, value) => {
    const updatedRules = [...policy.criteriaRules];
    updatedRules[idx][field] = value;
    setPolicy({ ...policy, criteriaRules: updatedRules });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/admin/policy/${policy._id}`, policy);
      showToast('Career Advancement Scheme policy rules updated successfully!', 'success');
    } catch (err) {
      showToast('Failed to update policy.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading CAS advancement policy rules..." />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-6 h-6 text-royal-600" />
            Career Advancement Scheme (CAS) Policy Configuration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure institutional evaluation standards, promotion stages, and API credit scoring rules.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-royal-600 hover:bg-royal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-royal-600/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Policy Changes'}
        </button>
      </div>

      {policy && (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Policy Overview Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-royal-700 dark:text-royal-400">
              1. Policy Framework Metadata
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Policy Name
                </label>
                <input
                  type="text"
                  required
                  value={policy.policyName}
                  onChange={(e) => setPolicy({ ...policy, policyName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Policy Version
                </label>
                <input
                  type="text"
                  required
                  value={policy.version}
                  onChange={(e) => setPolicy({ ...policy, version: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Institution Name
                </label>
                <input
                  type="text"
                  required
                  value={policy.institutionName}
                  onChange={(e) => setPolicy({ ...policy, institutionName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Promotion Stages Configuration */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-royal-700 dark:text-royal-400">
              2. Career Advancement Promotion Stages & Thresholds
            </h2>

            <div className="space-y-4">
              {policy.stages?.map((stage, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-4 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      {stage.stageName}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Minimum CAS Score (Pts)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={stage.minTotalPoints}
                        onChange={(e) =>
                          handleStageChange(idx, 'minTotalPoints', parseInt(e.target.value) || 0)
                        }
                        className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-royal-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Mandatory Journal Papers
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={stage.minJournalPublications}
                        onChange={(e) =>
                          handleStageChange(
                            idx,
                            'minJournalPublications',
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-royal-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Required Service Years
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={stage.minYearsOfService}
                        onChange={(e) =>
                          handleStageChange(idx, 'minYearsOfService', parseInt(e.target.value) || 0)
                        }
                        className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Min. FDPs / Refresher Courses
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={stage.minFdpAttended || 1}
                        onChange={(e) =>
                          handleStageChange(idx, 'minFdpAttended', parseInt(e.target.value) || 0)
                        }
                        className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Points Scoring Rules Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-royal-700 dark:text-royal-400">
              3. Category Points Allocation Rules
            </h2>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase">
                    <th className="py-3 px-4">Research Output / Achievement</th>
                    <th className="py-3 px-4">Points Per Item</th>
                    <th className="py-3 px-4">Maximum Points Cap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {policy.criteriaRules?.map((rule, idx) => (
                    <tr key={idx}>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {rule.label}
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="0"
                          value={rule.pointsPerItem}
                          onChange={(e) =>
                            handleRuleChange(idx, 'pointsPerItem', parseInt(e.target.value) || 0)
                          }
                          className="w-20 p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="0"
                          value={rule.maxPointsCap}
                          onChange={(e) =>
                            handleRuleChange(idx, 'maxPointsCap', parseInt(e.target.value) || 0)
                          }
                          className="w-20 p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default AdvancementPolicies;
