import 'package:flutter/material.dart';
import '../theme.dart';

class HomeScreen extends StatelessWidget {
  final Function(int) onNavigateTab;

  const HomeScreen({Key? key, required this.onNavigateTab}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgBase,
      appBar: AppBar(
        title: const Text(
          'Aura Coach',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.bolt, color: AppColors.neonYellow),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Daily Streak & Screen Time Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.bgSurface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.borderBase),
                boxShadow: AppColors.neonGlow(color: AppColors.neonPurple, blur: 12),
              ),
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: AppColors.bgElevated,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.local_fire_department, color: AppColors.neonFuchsia, size: 24),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('4-Day Streak Active', style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 14)),
                        SizedBox(height: 2),
                        Text('45m screen time remaining today', style: TextStyle(color: AppColors.textSecondary, fontSize: 11)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Study Agent Quick Launcher Banner
            InkWell(
              onTap: () => onNavigateTab(2), // Switch to Agent tab
              borderRadius: BorderRadius.circular(16),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.bgSurface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.neonPurple),
                  boxShadow: AppColors.neonGlow(color: AppColors.neonPurple, blur: 14),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: AppColors.neonPurple.withOpacity(0.25),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.neonPurple),
                      ),
                      child: const Icon(Icons.psychology, color: AppColors.neonPurple, size: 24),
                    ),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text('Aura Study Agent', style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 14)),
                              SizedBox(width: 6),
                              Text('AI', style: TextStyle(color: AppColors.neonFuchsia, fontWeight: FontWeight.bold, fontSize: 10)),
                            ],
                          ),
                          SizedBox(height: 2),
                          Text('Generate Mock Tests, Summaries & Flashcards', style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
                        ],
                      ),
                    ),
                    const Icon(Icons.chevron_right, color: AppColors.neonPurple),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Today's Focus Queue
            const Text(
              "TODAY'S FOCUS QUEUE",
              style: TextStyle(color: AppColors.textMuted, fontWeight: FontWeight.bold, fontSize: 11, letterSpacing: 1.1),
            ),
            const SizedBox(height: 8),

            _buildTaskItem('Dynamic Programming memoization revision', '25m', 'Placement Prep', true),
            _buildTaskItem('Operating Systems deadlock conditions quiz', '15m', 'Semester Exam', false),
            _buildTaskItem('Graph BFS/DFS shortest path practice', '30m', 'Algorithms', false),
          ],
        ),
      ),
    );
  }

  Widget _buildTaskItem(String title, String duration, String tag, bool isActive) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.bgSurface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: isActive ? AppColors.neonPurple : AppColors.borderBase),
        boxShadow: isActive ? AppColors.neonGlow(color: AppColors.neonPurple, blur: 8) : null,
      ),
      child: Row(
        children: [
          Icon(
            isActive ? Icons.play_circle_fill : Icons.radio_button_unchecked,
            color: isActive ? AppColors.neonPurple : AppColors.textMuted,
            size: 20,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w600, fontSize: 12)),
                const SizedBox(height: 2),
                Text('$duration • $tag', style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
