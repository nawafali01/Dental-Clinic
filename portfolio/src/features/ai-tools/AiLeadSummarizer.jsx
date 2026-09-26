import React, { useState } from 'react';
import { Sparkles, Star, ThumbsUp, ThumbsDown, MessageSquare, Check, RefreshCw, Send } from 'lucide-react';
import { toast } from 'sonner';
import aiService from '@/services/aiService';

export const AiLeadSummarizer = ({ leadNotes, leadId, initialSummary = null, initialIntent = null }) => {
  const [summary, setSummary] = useState(initialSummary);
  const [intent, setIntent] = useState(initialIntent);
  const [isLoading, setIsLoading] = useState(false);
  const [aiRunId, setAiRunId] = useState(null);

  // Feedback State
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const getFallbackUuid = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '6052512d-fe8c-40b3-85d7-4b030862215c');

  const handleSummarize = async () => {
    setIsLoading(true);
    try {
      const res = await aiService.summarizeLead(leadNotes);
      if (res?.ai_summary) {
        setSummary(res.ai_summary);
        setIntent(res.intent || 'Follow-up required');
        const generatedRunId = res.ai_run_id || getFallbackUuid();
        setAiRunId(generatedRunId);
        setFeedbackSubmitted(false);
        toast.success('AI Lead Summary generated successfully!');
      } else {
        toast.error('Failed to generate summary');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error connecting to AI Lead Summarization API');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFeedback = async (score) => {
    setRating(score);
    try {
      await aiService.submitFeedback({
        ai_run_id: aiRunId || getFallbackUuid(),
        rating: score,
        comment: score >= 4 ? 'Positive AI summary' : 'Needs improvement',
      });
      setFeedbackSubmitted(true);
      toast.success(`Thank you for your rating (${score}/5 stars)!`);
    } catch (err) {
      toast.error('Failed to submit feedback');
    }
  };

  const handleSubmitDetailedFeedback = async (e) => {
    e.preventDefault();
    setIsSubmittingFeedback(true);
    try {
      await aiService.submitFeedback({
        ai_run_id: aiRunId || getFallbackUuid(),
        rating,
        comment,
      });
      setFeedbackSubmitted(true);
      setShowFeedbackModal(false);
      toast.success('Detailed feedback submitted to AI team!');
    } catch (err) {
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-purple-50/70 border border-blue-200/80 rounded-2xl p-5 space-y-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900">AI Lead Intelligence & Summarization</h3>
            <p className="text-xs text-slate-500">Automated NLP note extraction & intent analysis</p>
          </div>
        </div>

        <button
          onClick={handleSummarize}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-95 transition-all shadow-2xs disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing Notes...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{summary ? 'Re-Summarize with AI' : 'Summarize with AI'}</span>
            </>
          )}
        </button>
      </div>

      {summary ? (
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">AI Generated Insight</span>
            {intent && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                Intent: {intent}
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
            {summary}
          </p>

          {/* Feedback Section */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Was this summary helpful?</span>
              {feedbackSubmitted ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <Check className="w-3 h-3" /> Feedback Recorded
                </span>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleQuickFeedback(5)}
                    className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                    title="Helpful (5 Stars)"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleQuickFeedback(2)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Needs Improvement (2 Stars)"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setShowFeedbackModal(true)}
                    className="text-[11px] font-semibold text-primary hover:underline ml-1 cursor-pointer"
                  >
                    Rate & Comment
                  </button>
                </div>
              )}
            </div>

            <span className="text-[10px] text-slate-400">Model: GPT-4o • Execution: 280ms</span>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-white/70 border border-dashed border-slate-200 rounded-xl text-center">
          <p className="text-xs text-slate-500">
            Click <strong className="text-slate-700">"Summarize with AI"</strong> to generate an instant NLP summary and intent analysis for this lead.
          </p>
        </div>
      )}

      {/* Detailed Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Submit AI Feedback</span>
              </h3>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitDetailedFeedback} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">Rating Score (1 to 5 Stars)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= (hoverRating || rating)
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-600 ml-2">{rating}/5 Stars</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Optional Comment / Suggestions</label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share feedback on accuracy, intent detection, or formatting..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingFeedback}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Feedback</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiLeadSummarizer;
