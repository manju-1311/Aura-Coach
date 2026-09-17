import 'package:flutter/material.dart';
import '../theme.dart';
import '../models/agent_models.dart';
import '../services/api_service.dart';

class AgentScreen extends StatefulWidget {
  const AgentScreen({Key? key}) : super(key: key);

  @override
  State<AgentScreen> createState() => _AgentScreenState();
}

class _AgentScreenState extends State<AgentScreen> {
  String _selectedMode = 'mock_test';
  final TextEditingController _notesController = TextEditingController();
  final TextEditingController _promptController = TextEditingController(
    text: 'Generate a 4-question mock test with detailed explanations',
  );

  bool _isLoading = false;
  AgentExecutionResult? _result;

  // Quiz state
  int _currentQuestionIndex = 0;
  final Map<int, int> _userAnswers = {};

  // Flashcards state
  int _currentCardIndex = 0;
  bool _isCardFlipped = false;

  void _onModeChanged(String mode) {
    setState(() {
      _selectedMode = mode;
      if (mode == 'mock_test') {
        _promptController.text = 'Generate an interactive 4-question mock test with explanations';
      } else if (mode == 'summary') {
        _promptController.text = 'Summarize key concepts, formulas, and common exam pitfalls';
      } else if (mode == 'flashcards') {
        _promptController.text = 'Create 6 active-recall flashcards for spaced repetition';
      }
    });
  }

  Future<void> _runAgent() async {
    if (_notesController.text.trim().isEmpty && _promptController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter notes or a study goal prompt')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
      _userAnswers.clear();
      _currentQuestionIndex = 0;
      _currentCardIndex = 0;
      _isCardFlipped = false;
    });

    try {
      final res = await ApiService.runStudyAgent(
        prompt: _promptController.text.trim(),
        mode: _selectedMode,
        notes: _notesController.text.trim(),
      );
      setState(() {
        _result = res;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e'), backgroundColor: AppColors.neonRed),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgBase,
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.bgElevated,
                borderRadius: BorderRadius.circular(8),
                boxShadow: AppColors.neonGlow(color: AppColors.neonPurple, blur: 8),
              ),
              child: const Icon(Icons.psychology, color: AppColors.neonPurple, size: 20),
            ),
            const SizedBox(width: 8),
            const Text('Aura Study Agent'),
          ],
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Mode Selectors
            Container(
              decoration: BoxDecoration(
                color: AppColors.bgSurface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.borderBase),
              ),
              padding: const EdgeInsets.all(4),
              child: Row(
                children: [
                  _buildModeTab('mock_test', 'Mock Test', Icons.quiz),
                  _buildModeTab('summary', 'Summary', Icons.menu_book),
                  _buildModeTab('flashcards', 'Flashcards', Icons.style),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Input Card
            Container(
              decoration: BoxDecoration(
                color: AppColors.bgSurface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.borderBase),
              ),
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Lecture Notes & Text',
                    style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _notesController,
                    maxLines: 4,
                    style: const TextStyle(color: AppColors.textPrimary, fontSize: 13),
                    decoration: InputDecoration(
                      hintText: 'Paste lecture syllabus, code snippets, or definitions...',
                      hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                      filled: true,
                      fillColor: AppColors.bgInput,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: AppColors.borderBase),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: AppColors.borderBase),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: AppColors.borderFocus),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Specific Output Result Prompt',
                    style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _promptController,
                    style: const TextStyle(color: AppColors.textPrimary, fontSize: 13),
                    decoration: InputDecoration(
                      hintText: 'e.g., 5 hard diagnostic test questions with explanations',
                      hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                      filled: true,
                      fillColor: AppColors.bgInput,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: AppColors.borderBase),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: AppColors.borderFocus),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Run Agent Button
                  ElevatedButton(
                    onPressed: _isLoading ? null : _runAgent,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.neonPurple,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 8,
                      shadowColor: AppColors.neonPurple.withOpacity(0.5),
                    ),
                    child: _isLoading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.auto_awesome, size: 18),
                              SizedBox(width: 8),
                              Text('Synthesize with Flutter Agent', style: TextStyle(fontWeight: FontWeight.bold)),
                            ],
                          ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Results Section
            if (_result != null) ...[
              // Thought Plan
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.bgElevated,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.neonPurple.withOpacity(0.5)),
                  boxShadow: AppColors.neonGlow(color: AppColors.neonPurple, blur: 10),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.psychology, color: AppColors.neonFuchsia, size: 16),
                        SizedBox(width: 6),
                        Text('Agent Reasoning Plan', style: TextStyle(color: AppColors.neonFuchsia, fontWeight: FontWeight.bold, fontSize: 12)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _result!.agentThoughtPlan,
                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 11, height: 1.4),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Mock Test Output
              if (_selectedMode == 'mock_test' && _result!.mockTest != null)
                _buildMockTestView(_result!.mockTest!),

              // Summary Output
              if (_selectedMode == 'summary' && _result!.summary != null)
                _buildSummaryView(_result!.summary!),

              // Flashcards Output
              if (_selectedMode == 'flashcards' && _result!.flashcards != null)
                _buildFlashcardsView(_result!.flashcards!),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildModeTab(String mode, String label, IconData icon) {
    final isSelected = _selectedMode == mode;
    return Expanded(
      child: GestureDetector(
        onTap: () => _onModeChanged(mode),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.neonPurple : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
            boxShadow: isSelected ? AppColors.neonGlow(color: AppColors.neonPurple, blur: 8) : null,
          ),
          child: Column(
            children: [
              Icon(icon, color: isSelected ? Colors.white : AppColors.textMuted, size: 18),
              const SizedBox(height: 2),
              Text(
                label,
                style: TextStyle(
                  color: isSelected ? Colors.white : AppColors.textSecondary,
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMockTestView(AgentMockTest test) {
    if (test.questions.isEmpty) return const SizedBox.shrink();
    final q = test.questions[_currentQuestionIndex];
    final hasAnswered = _userAnswers.containsKey(_currentQuestionIndex);
    final selectedOption = _userAnswers[_currentQuestionIndex];

    return Container(
      decoration: BoxDecoration(
        color: AppColors.bgSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderBase),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.between,
            children: [
              Text(
                'QUESTION ${_currentQuestionIndex + 1} OF ${test.questions.length}',
                style: const TextStyle(color: AppColors.neonPurple, fontWeight: FontWeight.bold, fontSize: 11),
              ),
              Text(
                q.difficulty.toUpperCase(),
                style: const TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            q.question,
            style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w600, fontSize: 13, height: 1.4),
          ),
          const SizedBox(height: 12),

          // Options
          ...List.generate(q.options.length, (index) {
            Color btnColor = AppColors.bgElevated;
            Color borderColor = AppColors.borderBase;
            if (hasAnswered) {
              if (index == q.correctAnswerIndex) {
                btnColor = AppColors.neonGreen.withOpacity(0.2);
                borderColor = AppColors.neonGreen;
              } else if (index == selectedOption) {
                btnColor = AppColors.neonRed.withOpacity(0.2);
                borderColor = AppColors.neonRed;
              }
            }

            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: InkWell(
                onTap: hasAnswered
                    ? null
                    : () {
                        setState(() {
                          _userAnswers[_currentQuestionIndex] = index;
                        });
                      },
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: btnColor,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: borderColor),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 24,
                        height: 24,
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: AppColors.bgSurface,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          String.fromCharCode(65 + index),
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          q.options[index],
                          style: const TextStyle(color: AppColors.textPrimary, fontSize: 12),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          }),

          // Explanation
          if (hasAnswered) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.bgInput,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.borderBase),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Explanation:', style: TextStyle(color: AppColors.neonGreen, fontWeight: FontWeight.bold, fontSize: 11)),
                  const SizedBox(height: 4),
                  Text(q.explanation, style: const TextStyle(color: AppColors.textSecondary, fontSize: 11, height: 1.3)),
                ],
              ),
            ),
          ],

          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              IconButton(
                icon: const Icon(Icons.arrow_back, color: AppColors.textSecondary),
                onPressed: _currentQuestionIndex > 0
                    ? () => setState(() => _currentQuestionIndex--)
                    : null,
              ),
              Text(
                '${_currentQuestionIndex + 1}/${test.questions.length}',
                style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
              ),
              IconButton(
                icon: const Icon(Icons.arrow_forward, color: AppColors.neonPurple),
                onPressed: _currentQuestionIndex < test.questions.length - 1
                    ? () => setState(() => _currentQuestionIndex++)
                    : null,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryView(AgentSummary summary) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.bgSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderBase),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(summary.title, style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 14)),
          const SizedBox(height: 8),
          Text(summary.executiveSummary, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12, height: 1.4)),
          const SizedBox(height: 12),
          const Text('Core Concepts', style: TextStyle(color: AppColors.neonFuchsia, fontWeight: FontWeight.bold, fontSize: 12)),
          const SizedBox(height: 8),
          ...summary.coreConcepts.map(
            (c) => Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.bgElevated,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.borderBase),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(c['name'] ?? '', style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 12)),
                  const SizedBox(height: 4),
                  Text(c['description'] ?? '', style: const TextStyle(color: AppColors.textSecondary, fontSize: 11)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFlashcardsView(List<AgentFlashcard> cards) {
    if (cards.isEmpty) return const SizedBox.shrink();
    final card = cards[_currentCardIndex];

    return Column(
      children: [
        GestureDetector(
          onTap: () => setState(() => _isCardFlipped = !_isCardFlipped),
          child: Container(
            height: 180,
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: _isCardFlipped ? AppColors.bgElevated : AppColors.bgSurface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.neonPurple),
              boxShadow: AppColors.neonGlow(color: AppColors.neonPurple, blur: 12),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  _isCardFlipped ? 'ANSWER' : 'QUESTION (TAP TO FLIP)',
                  style: const TextStyle(color: AppColors.neonFuchsia, fontWeight: FontWeight.bold, fontSize: 10, letterSpacing: 1.2),
                ),
                Text(
                  _isCardFlipped ? card.back : card.front,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 14, height: 1.4),
                ),
                Text(
                  'Card ${_currentCardIndex + 1} of ${cards.length}',
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            ElevatedButton(
              onPressed: _currentCardIndex > 0
                  ? () => setState(() {
                        _currentCardIndex--;
                        _isCardFlipped = false;
                      })
                  : null,
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.bgElevated),
              child: const Text('Prev Card'),
            ),
            ElevatedButton(
              onPressed: _currentCardIndex < cards.length - 1
                  ? () => setState(() {
                        _currentCardIndex++;
                        _isCardFlipped = false;
                      })
                  : null,
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.neonPurple),
              child: const Text('Next Card'),
            ),
          ],
        ),
      ],
    );
  }
}
