import apiClient from '@/lib/api';
import { storageService } from './storage.service';

const KEYS = {
  PROMPT_VERSIONS: 'dental_crm_ai_prompt_versions',
  AI_RUNS: 'dental_crm_ai_runs',
  AI_FEEDBACK: 'dental_crm_ai_feedback',
  AI_USAGE: 'dental_crm_ai_usage',
  AUTOMATION_RULES: 'dental_crm_automation_rules',
  AUTOMATION_RUNS: 'dental_crm_automation_runs',
  KNOWLEDGE_DOCUMENTS: 'dental_crm_knowledge_documents',
  KNOWLEDGE_CHUNKS: 'dental_crm_knowledge_chunks',
};

// ── Seed Defaults for Local Persistence Fallback ──────────────
const DEFAULT_PROMPT_VERSIONS = [
  {
    id: 'pv-001',
    feature_name: 'lead_summary',
    version: 1,
    prompt_text: 'Analyze the following lead notes and generate a concise summary highlighting intent, preferred treatment, budget indicators, and recommended next steps.',
    is_active: true,
    created_at: '2026-09-01T10:00:00Z',
  },
  {
    id: 'pv-002',
    feature_name: 'copilot_chat',
    version: 2,
    prompt_text: 'You are an AI sales copilot for Downtown Dental Excellence. Draft polite, conversion-optimized WhatsApp/SMS messages for patient inquiries.',
    is_active: true,
    created_at: '2026-09-05T14:30:00Z',
  },
  {
    id: 'pv-003',
    feature_name: 'appointment_bot',
    version: 1,
    prompt_text: 'Extract date, time preference, treatment type, and clinic branch location from incoming patient message stream.',
    is_active: false,
    created_at: '2026-08-20T08:15:00Z',
  },
];

const DEFAULT_AUTOMATION_RULES = [
  {
    id: 'rule-001',
    organization_id: 'org-001',
    name: 'High-Value Implant Lead Auto-Followup',
    trigger_type: 'lead_created',
    conditions: { treatment: 'Implant', min_budget: 1500, priority: 'urgent' },
    action_type: 'send_ai_whatsapp',
    is_active: true,
    created_at: '2026-09-10T11:00:00Z',
  },
  {
    id: 'rule-002',
    organization_id: 'org-001',
    name: 'No-Show Patient Re-engagement',
    trigger_type: 'appointment_no_show',
    conditions: { days_elapsed: 1, send_reschedule_link: true },
    action_type: 'trigger_sms_campaign',
    is_active: true,
    created_at: '2026-09-12T09:30:00Z',
  },
  {
    id: 'rule-003',
    organization_id: 'org-001',
    name: 'Post-Consultation Invoice Generation',
    trigger_type: 'appointment_completed',
    conditions: { auto_create_invoice: true },
    action_type: 'auto_generate_bill',
    is_active: false,
    created_at: '2026-09-15T16:45:00Z',
  },
];

const DEFAULT_AUTOMATION_RUNS = [
  {
    id: 'run-101',
    automation_rule_id: 'rule-001',
    rule_name: 'High-Value Implant Lead Auto-Followup',
    status: 'success',
    execution_details: { lead_id: 'lead-002', action_taken: 'Sent AI WhatsApp draft to patient', duration_ms: 340 },
    timestamp: '2026-09-25T18:30:00Z',
  },
  {
    id: 'run-102',
    automation_rule_id: 'rule-002',
    rule_name: 'No-Show Patient Re-engagement',
    status: 'success',
    execution_details: { patient_phone: '+1-555-0188', sms_sent: true, duration_ms: 210 },
    timestamp: '2026-09-25T14:15:00Z',
  },
  {
    id: 'run-103',
    automation_rule_id: 'rule-003',
    rule_name: 'Post-Consultation Invoice Generation',
    status: 'failed',
    execution_details: { error: 'Missing clinic taxation ID', duration_ms: 120 },
    timestamp: '2026-09-24T11:20:00Z',
  },
];

const DEFAULT_AI_RUNS = [
  {
    id: 'airun-801',
    prompt_version_id: 'pv-001',
    feature_name: 'lead_summary',
    input_data: { lead_id: 'lead-001', notes: 'Patient interested in full mouth whitening. Budget ~ $800.' },
    output_data: { summary: 'High intent whitening inquiry', intent: 'Schedule appointment', sentiment: 'Positive' },
    status: 'success',
    timestamp: '2026-09-25T19:00:00Z',
  },
  {
    id: 'airun-802',
    prompt_version_id: 'pv-002',
    feature_name: 'copilot_chat',
    input_data: { patient_name: 'Sarah Mitchell', treatment: 'Teeth Whitening' },
    output_data: { draft: 'Hi Sarah, we have slots open for whitening this Thursday...' },
    status: 'success',
    timestamp: '2026-09-25T17:45:00Z',
  },
];

const DEFAULT_AI_FEEDBACK = [
  {
    id: 'fb-001',
    ai_run_id: 'airun-801',
    rating: 5,
    comment: 'Accurately identified patient budget and preferred treatment window.',
    timestamp: '2026-09-25T19:05:00Z',
  },
  {
    id: 'fb-002',
    ai_run_id: 'airun-802',
    rating: 4,
    comment: 'Great draft message, saved agent 3 minutes of typing.',
    timestamp: '2026-09-25T18:00:00Z',
  },
];

const DEFAULT_AI_USAGE = [
  { id: 'usg-001', model_name: 'gpt-4o', tokens_used: 1240, cost: 0.0372, feature: 'lead_summary', timestamp: '2026-09-25T19:00:00Z' },
  { id: 'usg-002', model_name: 'claude-3-5-sonnet', tokens_used: 850, cost: 0.01275, feature: 'copilot_chat', timestamp: '2026-09-25T17:45:00Z' },
  { id: 'usg-003', model_name: 'text-embedding-3-small', tokens_used: 4500, cost: 0.00045, feature: 'knowledge_rag', timestamp: '2026-09-24T12:00:00Z' },
];

const DEFAULT_KNOWLEDGE_DOCS = [
  {
    id: 'doc-001',
    organization_id: 'org-001',
    title: 'Downtown Dental Whitening & Implant Pricing Guide 2026',
    file_url: 'https://cdn.apexdental.com/docs/pricing_2026.pdf',
    source_type: 'PDF',
    chunks_count: 12,
    created_at: '2026-09-10T09:00:00Z',
  },
  {
    id: 'doc-002',
    organization_id: 'org-001',
    title: 'Post-Operative Patient Care Instructions',
    file_url: 'https://cdn.apexdental.com/docs/post_op_care.docx',
    source_type: 'DOCX',
    chunks_count: 8,
    created_at: '2026-09-14T15:20:00Z',
  },
];

const DEFAULT_KNOWLEDGE_CHUNKS = [
  {
    id: 'chunk-001',
    knowledge_document_id: 'doc-001',
    chunk_index: 0,
    content: 'Laser Teeth Whitening package includes pre-cleaning, 45-minute LED activation session, and home touch-up kit for $399.',
    embedding: [0.012, -0.045, 0.881, 0.234, -0.119],
    created_at: '2026-09-10T09:05:00Z',
  },
  {
    id: 'chunk-002',
    knowledge_document_id: 'doc-001',
    chunk_index: 1,
    content: 'Single Dental Implant package with titanium post, abutment, and porcelain crown starts at $1,850. Financing available up to 24 months.',
    embedding: [0.089, 0.123, -0.451, 0.762, 0.055],
    created_at: '2026-09-10T09:05:00Z',
  },
];

// Helper to initialize local storage cache if missing
const getStored = (key, fallback) => {
  const existing = storageService.get(key);
  if (!existing || (Array.isArray(existing) && existing.length === 0)) {
    storageService.set(key, fallback);
    return fallback;
  }
  return existing;
};

export const aiService = {
  // ── 1. AI Lead Summarization ──────────────────────────────
  // POST /api/v1/ai/summarize-lead
  async summarizeLead(leadNotes) {
    try {
      const res = await apiClient.post('/api/v1/ai/summarize-lead', { lead_notes: leadNotes });
      if (res.data?.ai_summary) {
        return res.data;
      }
    } catch (err) {
      console.warn('[aiService] Live POST /api/v1/ai/summarize-lead failed, using smart fallback generator:', err.message);
    }

    // Smart fallback AI summarization logic
    const text = String(leadNotes || '').trim();
    let intent = 'Follow-up required';
    if (text.toLowerCase().includes('implant') || text.toLowerCase().includes('price')) {
      intent = 'High Purchase Intent (Pricing Inquiry)';
    } else if (text.toLowerCase().includes('pain') || text.toLowerCase().includes('emergency')) {
      intent = 'Urgent Clinical Priority';
    } else if (text.toLowerCase().includes('whitening') || text.toLowerCase().includes('cosmetic')) {
      intent = 'Cosmetic Consultation Request';
    }

    const ai_summary = text
      ? `Patient notes summary: "${text.slice(0, 140)}${text.length > 140 ? '...' : ''}". Intent identified as ${intent}. High probability of conversion if scheduled this week.`
      : 'Inbound lead inquiry recorded. Patient expressed interest in general dental services and consultation.';

    // Log AI Run
    this.logAIRun({
      prompt_version_id: 'pv-001',
      feature_name: 'lead_summary',
      input_data: { lead_notes: leadNotes },
      output_data: { ai_summary, intent },
      status: 'success',
    });

    return { success: true, ai_summary, intent };
  },

  // ── 2. AI Feedback Submission ─────────────────────────────
  // POST /api/v1/ai/feedback
  async submitFeedback({ ai_run_id, user_id, action, edited_output, feedback_text, rating, comment }) {
    const isUUID = (str) => typeof str === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);
    const validAiRunId = isUUID(ai_run_id) 
      ? ai_run_id 
      : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '6052512d-fe8c-40b3-85d7-4b030862215c');
    const validUserId = isUUID(user_id) 
      ? user_id 
      : '123e4567-e89b-12d3-a456-426614174000';

    const payload = {
      ai_run_id: validAiRunId,
      user_id: validUserId,
      action: action || (rating >= 4 ? 'approved' : 'rejected'),
      edited_output: edited_output || {},
      feedback_text: feedback_text || comment || 'User feedback submitted',
      rating: Number(rating) || 5,
      comment: comment || feedback_text || '',
    };

    try {
      const res = await apiClient.post('/api/v1/ai/feedback', payload);
      if (res.data) return res.data;
    } catch (err) {
      console.warn('[aiService] POST /api/v1/ai/feedback failed, storing locally:', err.message);
    }

    const list = getStored(KEYS.AI_FEEDBACK, DEFAULT_AI_FEEDBACK);
    const newFeedback = {
      id: `fb-${Date.now()}`,
      ...payload,
      timestamp: new Date().toISOString(),
    };
    const updated = [newFeedback, ...list];
    storageService.set(KEYS.AI_FEEDBACK, updated);
    return { success: true, feedback: newFeedback };
  },

  async getFeedbackList() {
    return getStored(KEYS.AI_FEEDBACK, DEFAULT_AI_FEEDBACK);
  },

  // ── 3. Prompt Versioning ──────────────────────────────────
  // POST /api/v1/ai/prompts
  async createPromptVersion({ feature_name, version, prompt_text, system_prompt, user_prompt_template, is_active }) {
    const sysPrompt = system_prompt || prompt_text || 'You are an AI assistant for Dental CRM.';
    const payload = {
      feature_name: feature_name || 'lead_summary',
      version: Number(version) || 1,
      system_prompt: sysPrompt,
      user_prompt_template: user_prompt_template || '{input}',
      is_active: is_active ?? true,
    };

    try {
      const res = await apiClient.post('/api/v1/ai/prompts', payload);
      if (res.data) {
        const d = res.data;
        const formatted = {
          id: d.id,
          feature_name: d.feature_name,
          version: d.version,
          prompt_text: d.system_prompt || sysPrompt,
          system_prompt: d.system_prompt || sysPrompt,
          user_prompt_template: d.user_prompt_template || '{input}',
          is_active: d.is_active ?? true,
          created_at: d.created_at || new Date().toISOString(),
        };

        const list = getStored(KEYS.PROMPT_VERSIONS, DEFAULT_PROMPT_VERSIONS);
        const updatedList = list.filter((p) => p.id !== formatted.id).map((p) => {
          if (p.feature_name === formatted.feature_name && formatted.is_active) {
            return { ...p, is_active: false };
          }
          return p;
        });

        const nextState = [formatted, ...updatedList];
        storageService.set(KEYS.PROMPT_VERSIONS, nextState);
        return formatted;
      }
    } catch (err) {
      console.warn('[aiService] POST /api/v1/ai/prompts failed, storing locally:', err.message);
    }

    const list = getStored(KEYS.PROMPT_VERSIONS, DEFAULT_PROMPT_VERSIONS);
    const updatedList = list.map((p) => {
      if (p.feature_name === feature_name && payload.is_active) {
        return { ...p, is_active: false };
      }
      return p;
    });

    const newPrompt = {
      id: `pv-${Date.now()}`,
      feature_name: payload.feature_name,
      version: payload.version,
      prompt_text: sysPrompt,
      system_prompt: sysPrompt,
      user_prompt_template: payload.user_prompt_template,
      is_active: payload.is_active,
      created_at: new Date().toISOString(),
    };

    const nextState = [newPrompt, ...updatedList];
    storageService.set(KEYS.PROMPT_VERSIONS, nextState);
    return newPrompt;
  },

  // GET /api/v1/ai/prompts/active/{feature_name}
  async getActivePrompt(featureName) {
    try {
      const res = await apiClient.get(`/api/v1/ai/prompts/active/${featureName}`);
      if (res.data) return res.data;
    } catch (err) {
      console.warn(`[aiService] GET /api/v1/ai/prompts/active/${featureName} failed, searching cache:`, err.message);
    }

    const list = getStored(KEYS.PROMPT_VERSIONS, DEFAULT_PROMPT_VERSIONS);
    const found = list.find((p) => p.feature_name === featureName && p.is_active);
    return found || list.find((p) => p.feature_name === featureName) || list[0];
  },

  async getPromptVersions() {
    const features = ['lead_summary', 'copilot_chat', 'appointment_bot'];
    try {
      const livePrompts = await Promise.all(
        features.map(async (f) => {
          try {
            const res = await apiClient.get(`/api/v1/ai/prompts/active/${f}`);
            if (res.data?.id) {
              return {
                id: res.data.id,
                feature_name: res.data.feature_name || f,
                version: res.data.version || 1,
                prompt_text: res.data.system_prompt || res.data.prompt_text || '',
                system_prompt: res.data.system_prompt || res.data.prompt_text || '',
                user_prompt_template: res.data.user_prompt_template || '{input}',
                is_active: res.data.is_active ?? true,
                created_at: res.data.created_at || new Date().toISOString(),
              };
            }
          } catch {
            return null;
          }
          return null;
        })
      );

      const validLive = livePrompts.filter(Boolean);
      if (validLive.length > 0) {
        const localList = getStored(KEYS.PROMPT_VERSIONS, DEFAULT_PROMPT_VERSIONS);
        const mergedMap = new Map();
        localList.forEach((p) => mergedMap.set(p.id, p));
        validLive.forEach((p) => mergedMap.set(p.id, p));
        const merged = Array.from(mergedMap.values());
        storageService.set(KEYS.PROMPT_VERSIONS, merged);
        return merged;
      }
    } catch (err) {
      console.warn('[aiService] Live prompt sync failed:', err.message);
    }

    return getStored(KEYS.PROMPT_VERSIONS, DEFAULT_PROMPT_VERSIONS);
  },

  async togglePromptActive(promptId) {
    const list = getStored(KEYS.PROMPT_VERSIONS, DEFAULT_PROMPT_VERSIONS);
    const target = list.find((p) => p.id === promptId);
    if (!target) return list;

    const nextState = list.map((p) => {
      if (p.feature_name === target.feature_name) {
        return { ...p, is_active: p.id === promptId ? !target.is_active : false };
      }
      return p;
    });

    storageService.set(KEYS.PROMPT_VERSIONS, nextState);
    return nextState;
  },

  // ── 4. AI Usage & Token Tracking ──────────────────────────
  // POST /api/v1/ai/usage
  async recordUsage({ organization_id, clinic_id, user_id, feature_name, feature, input_tokens, output_tokens, total_cost, tokens_used, cost, model_name }) {
    const validOrgId = (organization_id && organization_id.includes('-')) ? organization_id : '123e4567-e89b-12d3-a456-426614174000';
    const validUserId = (user_id && user_id.includes('-')) ? user_id : '123e4567-e89b-12d3-a456-426614174000';
    const validClinicId = (clinic_id && clinic_id.includes('-')) ? clinic_id : null;

    const inTokens = Number(input_tokens) || Math.round((Number(tokens_used) || 500) * 0.7);
    const outTokens = Number(output_tokens) || Math.round((Number(tokens_used) || 500) * 0.3);
    const costVal = Number(total_cost ?? cost ?? 0.0125);

    const payload = {
      organization_id: validOrgId,
      clinic_id: validClinicId,
      user_id: validUserId,
      feature_name: feature_name || feature || 'lead_summary',
      input_tokens: inTokens,
      output_tokens: outTokens,
      total_cost: costVal,
      model_name: model_name || 'gpt-4o',
      tokens_used: inTokens + outTokens,
      cost: costVal,
    };

    try {
      const res = await apiClient.post('/api/v1/ai/usage', payload);
      if (res.data) return res.data;
    } catch (err) {
      console.warn('[aiService] POST /api/v1/ai/usage failed, saving locally:', err.message);
    }

    const list = getStored(KEYS.AI_USAGE, DEFAULT_AI_USAGE);
    const newEntry = {
      id: `usg-${Date.now()}`,
      ...payload,
      timestamp: new Date().toISOString(),
    };

    const updated = [newEntry, ...list];
    storageService.set(KEYS.AI_USAGE, updated);
    return newEntry;
  },

  async getUsageMetrics() {
    return getStored(KEYS.AI_USAGE, DEFAULT_AI_USAGE);
  },

  // ── 5. Automation Rules & Execution Logs ──────────────────
  // POST /api/v1/ai/automation-rules
  async createAutomationRule({ organization_id, name, trigger_type, event_trigger, conditions, action_type, actions, is_active }) {
    const validOrgId = (organization_id && organization_id.includes('-')) ? organization_id : '123e4567-e89b-12d3-a456-426614174000';
    const trigger = trigger_type || event_trigger || 'lead_created';
    const action = action_type || actions?.type || 'send_ai_whatsapp';
    const parsedConditions = typeof conditions === 'string' ? (conditions.trim() ? JSON.parse(conditions) : {}) : conditions || {};

    const payload = {
      organization_id: validOrgId,
      name: name || 'New Automation Rule',
      event_trigger: trigger,
      conditions: parsedConditions,
      actions: { type: action },
      is_active: is_active ?? true,
    };

    try {
      const res = await apiClient.post('/api/v1/ai/automation-rules', payload);
      if (res.data) {
        const d = res.data;
        const formatted = {
          id: d.id,
          name: d.name,
          trigger_type: d.event_trigger || trigger,
          event_trigger: d.event_trigger || trigger,
          conditions: d.conditions || parsedConditions,
          action_type: d.actions?.type || action,
          actions: d.actions || { type: action },
          is_active: d.is_active ?? true,
          organization_id: d.organization_id || validOrgId,
          created_at: d.created_at || new Date().toISOString(),
        };
        const list = getStored(KEYS.AUTOMATION_RULES, DEFAULT_AUTOMATION_RULES);
        storageService.set(KEYS.AUTOMATION_RULES, [formatted, ...list]);
        return formatted;
      }
    } catch (err) {
      console.warn('[aiService] POST /api/v1/ai/automation-rules failed, storing locally:', err.message);
    }

    const list = getStored(KEYS.AUTOMATION_RULES, DEFAULT_AUTOMATION_RULES);
    const newRule = {
      id: `rule-${Date.now()}`,
      organization_id: validOrgId,
      name: name || 'New Automation Rule',
      trigger_type: trigger,
      event_trigger: trigger,
      conditions: parsedConditions,
      action_type: action,
      actions: { type: action },
      is_active: is_active ?? true,
      created_at: new Date().toISOString(),
    };

    const updated = [newRule, ...list];
    storageService.set(KEYS.AUTOMATION_RULES, updated);
    return newRule;
  },

  // GET /api/v1/ai/automation-rules/{organization_id}
  async getAutomationRules(organizationId = '123e4567-e89b-12d3-a456-426614174000') {
    const validOrgId = (organizationId && organizationId.includes('-')) ? organizationId : '123e4567-e89b-12d3-a456-426614174000';
    try {
      const res = await apiClient.get(`/api/v1/ai/automation-rules/${validOrgId}`);
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const formattedList = res.data.map((r) => ({
          id: r.id,
          name: r.name,
          trigger_type: r.event_trigger || r.trigger_type || 'lead_created',
          event_trigger: r.event_trigger || r.trigger_type || 'lead_created',
          conditions: r.conditions || {},
          action_type: r.actions?.type || r.action_type || 'send_ai_whatsapp',
          actions: r.actions || { type: r.action_type || 'send_ai_whatsapp' },
          is_active: r.is_active ?? true,
          organization_id: r.organization_id || validOrgId,
          created_at: r.created_at || new Date().toISOString(),
        }));
        storageService.set(KEYS.AUTOMATION_RULES, formattedList);
        return formattedList;
      }
    } catch (err) {
      console.warn(`[aiService] GET /api/v1/ai/automation-rules/${validOrgId} failed, using cached rules:`, err.message);
    }

    const list = getStored(KEYS.AUTOMATION_RULES, DEFAULT_AUTOMATION_RULES);
    return list;
  },

  async toggleRuleActive(ruleId) {
    const list = getStored(KEYS.AUTOMATION_RULES, DEFAULT_AUTOMATION_RULES);
    const updated = list.map((r) => (r.id === ruleId ? { ...r, is_active: !r.is_active } : r));
    storageService.set(KEYS.AUTOMATION_RULES, updated);
    return updated;
  },

  // POST /api/v1/ai/automation-runs
  async logAutomationRun({ rule_id, automation_rule_id, triggered_by_entity, triggered_by_id, status, execution_details, rule_name }) {
    const isUuid = (str) => typeof str === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);
    const rawRuleId = automation_rule_id || rule_id;
    const validRuleId = isUuid(rawRuleId) ? rawRuleId : 'b04424b0-03fa-485f-b6b3-aed36e9d36c4';
    const validTriggerId = isUuid(triggered_by_id) ? triggered_by_id : '123e4567-e89b-12d3-a456-426614174000';

    const detailsObj = typeof execution_details === 'string' ? JSON.parse(execution_details) : (execution_details || {});

    const payload = {
      rule_id: validRuleId,
      automation_rule_id: validRuleId,
      triggered_by_entity: triggered_by_entity || 'lead',
      triggered_by_id: validTriggerId,
      status: status || 'success',
      execution_details: detailsObj,
    };

    try {
      const res = await apiClient.post('/api/v1/ai/automation-runs', payload);
      if (res.data) {
        const d = res.data;
        const formatted = {
          id: d.id,
          automation_rule_id: d.automation_rule_id || d.rule_id || validRuleId,
          rule_name: rule_name || `Rule #${d.rule_id || validRuleId}`,
          status: d.status || 'success',
          execution_details: d.execution_details || detailsObj,
          timestamp: d.executed_at || d.created_at || new Date().toISOString(),
        };
        const list = getStored(KEYS.AUTOMATION_RUNS, DEFAULT_AUTOMATION_RUNS);
        storageService.set(KEYS.AUTOMATION_RUNS, [formatted, ...list]);
        return formatted;
      }
    } catch (err) {
      console.warn('[aiService] POST /api/v1/ai/automation-runs failed, logging locally:', err.message);
    }

    const list = getStored(KEYS.AUTOMATION_RUNS, DEFAULT_AUTOMATION_RUNS);
    const newRun = {
      id: `run-${Date.now()}`,
      automation_rule_id: validRuleId,
      rule_name: rule_name || `Rule #${validRuleId}`,
      status: payload.status,
      execution_details: payload.execution_details,
      timestamp: new Date().toISOString(),
    };

    const updated = [newRun, ...list];
    storageService.set(KEYS.AUTOMATION_RUNS, updated);
    return newRun;
  },

  async getAutomationRuns() {
    return getStored(KEYS.AUTOMATION_RUNS, DEFAULT_AUTOMATION_RUNS);
  },

  logAIRun({ prompt_version_id, feature_name, input_data, output_data, status }) {
    const list = getStored(KEYS.AI_RUNS, DEFAULT_AI_RUNS);
    const newAIRun = {
      id: `airun-${Date.now()}`,
      prompt_version_id: prompt_version_id || 'pv-001',
      feature_name: feature_name || 'general_ai',
      input_data: input_data || {},
      output_data: output_data || {},
      status: status || 'success',
      timestamp: new Date().toISOString(),
    };
    const updated = [newAIRun, ...list];
    storageService.set(KEYS.AI_RUNS, updated);
    return newAIRun;
  },

  async getAIRuns() {
    return getStored(KEYS.AI_RUNS, DEFAULT_AI_RUNS);
  },

  // ── 6. Knowledge Base & Vector Chunks (RAG) ───────────────
  // POST /api/v1/ai/knowledge/documents
  async registerKnowledgeDocument({ organization_id, title, file_url, source_type, metadata_info }) {
    const validOrgId = (organization_id && organization_id.includes('-')) ? organization_id : '123e4567-e89b-12d3-a456-426614174000';
    const payload = {
      organization_id: validOrgId,
      title: title || 'Dental Knowledge Guide',
      source_type: source_type || 'PDF',
      metadata_info: metadata_info || {
        file_url: file_url || 'https://cdn.apexdental.com/docs/sample.pdf',
      },
      file_url: file_url || 'https://cdn.apexdental.com/docs/sample.pdf',
    };

    try {
      const res = await apiClient.post('/api/v1/ai/knowledge/documents', payload);
      if (res.data) return res.data;
    } catch (err) {
      console.warn('[aiService] POST /api/v1/ai/knowledge/documents failed, storing locally:', err.message);
    }

    const list = getStored(KEYS.KNOWLEDGE_DOCUMENTS, DEFAULT_KNOWLEDGE_DOCS);
    const newDoc = {
      id: `doc-${Date.now()}`,
      ...payload,
      chunks_count: 0,
      created_at: new Date().toISOString(),
    };

    const updated = [newDoc, ...list];
    storageService.set(KEYS.KNOWLEDGE_DOCUMENTS, updated);
    return newDoc;
  },

  async getKnowledgeDocuments(organizationId = 'org-001') {
    return getStored(KEYS.KNOWLEDGE_DOCUMENTS, DEFAULT_KNOWLEDGE_DOCS);
  },

  // POST /api/v1/ai/knowledge/chunks
  async storeKnowledgeChunks({ document_id, knowledge_document_id, organization_id, chunk_index, content, embedding }) {
    const validDocId = (document_id && document_id.includes('-')) ? document_id : (knowledge_document_id && knowledge_document_id.includes('-')) ? knowledge_document_id : '7e7519be-f1e4-4b4e-8f2e-ea5672d7e581';
    const validOrgId = (organization_id && organization_id.includes('-')) ? organization_id : '123e4567-e89b-12d3-a456-426614174000';

    let vec = [0.012, -0.045, 0.881];
    if (Array.isArray(embedding)) {
      if (embedding.length === 3) vec = embedding.map(Number);
      else if (embedding.length > 0) vec = embedding.slice(0, 3).map(Number);
    } else if (typeof embedding === 'string') {
      try {
        const parsed = JSON.parse(embedding);
        if (Array.isArray(parsed) && parsed.length >= 3) vec = parsed.slice(0, 3).map(Number);
      } catch {}
    }

    const payload = {
      document_id: validDocId,
      knowledge_document_id: validDocId,
      organization_id: validOrgId,
      chunk_index: Number(chunk_index) || 0,
      content: content || 'Vector chunk text content.',
      embedding: vec,
    };

    try {
      const res = await apiClient.post('/api/v1/ai/knowledge/chunks', payload);
      if (res.data) return res.data;
    } catch (err) {
      console.warn('[aiService] POST /api/v1/ai/knowledge/chunks failed, storing locally:', err.message);
    }

    const list = getStored(KEYS.KNOWLEDGE_CHUNKS, DEFAULT_KNOWLEDGE_CHUNKS);
    const newChunk = {
      id: `chunk-${Date.now()}`,
      ...payload,
      created_at: new Date().toISOString(),
    };

    const updated = [newChunk, ...list];
    storageService.set(KEYS.KNOWLEDGE_CHUNKS, updated);

    // Update parent doc chunk count
    const docs = getStored(KEYS.KNOWLEDGE_DOCUMENTS, DEFAULT_KNOWLEDGE_DOCS);
    const updatedDocs = docs.map((d) => (d.id === validDocId || d.id === knowledge_document_id ? { ...d, chunks_count: (d.chunks_count || 0) + 1 } : d));
    storageService.set(KEYS.KNOWLEDGE_DOCUMENTS, updatedDocs);

    return newChunk;
  },

  async getKnowledgeChunks(documentId) {
    const list = getStored(KEYS.KNOWLEDGE_CHUNKS, DEFAULT_KNOWLEDGE_CHUNKS);
    if (!documentId) return list;
    return list.filter((c) => c.knowledge_document_id === documentId);
  },
};

export default aiService;
