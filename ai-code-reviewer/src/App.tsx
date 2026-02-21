import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import { 
  Code2, 
  Bug, 
  Zap, 
  CheckCircle2, 
  Loader2, 
  Send, 
  Terminal,
  Eraser,
  Copy,
  AlertCircle
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for merging tailwind classes
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [code, setCode] = useState('');
  const [review, setReview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReview = async () => {
    if (!code.trim()) return;

    setIsLoading(true);
    setError(null);
    setReview('');

    try {
      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = 'gemini-3.1-pro-preview';

      const prompt = `You are a senior software engineer. Review the following code:
1. Find bugs
2. Suggest improvements
3. Optimize it
4. Provide refactored code

Code:
\`\`\`
${code}
\`\`\`

Please provide a structured response with clear headings.`;

      const response = await genAI.models.generateContent({
        model,
        contents: [{ parts: [{ text: prompt }] }],
      });

      const text = response.text;
      if (text) {
        setReview(text);
      } else {
        throw new Error('No response from the AI model.');
      }
    } catch (err) {
      console.error('Review error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const clearAll = () => {
    setCode('');
    setReview('');
    setError(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-[#0F1115] text-slate-300 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-[#0F1115]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
              <Code2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-white font-semibold tracking-tight">AI Code Reviewer</h1>
              <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Senior Engineer Protocol v1.0</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={clearAll}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
              title="Clear all"
            >
              <Eraser className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
          {/* Input Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                <Terminal className="w-4 h-4" />
                <span>Source Code</span>
              </div>
              <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">Input Buffer</div>
            </div>
            
            <div className="flex-1 relative group">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your code here for review..."
                className="w-full h-full bg-[#16191F] border border-slate-800 rounded-2xl p-6 font-mono text-sm text-slate-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none placeholder:text-slate-700"
              />
              <button
                onClick={handleReview}
                disabled={isLoading || !code.trim()}
                className={cn(
                  "absolute bottom-4 right-4 px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg",
                  isLoading || !code.trim() 
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                    : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-95"
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Run Review</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Analysis Result</span>
              </div>
              {review && (
                <button 
                  onClick={() => copyToClipboard(review)}
                  className="text-[10px] font-mono text-slate-500 hover:text-emerald-400 uppercase tracking-widest flex items-center gap-1 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  Copy Markdown
                </button>
              )}
            </div>

            <div className="flex-1 bg-[#16191F] border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
              {!review && !isLoading && !error && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                    <Bug className="w-8 h-8 text-slate-600" />
                  </div>
                  <h3 className="text-slate-400 font-medium mb-2">No Analysis Yet</h3>
                  <p className="text-sm text-slate-600 max-w-xs">
                    Paste your code and click "Run Review" to get expert feedback on bugs, performance, and structure.
                  </p>
                </div>
              )}

              {isLoading && !review && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-6" />
                    <Zap className="w-6 h-6 text-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <h3 className="text-white font-medium mb-2">Analyzing Codebase</h3>
                  <p className="text-sm text-slate-500 animate-pulse">
                    Consulting senior engineer protocols...
                  </p>
                </div>
              )}

              {error && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-red-400 font-medium mb-2">Analysis Failed</h3>
                  <p className="text-sm text-slate-600 max-w-xs mb-6">
                    {error}
                  </p>
                  <button 
                    onClick={handleReview}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {review && (
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                  <div className="markdown-body">
                    <ReactMarkdown>{review}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="max-w-7xl mx-auto px-4 py-6 border-t border-slate-900 mt-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span>Engine: Gemini 3.1 Pro</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>Context: Full Analysis</span>
            </div>
          </div>
          <div>
            &copy; 2026 AI Studio Code Reviewer
          </div>
        </div>
      </footer>
    </div>
  );
}
