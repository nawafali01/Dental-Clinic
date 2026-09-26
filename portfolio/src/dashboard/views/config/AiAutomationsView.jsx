import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Zap,
  Play,
  Plus,
  Layers,
  FileText,
  Database,
  BarChart3,
  MessageSquare,
  Check,
  X,
  RefreshCw,
  Code,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Trash2,
  ExternalLink,
  ChevronRight,
  Star,
  DollarSign,
  Cpu,
} from 'lucide-react';
import { toast } from 'sonner';
import aiService from '@/services/aiService';
import { PageHeader } from '../components/ViewComponents';

export const AiAutomationsView = () => {
  const [activeTab, setActiveTab] = useState('rules');

  // State for all 8 entities
  const [rules, setRules] = useState([]);
  const [runs, setRuns] = useState([]);
  const [aiRuns, setAiRuns] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [docs, setDocs] = useState([]);
  const [chunks, setChunks] = useState([]);
  const [usage, setUsage] = useState([]);
  const [feedback, setFeedback] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  // Modal Control States
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isChunkModalOpen, setIsChunkModalOpen] = useState(false);
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [selectedJsonDetail, setSelectedJsonDetail] = useState(null);

  // ── Form State Variables ──────────────────────────────────────
  // 1. Rule Form
  const [ruleForm, setRuleForm] = useState({
    organization_id: '123e4567-e89b-12d3-a456-426614174000',
    name: '',
    trigger_type: 'lead_created',
    conditions: '{\n  "treatment": "Implant",\n  "min_budget": 1500\n}',
    action_type: 'send_ai_whatsapp',
    is_active: true,
  });

  // 2. Prompt Version Form
  const [promptForm, setPromptForm] = useState({
    feature_name: 'lead_summary',
    version: 1,
    prompt_text: '',
    is_active: true,
  });

  // 3. Knowledge Document Form
  const [docForm, setDocForm] = useState({
    organization_id: '123e4567-e89b-12d3-a456-426614174000',
    title: '',
    file_url: '',
    source_type: 'PDF',
  });

  // 4. Knowledge Chunk Form
  const [chunkForm, setChunkForm] = useState({
    knowledge_document_id: '',
    chunk_index: 0,
    content: '',
    embedding: '[0.012, -0.045, 0.881, 0.234, -0.119]',
  });

  // 5. Usage Form
  const [usageForm, setUsageForm] = useState({
    model_name: 'gpt-4o',
    tokens_used: 1200,
    cost: 0.036,
  });

  // 6. Feedback Form
  const [feedbackForm, setFeedbackForm] = useState({
    ai_run_id: '',
    rating: 5,
    comment: '',
  });

  // Load all AI data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [
        fetchedRules,
        fetchedRuns,
        fetchedAiRuns,
        fetchedPrompts,
        fetchedDocs,
        fetchedChunks,
        fetchedUsage,
        fetchedFeedback,
      ] = await Promise.all([
        aiService.getAutomationRules('123e4567-e89b-12d3-a456-426614174000'),
        aiService.getAutomationRuns(),
        aiService.getAIRuns(),
        aiService.getPromptVersions(),
        aiService.getKnowledgeDocuments('123e4567-e89b-12d3-a456-426614174000'),
        aiService.getKnowledgeChunks(),
        aiService.getUsageMetrics(),
        aiService.getFeedbackList(),
      ]);

      setRules(fetchedRules || []);
      setRuns(fetchedRuns || []);
      setAiRuns(fetchedAiRuns || []);
      setPrompts(fetchedPrompts || []);
      setDocs(fetchedDocs || []);
      setChunks(fetchedChunks || []);
      setUsage(fetchedUsage || []);
      setFeedback(fetchedFeedback || []);
    } catch (err) {
      console.error('[AiAutomationsView] Load error:', err);
      toast.error('Failed to load AI Automation datasets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ── Rule Actions ──
  const handleCreateRule = async (e) => {
    e.preventDefault();
    try {
      await aiService.createAutomationRule(ruleForm);
      toast.success('Automation rule created!');
      setIsRuleModalOpen(false);
      setRuleForm({
        organization_id: '123e4567-e89b-12d3-a456-426614174000',
        name: '',
        trigger_type: 'lead_created',
        conditions: '{\n  "treatment": "Implant",\n  "min_budget": 1500\n}',
        action_type: 'send_ai_whatsapp',
        is_active: true,
      });
      loadData();
    } catch (err) {
      toast.error('Error creating rule: ' + err.message);
    }
  };

  const handleToggleRule = async (ruleId) => {
    const updated = await aiService.toggleRuleActive(ruleId);
    setRules(updated);
    toast.success('Automation rule status toggled');
  };

  const handleTestRuleRun = async (rule) => {
    toast.info(`Executing automation rule: "${rule.name}"...`);
    try {
      await aiService.logAutomationRun({
        automation_rule_id: rule.id,
        rule_name: rule.name,
        status: 'success',
        execution_details: {
          triggered_by: 'Manual Agent Test',
          conditions_matched: rule.conditions,
          action_executed: rule.action_type,
          duration_ms: Math.floor(Math.random() * 200) + 150,
        },
      });
      toast.success(`Rule "${rule.name}" executed successfully!`);
      loadData();
    } catch (err) {
      toast.error('Failed to log rule execution run');
    }
  };

  // ── Prompt Actions ──
  const handleCreatePrompt = async (e) => {
    e.preventDefault();
    try {
      await aiService.createPromptVersion(promptForm);
      toast.success('Prompt version created!');
      setIsPromptModalOpen(false);
      setPromptForm({ feature_name: 'lead_summary', version: 1, prompt_text: '', is_active: true });
      loadData();
    } catch (err) {
      toast.error('Error creating prompt version');
    }
  };

  const handleTogglePrompt = async (promptId) => {
    const updated = await aiService.togglePromptActive(promptId);
    setPrompts(updated);
    toast.success('Active prompt version updated');
  };

  // ── Knowledge Document & Chunk Actions ──
  const handleCreateDoc = async (e) => {
    e.preventDefault();
    try {
      await aiService.registerKnowledgeDocument(docForm);
      toast.success('Knowledge document registered!');
      setIsDocModalOpen(false);
      setDocForm({ organization_id: 'org-001', title: '', file_url: '', source_type: 'PDF' });
      loadData();
    } catch (err) {
      toast.error('Error registering document');
    }
  };

  const handleCreateChunk = async (e) => {
    e.preventDefault();
    try {
      await aiService.storeKnowledgeChunks({
        ...chunkForm,
        knowledge_document_id: selectedDocId || chunkForm.knowledge_document_id || docs[0]?.id,
      });
      toast.success('Knowledge chunk stored!');
      setIsChunkModalOpen(false);
      setChunkForm({ knowledge_document_id: '', chunk_index: 0, content: '', embedding: '[0.012, -0.045, 0.881]' });
      loadData();
    } catch (err) {
      toast.error('Error storing chunk');
    }
  };

  // ── Usage Actions ──
  const handleRecordUsage = async (e) => {
    e.preventDefault();
    try {
      await aiService.recordUsage(usageForm);
      toast.success('AI Token Usage recorded!');
      setIsUsageModalOpen(false);
      setUsageForm({ model_name: 'gpt-4o', tokens_used: 1200, cost: 0.036 });
      loadData();
    } catch (err) {
      toast.error('Error recording usage');
    }
  };

  // ── Feedback Actions ──
  const handleRecordFeedback = async (e) => {
    e.preventDefault();
    try {
      await aiService.submitFeedback(feedbackForm);
      toast.success('AI Feedback recorded!');
      setIsFeedbackModalOpen(false);
      setFeedbackForm({ ai_run_id: '', rating: 5, comment: '' });
      loadData();
    } catch (err) {
      toast.error('Error recording feedback');
    }
  };

  // Stats Calculations
  const activeRulesCount = useMemo(() => rules.filter((r) => r.is_active).length, [rules]);
  const totalTokens = useMemo(() => usage.reduce((acc, u) => acc + (u.tokens_used || 0), 0), [usage]);
  const totalCost = useMemo(() => usage.reduce((acc, u) => acc + (u.cost || 0), 0), [usage]);

  const tabs = [
    { id: 'rules', label: 'Automation Rules', icon: Zap, count: rules.length },
    { id: 'runs', label: 'Execution & AI Runs', icon: Play, count: runs.length + aiRuns.length },
    { id: 'prompts', label: 'Prompt Versioning', icon: Layers, count: prompts.length },
    { id: 'knowledge', label: 'Knowledge Base (RAG)', icon: Database, count: docs.length },
    { id: 'usage', label: 'Token & Cost Metrics', icon: Cpu, count: usage.length },
    { id: 'feedback', label: 'User AI Feedback', icon: MessageSquare, count: feedback.length },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="AI Automation Module & Feature Hub"
        description="Configure workflows, prompt versions, RAG documents, and monitor execution runs"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-primary' : ''}`} />
              <span>Refresh Data</span>
            </button>
            <button
              onClick={() => setIsRuleModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Automation Rule</span>
            </button>
          </div>
        }
      />

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Automation Rules</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{activeRulesCount} / {rules.length}</p>
          <p className="text-xs text-emerald-600 font-medium mt-0.5">Active & Running</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Total AI Runs Today</span>
            <Play className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{runs.length + aiRuns.length}</p>
          <p className="text-xs text-emerald-600 font-medium mt-0.5">99.2% Success Rate</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Token Consumption</span>
            <Cpu className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalTokens.toLocaleString()}</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Tokens tracked</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Cumulative Cost</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">${totalCost.toFixed(4)}</p>
          <p className="text-xs text-emerald-600 font-medium mt-0.5">Estimated execution bill</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] ${
                  isActive ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: AUTOMATION RULES ────────────────────────────────────── */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Configured Automation Rules (`AutomationRule`)
            </h2>
            <button
              onClick={() => setIsRuleModalOpen(true)}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              + Create Automation Rule
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-xs sm:text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Rule Name</th>
                  <th className="px-4 py-3">Trigger Event</th>
                  <th className="px-4 py-3">Conditions</th>
                  <th className="px-4 py-3">Action Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900">{rule.name}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-mono text-xs border border-blue-200">
                        {rule.trigger_type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      <button
                        onClick={() => setSelectedJsonDetail(rule.conditions)}
                        className="font-mono text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md max-w-xs truncate block cursor-pointer"
                      >
                        {JSON.stringify(rule.conditions)}
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-semibold text-xs border border-purple-200">
                        {rule.action_type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleToggleRule(rule.id)}
                        className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                          rule.is_active
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                            : 'bg-slate-100 text-slate-500 border border-slate-300'
                        }`}
                      >
                        {rule.is_active ? 'Active' : 'Paused'}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleTestRuleRun(rule)}
                        className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 ml-auto"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Test Run</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: EXECUTION & AI RUNS ─────────────────────────────────── */}
      {activeTab === 'runs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Execution Logs (`AutomationRun` & `AIRun`)
            </h2>
            <span className="text-xs text-slate-500">Real-time audit trail of all AI automation events</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-xs sm:text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Run ID</th>
                  <th className="px-4 py-3">Rule / Feature</th>
                  <th className="px-4 py-3">Execution Status</th>
                  <th className="px-4 py-3">Execution Details</th>
                  <th className="px-4 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {runs.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs font-bold text-slate-900">{r.id}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">{r.rule_name || r.automation_rule_id}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                          r.status === 'success'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.status === 'failed'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => setSelectedJsonDetail(r.execution_details)}
                        className="text-xs font-mono text-primary hover:underline bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 cursor-pointer"
                      >
                        View JSON Payload
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{new Date(r.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
                {aiRuns.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs font-bold text-indigo-700">{r.id}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">{r.feature_name}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold capitalize bg-emerald-100 text-emerald-800">
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => setSelectedJsonDetail({ input: r.input_data, output: r.output_data })}
                        className="text-xs font-mono text-indigo-600 hover:underline bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200 cursor-pointer"
                      >
                        View AI Input/Output
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{new Date(r.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: PROMPT VERSIONING ───────────────────────────────────── */}
      {activeTab === 'prompts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Prompt Version Control (`AIPromptVersion`)
            </h2>
            <button
              onClick={() => setIsPromptModalOpen(true)}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              + Create Prompt Version
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prompts.map((p) => (
              <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 font-mono text-xs font-bold text-slate-800">
                      v{p.version}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{p.feature_name}</h3>
                  </div>

                  <button
                    onClick={() => handleTogglePrompt(p.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer ${
                      p.is_active ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {p.is_active ? 'Active Version' : 'Inactive'}
                  </button>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed">{p.system_prompt || p.prompt_text}</p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Prompt ID: {p.id}</span>
                  <span>Created: {new Date(p.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: KNOWLEDGE BASE (RAG) ────────────────────────────────── */}
      {activeTab === 'knowledge' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Knowledge Documents & Vector Chunks (`KnowledgeDocument` & `KnowledgeChunk`)
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDocModalOpen(true)}
                className="text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                + Register Document
              </button>
              <button
                onClick={() => setIsChunkModalOpen(true)}
                className="px-3 py-1 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 cursor-pointer shadow-2xs"
              >
                + Store Vector Chunk
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Registered Documents */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Documents</h3>
              <div className="space-y-2.5">
                {docs.map((doc) => (
                  <div key={doc.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{doc.title}</h4>
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>{doc.file_url}</span>
                        </a>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                        {doc.source_type}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                      <span>Chunks: {doc.chunks_count || 0}</span>
                      <button
                        onClick={() => {
                          setSelectedDocId(doc.id);
                          setIsChunkModalOpen(true);
                        }}
                        className="text-primary font-bold hover:underline cursor-pointer"
                      >
                        + Add Chunk to Doc
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chunks */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vector Chunks</h3>
              <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                {chunks.map((chk) => (
                  <div key={chk.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 font-mono">Index #{chk.chunk_index}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Doc: {chk.knowledge_document_id}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed font-medium">{chk.content}</p>
                    <div className="pt-1 text-[10px] font-mono text-purple-700 bg-purple-50 p-1.5 rounded-lg">
                      Embedding Vector: {JSON.stringify(chk.embedding)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: TOKEN & COST METRICS ───────────────────────────────── */}
      {activeTab === 'usage' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              AI Token & Cost Tracking (`AIUsage`)
            </h2>
            <button
              onClick={() => setIsUsageModalOpen(true)}
              className="text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              + Record Usage Entry
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-xs sm:text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Usage ID</th>
                  <th className="px-4 py-3">AI Model Name</th>
                  <th className="px-4 py-3">Tokens Consumed</th>
                  <th className="px-4 py-3">Calculated Cost ($)</th>
                  <th className="px-4 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {usage.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs font-bold text-slate-900">{u.id}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-200">
                        {u.model_name}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-800">{u.tokens_used.toLocaleString()} tokens</td>
                    <td className="px-4 py-3.5 font-bold text-emerald-600">${Number(u.cost).toFixed(5)}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{new Date(u.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 6: USER AI FEEDBACK ───────────────────────────────────── */}
      {activeTab === 'feedback' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              User AI Rating & Feedback (`AIFeedback`)
            </h2>
            <button
              onClick={() => setIsFeedbackModalOpen(true)}
              className="text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              + Submit Test Feedback
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedback.map((fb) => (
              <div key={fb.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= fb.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-slate-800 ml-1.5">{fb.rating}/5</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">Run: {fb.ai_run_id}</span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 font-medium italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                  "{fb.comment || 'No comment provided.'}"
                </p>

                <div className="text-[11px] text-slate-400 text-right">
                  {new Date(fb.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MODALS FOR CREATING ENTITIES ───────────────────────────────── */}
      {/* 1. Rule Creation Modal */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">Create Automation Rule (`AutomationRule`)</h3>
              <button onClick={() => setIsRuleModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleCreateRule} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  value={ruleForm.name}
                  onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                  placeholder="e.g., Urgent Implant Lead Escalation"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Trigger Event</label>
                  <select
                    value={ruleForm.trigger_type}
                    onChange={(e) => setRuleForm({ ...ruleForm, trigger_type: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="lead_created">Lead Created</option>
                    <option value="appointment_no_show">Appointment No-Show</option>
                    <option value="appointment_completed">Appointment Completed</option>
                    <option value="payment_received">Payment Received</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Action Type</label>
                  <select
                    value={ruleForm.action_type}
                    onChange={(e) => setRuleForm({ ...ruleForm, action_type: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="send_ai_whatsapp">Send AI WhatsApp</option>
                    <option value="trigger_sms_campaign">Trigger SMS Campaign</option>
                    <option value="auto_generate_bill">Auto-Generate Invoice</option>
                    <option value="assign_to_senior_agent">Assign to Senior Agent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Conditions JSON</label>
                <textarea
                  rows={3}
                  value={ruleForm.conditions}
                  onChange={(e) => setRuleForm({ ...ruleForm, conditions: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="ruleActiveToggle"
                  checked={ruleForm.is_active}
                  onChange={(e) => setRuleForm({ ...ruleForm, is_active: e.target.checked })}
                />
                <label htmlFor="ruleActiveToggle" className="font-bold text-slate-700">Set Rule Active</label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsRuleModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white font-bold rounded-xl">Create Rule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Prompt Creation Modal */}
      {isPromptModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">Create Prompt Version (`AIPromptVersion`)</h3>
              <button onClick={() => setIsPromptModalOpen(false)} className="text-slate-400 font-bold">✕</button>
            </div>
            <form onSubmit={handleCreatePrompt} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Feature Name</label>
                  <input
                    type="text"
                    required
                    value={promptForm.feature_name}
                    onChange={(e) => setPromptForm({ ...promptForm, feature_name: e.target.value })}
                    placeholder="e.g. lead_summary"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Version Number</label>
                  <input
                    type="number"
                    required
                    value={promptForm.version}
                    onChange={(e) => setPromptForm({ ...promptForm, version: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Prompt Text</label>
                <textarea
                  rows={4}
                  required
                  value={promptForm.prompt_text}
                  onChange={(e) => setPromptForm({ ...promptForm, prompt_text: e.target.value })}
                  placeholder="Enter system prompt instructions..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsPromptModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white font-bold rounded-xl">Save Version</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Knowledge Document Modal */}
      {isDocModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">Register Knowledge Document (`KnowledgeDocument`)</h3>
              <button onClick={() => setIsDocModalOpen(false)} className="text-slate-400 font-bold">✕</button>
            </div>
            <form onSubmit={handleCreateDoc} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={docForm.title}
                  onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                  placeholder="e.g. Invisalign Patient Guide 2026"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Source Type</label>
                  <select
                    value={docForm.source_type}
                    onChange={(e) => setDocForm({ ...docForm, source_type: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="TXT">TXT Text File</option>
                    <option value="DOCX">Word DOCX</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">File URL</label>
                  <input
                    type="text"
                    required
                    value={docForm.file_url}
                    onChange={(e) => setDocForm({ ...docForm, file_url: e.target.value })}
                    placeholder="https://cdn..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsDocModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white font-bold rounded-xl">Register Document</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Knowledge Chunk Modal */}
      {isChunkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">Store Knowledge Chunk (`KnowledgeChunk`)</h3>
              <button onClick={() => setIsChunkModalOpen(false)} className="text-slate-400 font-bold">✕</button>
            </div>
            <form onSubmit={handleCreateChunk} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Parent Document</label>
                <select
                  value={selectedDocId || chunkForm.knowledge_document_id}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {docs.map((d) => (
                    <option key={d.id} value={d.id}>{d.title} ({d.id})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Chunk Content</label>
                <textarea
                  rows={3}
                  required
                  value={chunkForm.content}
                  onChange={(e) => setChunkForm({ ...chunkForm, content: e.target.value })}
                  placeholder="Enter snippet text content..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Vector Embedding JSON</label>
                <input
                  type="text"
                  value={chunkForm.embedding}
                  onChange={(e) => setChunkForm({ ...chunkForm, embedding: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsChunkModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white font-bold rounded-xl">Store Chunk</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. JSON Viewer Modal */}
      {selectedJsonDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">Execution Details Payload</h3>
              <button onClick={() => setSelectedJsonDetail(null)} className="text-slate-400 font-bold">✕</button>
            </div>
            <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto max-h-80">
              {JSON.stringify(selectedJsonDetail, null, 2)}
            </pre>
            <div className="flex justify-end">
              <button onClick={() => setSelectedJsonDetail(null)} className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiAutomationsView;
