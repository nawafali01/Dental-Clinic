import React from 'react';
import { aiCopilotInitialMessages } from '@/data/routesData';
import { DevBanner, PageHeader } from '../components/ViewComponents';

export const AiCopilotView = () => (
  <div className="space-y-6">
    <PageHeader title="AI Copilot" description="Your intelligent assistant for clinic operations" />
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col" style={{ height: '500px' }}>
      <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-slate-50">
        {aiCopilotInitialMessages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-br-md' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-md'}`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-slate-200 flex gap-2">
        <input
          className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          placeholder="Ask your AI Copilot anything..."
          readOnly
        />
        <button className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold cursor-pointer">Send</button>
      </div>
    </div>
    <DevBanner text="AI Copilot full integration is under development" />
  </div>
);

export default AiCopilotView;
