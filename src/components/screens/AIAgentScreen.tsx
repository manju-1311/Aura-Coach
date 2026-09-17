import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  FileText,
  Upload,
  BookOpen,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Plus,
  HelpCircle,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  Flame,
  Brain,
  Layers,
  FileUp,
  Trash2,
  ListTodo,
  ExternalLink,
  History,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext.js';
import {
  AgentOutputMode,
  AgentExecutionResponse,
  AgentMockQuestion,
  AgentFlashcard,
} from '../../types.js';

const SAMPLE_NOTES = {
  os: `Operating Systems - Concurrency & Deadlocks:
A race condition occurs when multiple processes access and manipulate shared data concurrently, and the outcome depends on the execution order.
Critical Section Problem requires: 1) Mutual Exclusion, 2) Progress, 3) Bounded Waiting.
Deadlock occurs when every process in a set is waiting for an event caused by another process in the set.
The 4 Coffman Conditions for Deadlock:
1. Mutual Exclusion: At least one resource must be held in non-shareable mode.
2. Hold and Wait: A process holds resources while waiting for additional ones.
3. No Preemption: Resources cannot be confiscated; released only voluntarily.
4. Circular Wait: P0 waits for P1, P1 waits for P2 ... Pn waits for P0.
Deadlock Prevention: Invalidate at least one Coffman condition (e.g. total resource ordering prevents circular wait).
Deadlock Avoidance: Banker's Algorithm dynamically tests safe states before allocating resources.`,

  dp: `Dynamic Programming & Memoization:
Dynamic Programming is an optimization over plain recursion where subproblems overlap.
Two Core Properties:
1. Optimal Substructure: Optimal solution of the problem contains optimal solutions to subproblems.
2. Overlapping Subproblems: The same subproblems are solved repeatedly.
Approaches:
- Top-Down (Memoization): Recursive + Hash map/array cache. Solves subproblems on-demand (lazy). Call stack space O(N).
- Bottom-Up (Tabulation): Iterative + Table fill. Solves all subproblems in topological order (eager). Eliminates recursion stack overhead.
State Transition Example (0/1 Knapsack):
dp[i][w] = max(dp[i-1][w], val[i-1] + dp[i-1][w - wt[i-1]]) if wt[i-1] <= w else dp[i-1][w].
Space Optimization: Can reduce 2D table to 1D array if each row only depends on the previous row.`,

  trees: `Binary Search Trees & Graph Algorithms:
BST Property: For every node X, left sub-tree values < X.val and right sub-tree values > X.val.
Inorder traversal of a BST always yields sorted order in O(N) time.
Self-Balancing Trees (AVL, Red-Black): Guarantee O(log N) height via rotations.
Graph Traversals:
- BFS: Uses Queue (FIFO). Finds shortest path in unweighted graphs. Time: O(V + E), Space: O(V).
- DFS: Uses Stack / Recursion (LIFO). Used for topological sort, cycle detection, strongly connected components.
Cycle Detection: In directed graphs, a back-edge in DFS recursion stack indicates a cycle.`,
};

export const AIAgentScreen: React.FC = () => {
  const { currentTheme, addTask, setActiveTab } = useApp();

  // Mode Selection
  const [selectedMode, setSelectedMode] = useState<AgentOutputMode>('mock_test');
  const [depth, setDepth] = useState<'quick' | 'standard' | 'mastery'>('standard');

  // Input states
  const [notesText, setNotesText] = useState('');
  const [userPrompt, setUserPrompt] = useState('Generate a 4-question diagnostic mock test with detailed explanations');
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string; base64?: string } | null>(null);

  // Execution & Output states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [agentResult, setAgentResult] = useState<AgentExecutionResponse | null>(null);
  const [activeOutputTab, setActiveOutputTab] = useState<'test' | 'summary' | 'flashcards' | 'tasks'>('test');

  // Interactive Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showAnswerExplanation, setShowAnswerExplanation] = useState<Record<number, boolean>>({});
  const [quizFinished, setQuizFinished] = useState(false);

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [cardMastery, setCardMastery] = useState<Record<string, 'mastered' | 'review'>>({});

  // UI helpers
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [addedTasks, setAddedTasks] = useState<Record<string, boolean>>({});
  const [showHistory, setShowHistory] = useState(false);
  const [savedSessions, setSavedSessions] = useState<AgentExecutionResponse[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch saved sessions on mount
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('aura_coach_token') || localStorage.getItem('aura_auth_token');
      const res = await fetch('/api/agent/sessions', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.sessions)) {
        setSavedSessions(data.sessions);
      }
    } catch (e) {
      console.warn('Failed to fetch sessions:', e);
    }
  };

  // Handle preset prompt changes when mode changes
  const handleModeChange = (mode: AgentOutputMode) => {
    setSelectedMode(mode);
    if (mode === 'mock_test') {
      setUserPrompt('Generate an interactive 4-question mock test with explanations');
      setActiveOutputTab('test');
    } else if (mode === 'summary') {
      setUserPrompt('Summarize key concepts, formulas, and common exam pitfalls');
      setActiveOutputTab('summary');
    } else if (mode === 'flashcards') {
      setUserPrompt('Create 6 active-recall flashcards for spaced repetition memorization');
      setActiveOutputTab('flashcards');
    } else {
      setUserPrompt('Synthesize this topic into a comprehensive study breakdown with actionable next steps');
    }
  };

  // File Upload Handlers
  const handleFileUpload = (file: File) => {
    const sizeInKb = Math.round(file.size / 1024);
    const sizeStr = sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(1)} MB` : `${sizeInKb} KB`;

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setAttachedFile({ name: file.name, size: sizeStr, base64 });
      };
      reader.readAsDataURL(file);
    } else if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        setNotesText((prev) => (prev ? `${prev}\n\n[Attached: ${file.name}]\n${text}` : text));
        setAttachedFile({ name: file.name, size: sizeStr });
      };
      reader.readAsText(file);
    } else {
      setAttachedFile({ name: file.name, size: sizeStr });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Execute Agent
  const handleRunAgent = async () => {
    if (!notesText.trim() && !attachedFile && !userPrompt.trim()) {
      return;
    }

    setIsGenerating(true);
    setGenerationStep('Ingesting notes and documents...');
    setUserAnswers({});
    setShowAnswerExplanation({});
    setQuizFinished(false);
    setCurrentQuestionIndex(0);
    setCurrentCardIndex(0);
    setIsCardFlipped(false);

    try {
      const token = localStorage.getItem('aura_coach_token') || localStorage.getItem('aura_auth_token');

      const stepTimer1 = setTimeout(() => {
        setGenerationStep('Deconstructing topics & concepts...');
      }, 700);

      const stepTimer2 = setTimeout(() => {
        setGenerationStep('Synthesizing high-yield study artifacts...');
      }, 1500);

      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          notes: notesText,
          pdfBase64: attachedFile?.base64,
          fileName: attachedFile?.name,
          userPrompt,
          mode: selectedMode,
          depth,
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      const data = await res.json();
      if (data.success && data.result) {
        setAgentResult(data.result);
        if (data.result.mode === 'mock_test' || data.result.mockTest) {
          setActiveOutputTab('test');
        } else if (data.result.mode === 'summary' || data.result.summary) {
          setActiveOutputTab('summary');
        } else if (data.result.mode === 'flashcards' || data.result.flashcards) {
          setActiveOutputTab('flashcards');
        } else {
          setActiveOutputTab('summary');
        }

        // Add to saved sessions list
        setSavedSessions((prev) => [data.result, ...prev]);

        // Celebrate generation
        try {
          confetti({
            particleCount: 30,
            spread: 50,
            origin: { y: 0.6 },
          });
        } catch (e) {}
      }
    } catch (err) {
      console.error('Agent run failed:', err);
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  // Add Task to Today's Queue
  const handleAddSuggestedTask = async (taskTitle: string, duration: number, tag: string) => {
    try {
      await addTask(taskTitle, tag, duration, 'medium', true);
      setAddedTasks((prev) => ({ ...prev, [taskTitle]: true }));
      try {
        confetti({
          particleCount: 20,
          spread: 40,
          origin: { y: 0.7 },
        });
      } catch (e) {}
    } catch (e) {
      console.warn('Failed to add task:', e);
    }
  };

  // Quiz Answer Selection
  const handleSelectAnswer = (qIndex: number, optionIdx: number) => {
    if (userAnswers[qIndex] !== undefined) return; // Prevent changing after selection
    setUserAnswers((prev) => ({ ...prev, [qIndex]: optionIdx }));
    setShowAnswerExplanation((prev) => ({ ...prev, [qIndex]: true }));
  };

  // Compute Quiz Score
  const calculateScore = () => {
    if (!agentResult?.mockTest) return { correct: 0, total: 0, pct: 0 };
    const questions = agentResult.mockTest.questions;
    let correct = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswerIndex) {
        correct++;
      }
    });
    const pct = Math.round((correct / questions.length) * 100);
    return { correct, total: questions.length, pct };
  };

  // Copy Summary to Clipboard
  const handleCopySummary = () => {
    if (!agentResult?.summary) return;
    const text = `# ${agentResult.summary.title}\n\n${agentResult.summary.executiveSummary}\n\n## Key Concepts\n${agentResult.summary.coreConcepts.map((c) => `### ${c.name}\n${c.description}\n${c.exampleOrFormula ? `Example/Formula: ${c.exampleOrFormula}\n` : ''}`).join('\n')}\n\n## Common Pitfalls\n${agentResult.summary.pitfallsToAvoid?.join('\n') || ''}`;
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div
      className="flex-1 flex flex-col px-4 pt-3 pb-20 min-h-full transition-colors"
      style={{
        backgroundColor: currentTheme.bgBase,
        color: currentTheme.textPrimary,
      }}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b mb-4" style={{ borderColor: currentTheme.borderBase }}>
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center border shadow-sm"
            style={{
              backgroundColor: currentTheme.accentTint,
              borderColor: currentTheme.accentPrimary,
              color: currentTheme.accentPrimary,
            }}
          >
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight" style={{ color: currentTheme.textPrimary }}>
                Aura Study Agent
              </h1>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: currentTheme.accentTint,
                  color: currentTheme.accentText,
                  border: `1px solid ${currentTheme.accentPrimary}`,
                }}
              >
                Agentic AI
              </span>
            </div>
            <p className="text-[11px]" style={{ color: currentTheme.textMuted }}>
              Ingest lecture notes & PDFs for smart testing & active recall
            </p>
          </div>
        </div>

        {/* History Toggle */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer hover:opacity-80"
          style={{
            backgroundColor: showHistory ? currentTheme.accentTint : currentTheme.bgSurface,
            borderColor: showHistory ? currentTheme.accentPrimary : currentTheme.borderBase,
            color: showHistory ? currentTheme.accentText : currentTheme.textSecondary,
          }}
          title="Past Agent Sessions"
        >
          <History className="w-4 h-4" />
          <span className="text-[11px] hidden sm:inline">History</span>
        </button>
      </div>

      {/* Saved Sessions Drawer */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4 border rounded-xl p-3 space-y-2 shadow-lg"
            style={{
              backgroundColor: currentTheme.bgSurface,
              borderColor: currentTheme.borderBase,
            }}
          >
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: currentTheme.borderBase }}>
              <span className="text-xs font-bold" style={{ color: currentTheme.textPrimary }}>
                Saved Study Sessions ({savedSessions.length})
              </span>
              <button
                onClick={() => setShowHistory(false)}
                className="text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Close
              </button>
            </div>

            {savedSessions.length === 0 ? (
              <p className="text-xs py-3 text-center" style={{ color: currentTheme.textMuted }}>
                No past sessions saved yet. Run your first study agent session below!
              </p>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {savedSessions.map((session) => (
                  <div
                    key={session.sessionId}
                    onClick={() => {
                      setAgentResult(session);
                      setShowHistory(false);
                      if (session.mockTest) setActiveOutputTab('test');
                      else if (session.summary) setActiveOutputTab('summary');
                      else if (session.flashcards) setActiveOutputTab('flashcards');
                    }}
                    className="p-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors hover:opacity-80"
                    style={{
                      backgroundColor: currentTheme.bgElevated,
                      borderColor: currentTheme.borderBase,
                    }}
                  >
                    <div className="truncate pr-2">
                      <div className="font-semibold truncate" style={{ color: currentTheme.textPrimary }}>
                        {session.mockTest?.title || session.summary?.title || session.flashcards?.deckTitle || session.userPrompt}
                      </div>
                      <div className="text-[10px] mt-0.5 flex items-center gap-2" style={{ color: currentTheme.textMuted }}>
                        <span className="capitalize font-mono">
                          {session.mode.replace('_', ' ')}
                        </span>
                        <span>•</span>
                        <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: currentTheme.accentPrimary }} />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl border mb-3 shadow-inner" style={{ backgroundColor: currentTheme.bgElevated, borderColor: currentTheme.borderBase }}>
        {[
          { id: 'mock_test', label: 'Mock Test', icon: HelpCircle },
          { id: 'summary', label: 'Summary', icon: BookOpen },
          { id: 'flashcards', label: 'Flashcards', icon: Layers },
          { id: 'custom', label: 'Custom', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = selectedMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleModeChange(tab.id as AgentOutputMode)}
              className="flex flex-col sm:flex-row items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              style={{
                backgroundColor: isSelected ? currentTheme.accentPrimary : 'transparent',
                color: isSelected ? '#FFFFFF' : currentTheme.textSecondary,
                boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="text-[11px] truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input Section Card */}
      <div
        className="rounded-2xl border p-4 space-y-3.5 shadow-sm mb-4 transition-colors"
        style={{
          backgroundColor: currentTheme.bgSurface,
          borderColor: currentTheme.borderBase,
        }}
      >
        {/* Row: Notes Label & Quick Samples */}
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold flex items-center gap-1.5" style={{ color: currentTheme.textPrimary }}>
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>Lecture Notes or Topic Text</span>
          </label>
          <div className="flex items-center gap-1">
            <span className="text-[10px]" style={{ color: currentTheme.textMuted }}>
              Quick Presets:
            </span>
            <button
              onClick={() => {
                setNotesText(SAMPLE_NOTES.os);
                setUserPrompt('Generate a 4-question mock test on deadlock prevention and Coffman conditions');
              }}
              className="px-1.5 py-0.5 rounded text-[10px] font-medium border hover:opacity-80 cursor-pointer"
              style={{
                backgroundColor: currentTheme.bgElevated,
                borderColor: currentTheme.borderBase,
                color: currentTheme.textSecondary,
              }}
            >
              OS Deadlocks
            </button>
            <button
              onClick={() => {
                setNotesText(SAMPLE_NOTES.dp);
                setUserPrompt('Synthesize dynamic programming memoization vs tabulation with memory trade-offs');
              }}
              className="px-1.5 py-0.5 rounded text-[10px] font-medium border hover:opacity-80 cursor-pointer"
              style={{
                backgroundColor: currentTheme.bgElevated,
                borderColor: currentTheme.borderBase,
                color: currentTheme.textSecondary,
              }}
            >
              DP Memo
            </button>
            <button
              onClick={() => {
                setNotesText(SAMPLE_NOTES.trees);
                setUserPrompt('Create active recall flashcards for BST and Graph BFS/DFS traversal');
              }}
              className="px-1.5 py-0.5 rounded text-[10px] font-medium border hover:opacity-80 cursor-pointer"
              style={{
                backgroundColor: currentTheme.bgElevated,
                borderColor: currentTheme.borderBase,
                color: currentTheme.textSecondary,
              }}
            >
              BST & Graphs
            </button>
          </div>
        </div>

        {/* Text Area */}
        <div className="relative">
          <textarea
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            placeholder="Paste syllabus chapters, study notes, lecture transcripts, code snippets, or formulas here..."
            rows={4}
            className="w-full text-xs p-3 rounded-xl border focus:outline-none transition-all resize-none leading-relaxed"
            style={{
              backgroundColor: currentTheme.bgInput,
              borderColor: currentTheme.borderBase,
              color: currentTheme.textPrimary,
            }}
          />
          {notesText && (
            <button
              onClick={() => setNotesText('')}
              className="absolute right-2.5 bottom-3 text-[10px] px-1.5 py-0.5 rounded border text-rose-400 hover:text-rose-300 cursor-pointer"
              style={{ backgroundColor: currentTheme.bgElevated, borderColor: currentTheme.borderBase }}
            >
              Clear
            </button>
          )}
        </div>

        {/* PDF & Document Dropzone */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
            accept=".pdf,.txt,.md,.doc,.docx"
            className="hidden"
          />

          {attachedFile ? (
            <div
              className="flex items-center justify-between p-2.5 rounded-xl border"
              style={{
                backgroundColor: currentTheme.bgElevated,
                borderColor: currentTheme.accentPrimary,
              }}
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center border"
                  style={{
                    backgroundColor: currentTheme.accentTint,
                    borderColor: currentTheme.accentPrimary,
                    color: currentTheme.accentPrimary,
                  }}
                >
                  <FileUp className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold truncate" style={{ color: currentTheme.textPrimary }}>
                    {attachedFile.name}
                  </p>
                  <p className="text-[10px]" style={{ color: currentTheme.textMuted }}>
                    {attachedFile.size} • Attached for multimodal analysis
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAttachedFile(null)}
                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                title="Remove attached file"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-3 flex items-center justify-center gap-2.5 cursor-pointer transition-all ${
                isDragging ? 'scale-[1.01]' : 'hover:opacity-90'
              }`}
              style={{
                backgroundColor: isDragging ? currentTheme.accentTint : currentTheme.bgElevated,
                borderColor: isDragging ? currentTheme.accentPrimary : currentTheme.borderBase,
              }}
            >
              <Upload className="w-4 h-4 text-indigo-400" />
              <div className="text-center">
                <span className="text-xs font-semibold" style={{ color: currentTheme.textPrimary }}>
                  Attach PDF or Lecture Document
                </span>
                <span className="text-[10px] ml-1.5" style={{ color: currentTheme.textMuted }}>
                  (drag & drop or click)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Specific Result / Prompt Box */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold flex items-center gap-1.5" style={{ color: currentTheme.textPrimary }}>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Specific Result You Want in Prompt Box:</span>
          </label>
          <input
            type="text"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="e.g., Give me 5 mock test questions with explanations, or summarize key formulas..."
            className="w-full text-xs px-3 py-2.5 rounded-xl border focus:outline-none transition-colors"
            style={{
              backgroundColor: currentTheme.bgInput,
              borderColor: currentTheme.borderBase,
              color: currentTheme.textPrimary,
            }}
          />
        </div>

        {/* Depth / Speed & Run Agent Button */}
        <div className="flex items-center justify-between pt-1 gap-2">
          {/* Depth selector */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-semibold" style={{ color: currentTheme.textMuted }}>
              Depth:
            </span>
            {(['quick', 'standard', 'mastery'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setDepth(lvl)}
                className="px-2 py-0.5 rounded text-[10px] font-semibold capitalize border transition-colors cursor-pointer"
                style={{
                  backgroundColor: depth === lvl ? currentTheme.accentPrimary : currentTheme.bgElevated,
                  borderColor: depth === lvl ? currentTheme.accentPrimary : currentTheme.borderBase,
                  color: depth === lvl ? '#FFFFFF' : currentTheme.textSecondary,
                }}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Primary Action Button */}
          <button
            onClick={handleRunAgent}
            disabled={isGenerating || (!notesText.trim() && !attachedFile && !userPrompt.trim())}
            className="px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98]"
            style={{
              backgroundColor: currentTheme.accentPrimary,
              color: '#FFFFFF',
            }}
          >
            {isGenerating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="truncate">{generationStep || 'Synthesizing...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 fill-white" />
                <span>Run Agentic Synthesis</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Output Results Section */}
      {agentResult && (
        <div className="space-y-3">
          {/* Agent Thought Plan Banner */}
          <div
            className="rounded-xl border p-3 text-xs space-y-1"
            style={{
              backgroundColor: currentTheme.accentTint,
              borderColor: currentTheme.accentPrimary,
              color: currentTheme.accentText,
            }}
          >
            <div className="flex items-center gap-1.5 font-bold">
              <Brain className="w-3.5 h-3.5" />
              <span>Agent Autonomous Reasoning Plan:</span>
            </div>
            <p className="text-[11px] leading-relaxed opacity-90 whitespace-pre-line font-mono">
              {agentResult.agentThoughtPlan}
            </p>
          </div>

          {/* Output Mode Switcher Pill */}
          <div
            className="flex items-center gap-2 border-b pb-2 overflow-x-auto"
            style={{ borderColor: currentTheme.borderBase }}
          >
            {agentResult.mockTest && (
              <button
                onClick={() => setActiveOutputTab('test')}
                className="px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                style={{
                  backgroundColor: activeOutputTab === 'test' ? currentTheme.accentPrimary : 'transparent',
                  color: activeOutputTab === 'test' ? '#FFFFFF' : currentTheme.textSecondary,
                }}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Mock Test ({agentResult.mockTest.questions.length})</span>
              </button>
            )}

            {agentResult.summary && (
              <button
                onClick={() => setActiveOutputTab('summary')}
                className="px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                style={{
                  backgroundColor: activeOutputTab === 'summary' ? currentTheme.accentPrimary : 'transparent',
                  color: activeOutputTab === 'summary' ? '#FFFFFF' : currentTheme.textSecondary,
                }}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Summary & Traps</span>
              </button>
            )}

            {agentResult.flashcards && (
              <button
                onClick={() => setActiveOutputTab('flashcards')}
                className="px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                style={{
                  backgroundColor: activeOutputTab === 'flashcards' ? currentTheme.accentPrimary : 'transparent',
                  color: activeOutputTab === 'flashcards' ? '#FFFFFF' : currentTheme.textSecondary,
                }}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Flashcards ({agentResult.flashcards.cards.length})</span>
              </button>
            )}

            {agentResult.suggestedTasks && agentResult.suggestedTasks.length > 0 && (
              <button
                onClick={() => setActiveOutputTab('tasks')}
                className="px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                style={{
                  backgroundColor: activeOutputTab === 'tasks' ? currentTheme.accentPrimary : 'transparent',
                  color: activeOutputTab === 'tasks' ? '#FFFFFF' : currentTheme.textSecondary,
                }}
              >
                <ListTodo className="w-3.5 h-3.5" />
                <span>Study Sprints ({agentResult.suggestedTasks.length})</span>
              </button>
            )}
          </div>

          {/* 1. MOCK TEST INTERACTIVE VIEW */}
          {activeOutputTab === 'test' && agentResult.mockTest && (
            <div
              className="rounded-2xl border p-4 space-y-4 shadow-sm"
              style={{
                backgroundColor: currentTheme.bgSurface,
                borderColor: currentTheme.borderBase,
              }}
            >
              {/* Test Header */}
              <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: currentTheme.borderBase }}>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: currentTheme.textPrimary }}>
                    {agentResult.mockTest.title}
                  </h3>
                  <p className="text-[11px]" style={{ color: currentTheme.textMuted }}>
                    {agentResult.mockTest.instructions || 'Select the correct option to test your understanding'}
                  </p>
                </div>

                {/* Score badge */}
                <div
                  className="px-2.5 py-1 rounded-full border text-xs font-bold"
                  style={{
                    backgroundColor: currentTheme.accentTint,
                    borderColor: currentTheme.accentPrimary,
                    color: currentTheme.accentText,
                  }}
                >
                  Score: {calculateScore().correct} / {calculateScore().total} ({calculateScore().pct}%)
                </div>
              </div>

              {/* Question Navigation dots */}
              <div className="flex items-center gap-1.5 justify-center py-1">
                {agentResult.mockTest.questions.map((q, idx) => {
                  const answered = userAnswers[idx] !== undefined;
                  const isCorrect = userAnswers[idx] === q.correctAnswerIndex;
                  const isCurrent = currentQuestionIndex === idx;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`w-7 h-7 rounded-full border text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                        isCurrent ? 'ring-2 ring-indigo-400 scale-105' : ''
                      }`}
                      style={{
                        backgroundColor: !answered
                          ? currentTheme.bgElevated
                          : isCorrect
                          ? 'rgba(16, 185, 129, 0.2)'
                          : 'rgba(239, 68, 68, 0.2)',
                        borderColor: !answered
                          ? currentTheme.borderBase
                          : isCorrect
                          ? '#10B981'
                          : '#EF4444',
                        color: !answered
                          ? currentTheme.textSecondary
                          : isCorrect
                          ? '#10B981'
                          : '#EF4444',
                      }}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Current Question Body */}
              {agentResult.mockTest.questions[currentQuestionIndex] && (() => {
                const currentQ = agentResult.mockTest.questions[currentQuestionIndex];
                const selectedOption = userAnswers[currentQuestionIndex];
                const hasAnswered = selectedOption !== undefined;

                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                        QUESTION {currentQuestionIndex + 1} OF {agentResult.mockTest.questions.length}
                      </span>
                      {currentQ.difficulty && (
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                          style={{
                            backgroundColor: currentTheme.bgElevated,
                            color: currentTheme.accentPrimary,
                          }}
                        >
                          {currentQ.difficulty}
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-semibold leading-relaxed" style={{ color: currentTheme.textPrimary }}>
                      {currentQ.question}
                    </h4>

                    {/* Options */}
                    <div className="space-y-2 pt-1">
                      {currentQ.options.map((opt, optIdx) => {
                        const isChosen = selectedOption === optIdx;
                        const isRightAnswer = currentQ.correctAnswerIndex === optIdx;

                        let optBg = currentTheme.bgElevated;
                        let optBorder = currentTheme.borderBase;
                        let optColor = currentTheme.textPrimary;

                        if (hasAnswered) {
                          if (isRightAnswer) {
                            optBg = 'rgba(16, 185, 129, 0.15)';
                            optBorder = '#10B981';
                            optColor = '#10B981';
                          } else if (isChosen && !isRightAnswer) {
                            optBg = 'rgba(239, 68, 68, 0.15)';
                            optBorder = '#EF4444';
                            optColor = '#EF4444';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectAnswer(currentQuestionIndex, optIdx)}
                            className="w-full text-left p-3 rounded-xl border text-xs font-medium flex items-start gap-2.5 transition-all cursor-pointer hover:opacity-90"
                            style={{
                              backgroundColor: optBg,
                              borderColor: optBorder,
                              color: optColor,
                            }}
                          >
                            <span
                              className="w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-bold flex-shrink-0 border"
                              style={{
                                backgroundColor: currentTheme.bgSurface,
                                borderColor: optBorder,
                              }}
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="flex-1 leading-relaxed">{opt}</span>
                            {hasAnswered && isRightAnswer && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                            {hasAnswered && isChosen && !isRightAnswer && (
                              <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation Reveal */}
                    {hasAnswered && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-xl border text-xs space-y-1"
                        style={{
                          backgroundColor: currentTheme.bgElevated,
                          borderColor: currentTheme.borderBase,
                        }}
                      >
                        <div className="font-bold flex items-center gap-1.5" style={{ color: currentTheme.accentPrimary }}>
                          <Check className="w-3.5 h-3.5" />
                          <span>Detailed Explanation & Rationale:</span>
                        </div>
                        <p className="text-[11px] leading-relaxed" style={{ color: currentTheme.textSecondary }}>
                          {currentQ.explanation}
                        </p>
                      </motion.div>
                    )}

                    {/* Next/Prev Navigation */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-30"
                        style={{
                          backgroundColor: currentTheme.bgElevated,
                          borderColor: currentTheme.borderBase,
                          color: currentTheme.textSecondary,
                        }}
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Previous</span>
                      </button>

                      {currentQuestionIndex < agentResult.mockTest.questions.length - 1 ? (
                        <button
                          onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                          className="px-3 py-1.5 rounded-lg text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          style={{ backgroundColor: currentTheme.accentPrimary }}
                        >
                          <span>Next</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setQuizFinished(true);
                            try {
                              confetti({ particleCount: 50, spread: 60 });
                            } catch (e) {}
                          }}
                          className="px-3 py-1.5 rounded-lg text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          style={{ backgroundColor: '#10B981' }}
                        >
                          <span>Finish & Claim XP</span>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* 2. SUMMARY & KEY CONCEPTS VIEW */}
          {activeOutputTab === 'summary' && agentResult.summary && (
            <div
              className="rounded-2xl border p-4 space-y-4 shadow-sm"
              style={{
                backgroundColor: currentTheme.bgSurface,
                borderColor: currentTheme.borderBase,
              }}
            >
              <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: currentTheme.borderBase }}>
                <h3 className="text-sm font-bold" style={{ color: currentTheme.textPrimary }}>
                  {agentResult.summary.title}
                </h3>
                <button
                  onClick={handleCopySummary}
                  className="px-2.5 py-1 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer hover:opacity-80"
                  style={{
                    backgroundColor: currentTheme.bgElevated,
                    borderColor: currentTheme.borderBase,
                    color: currentTheme.textSecondary,
                  }}
                >
                  {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSummary ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Executive Summary */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  EXECUTIVE OVERVIEW
                </span>
                <p className="text-xs leading-relaxed" style={{ color: currentTheme.textSecondary }}>
                  {agentResult.summary.executiveSummary}
                </p>
              </div>

              {/* Core Concepts */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  CORE PRINCIPLES & FORMULAS
                </span>
                {agentResult.summary.coreConcepts.map((concept, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border space-y-1.5 text-xs"
                    style={{
                      backgroundColor: currentTheme.bgElevated,
                      borderColor: currentTheme.borderBase,
                    }}
                  >
                    <div className="font-bold" style={{ color: currentTheme.textPrimary }}>
                      {concept.name}
                    </div>
                    <p className="text-[11px] leading-relaxed" style={{ color: currentTheme.textSecondary }}>
                      {concept.description}
                    </p>
                    {concept.exampleOrFormula && (
                      <div
                        className="p-2 rounded-lg text-[10px] font-mono border"
                        style={{
                          backgroundColor: currentTheme.bgInput,
                          borderColor: currentTheme.borderBase,
                          color: currentTheme.accentPrimary,
                        }}
                      >
                        {concept.exampleOrFormula}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Common Pitfalls & Traps */}
              {agentResult.summary.pitfallsToAvoid && agentResult.summary.pitfallsToAvoid.length > 0 && (
                <div
                  className="p-3 rounded-xl border space-y-1.5 text-xs"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                  }}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                    COMMON EXAM PITFALLS & MISCONCEPTIONS
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-[11px]" style={{ color: currentTheme.textSecondary }}>
                    {agentResult.summary.pitfallsToAvoid.map((pitfall, idx) => (
                      <li key={idx}>{pitfall}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Viva & Interview Questions */}
              {agentResult.summary.vivaOrInterviewQuestions && agentResult.summary.vivaOrInterviewQuestions.length > 0 && (
                <div
                  className="p-3 rounded-xl border space-y-1.5 text-xs"
                  style={{
                    backgroundColor: currentTheme.bgElevated,
                    borderColor: currentTheme.borderBase,
                  }}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    HIGH-FREQUENCY INTERVIEW / VIVA QUESTIONS
                  </span>
                  <ul className="list-decimal list-inside space-y-1 text-[11px]" style={{ color: currentTheme.textSecondary }}>
                    {agentResult.summary.vivaOrInterviewQuestions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* 3. FLASHCARDS ACTIVE RECALL VIEW */}
          {activeOutputTab === 'flashcards' && agentResult.flashcards && (
            <div
              className="rounded-2xl border p-4 space-y-4 shadow-sm"
              style={{
                backgroundColor: currentTheme.bgSurface,
                borderColor: currentTheme.borderBase,
              }}
            >
              <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: currentTheme.borderBase }}>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: currentTheme.textPrimary }}>
                    {agentResult.flashcards.deckTitle}
                  </h3>
                  <p className="text-[10px]" style={{ color: currentTheme.textMuted }}>
                    Card {currentCardIndex + 1} of {agentResult.flashcards.cards.length} • Tap to flip
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-emerald-400">
                    {Object.values(cardMastery).filter((s) => s === 'mastered').length} Mastered
                  </span>
                </div>
              </div>

              {/* Flashcard 3D Card */}
              {agentResult.flashcards.cards[currentCardIndex] && (() => {
                const card = agentResult.flashcards.cards[currentCardIndex];
                return (
                  <div
                    onClick={() => setIsCardFlipped(!isCardFlipped)}
                    className="min-h-[190px] p-5 rounded-2xl border flex flex-col justify-between items-center text-center cursor-pointer transition-all duration-300 shadow-md active:scale-[0.99]"
                    style={{
                      backgroundColor: isCardFlipped ? currentTheme.bgElevated : currentTheme.bgInput,
                      borderColor: isCardFlipped ? currentTheme.accentPrimary : currentTheme.borderBase,
                    }}
                  >
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: currentTheme.accentPrimary }}
                    >
                      {isCardFlipped ? 'ANSWER / CORE CONCEPT' : 'QUESTION / PROMPT'}
                    </span>

                    <div className="my-auto">
                      <p className="text-sm font-semibold leading-relaxed" style={{ color: currentTheme.textPrimary }}>
                        {isCardFlipped ? card.back : card.front}
                      </p>
                      {isCardFlipped && card.mnemonicOrKeyFact && (
                        <p className="text-[11px] mt-2 font-mono text-amber-400">
                          💡 {card.mnemonicOrKeyFact}
                        </p>
                      )}
                    </div>

                    <span className="text-[10px]" style={{ color: currentTheme.textMuted }}>
                      (Tap anywhere to flip card)
                    </span>
                  </div>
                );
              })()}

              {/* Mastery & Navigation Controls */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const cardId = agentResult.flashcards!.cards[currentCardIndex].id;
                      setCardMastery((prev) => ({ ...prev, [cardId]: 'review' }));
                      if (currentCardIndex < agentResult.flashcards!.cards.length - 1) {
                        setCurrentCardIndex((p) => p + 1);
                        setIsCardFlipped(false);
                      }
                    }}
                    className="h-10 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer hover:opacity-80"
                    style={{
                      backgroundColor: currentTheme.bgElevated,
                      borderColor: currentTheme.borderBase,
                      color: currentTheme.textSecondary,
                    }}
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Review Later</span>
                  </button>

                  <button
                    onClick={() => {
                      const cardId = agentResult.flashcards!.cards[currentCardIndex].id;
                      setCardMastery((prev) => ({ ...prev, [cardId]: 'mastered' }));
                      if (currentCardIndex < agentResult.flashcards!.cards.length - 1) {
                        setCurrentCardIndex((p) => p + 1);
                        setIsCardFlipped(false);
                      } else {
                        try {
                          confetti({ particleCount: 30, spread: 50 });
                        } catch (e) {}
                      }
                    }}
                    className="h-10 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer hover:opacity-90"
                    style={{ backgroundColor: '#10B981' }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 fill-white text-emerald-600" />
                    <span>Mastered! (+10 XP)</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => {
                      setCurrentCardIndex((p) => Math.max(0, p - 1));
                      setIsCardFlipped(false);
                    }}
                    disabled={currentCardIndex === 0}
                    className="px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-30"
                    style={{
                      backgroundColor: currentTheme.bgElevated,
                      borderColor: currentTheme.borderBase,
                      color: currentTheme.textSecondary,
                    }}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev Card</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentCardIndex((p) => Math.min(agentResult.flashcards!.cards.length - 1, p + 1));
                      setIsCardFlipped(false);
                    }}
                    disabled={currentCardIndex === agentResult.flashcards.cards.length - 1}
                    className="px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-30"
                    style={{
                      backgroundColor: currentTheme.bgElevated,
                      borderColor: currentTheme.borderBase,
                      color: currentTheme.textSecondary,
                    }}
                  >
                    <span>Next Card</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. SUGGESTED ACTIONABLE STUDY TASKS */}
          {activeOutputTab === 'tasks' && agentResult.suggestedTasks && (
            <div
              className="rounded-2xl border p-4 space-y-3 shadow-sm"
              style={{
                backgroundColor: currentTheme.bgSurface,
                borderColor: currentTheme.borderBase,
              }}
            >
              <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: currentTheme.borderBase }}>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: currentTheme.textPrimary }}>
                    Recommended Study Sprints
                  </h3>
                  <p className="text-[11px]" style={{ color: currentTheme.textMuted }}>
                    Turn your synthesized materials into actionable Pomodoro focus sessions
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {agentResult.suggestedTasks.map((task, idx) => {
                  const isAdded = addedTasks[task.title];
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border flex items-center justify-between gap-2"
                      style={{
                        backgroundColor: currentTheme.bgElevated,
                        borderColor: currentTheme.borderBase,
                      }}
                    >
                      <div className="truncate pr-2">
                        <p className="text-xs font-semibold truncate" style={{ color: currentTheme.textPrimary }}>
                          {task.title}
                        </p>
                        <p className="text-[10px] mt-0.5 flex items-center gap-2" style={{ color: currentTheme.textMuted }}>
                          <span>⏱️ {task.durationMinutes} min</span>
                          <span>•</span>
                          <span>🎯 {task.tag}</span>
                          {task.isMicroTask && <span className="text-emerald-400 font-bold">• Social Unlocker</span>}
                        </p>
                      </div>

                      <button
                        onClick={() => handleAddSuggestedTask(task.title, task.durationMinutes, task.tag)}
                        disabled={isAdded}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0 disabled:opacity-70"
                        style={{
                          backgroundColor: isAdded ? '#10B981' : currentTheme.accentPrimary,
                          color: '#FFFFFF',
                        }}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to Today</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setActiveTab('today')}
                className="w-full h-10 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer hover:opacity-80 mt-2"
                style={{
                  backgroundColor: currentTheme.bgElevated,
                  borderColor: currentTheme.borderBase,
                  color: currentTheme.accentPrimary,
                }}
              >
                <span>View Today's Task Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
