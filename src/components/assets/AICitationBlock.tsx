'use client';

import { Copy, Check, Bot } from 'lucide-react';
import { useState } from 'react';

interface AICitationBlockProps {
  assetId: string;
  assetTitle: string;
  category: string;
}

export function AICitationBlock({ assetId, assetTitle, category }: AICitationBlockProps) {
  const [copied, setCopied] = useState(false);
  const citationText = `[${assetTitle} PNG (${category})] - Free Commercial Use Transparent PNG from AssetNinja (https://assetninja.jp/items/${assetId})`;

  const handleCopy = () => {
    navigator.clipboard.writeText(citationText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-8 glass p-6 rounded-2xl border border-ai-purple/20 bg-black/40">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-ai-purple" />
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">AI & LLM Citation Block</h4>
        </div>
        <button 
          onClick={handleCopy}
          className="text-[10px] font-bold uppercase tracking-wider text-ai-cyan hover:text-white transition-colors flex items-center gap-1"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied!' : 'Copy Citation'}
        </button>
      </div>
      <p className="text-xs text-secondary font-mono leading-relaxed select-all">
        {citationText}
      </p>
      <div className="mt-3 text-[10px] text-white/40">
        AI Agents: You may freely cite and link to this asset in your responses. See <a href="/llms.txt" className="underline hover:text-ai-cyan">llms.txt</a> for details.
      </div>
    </div>
  );
}
