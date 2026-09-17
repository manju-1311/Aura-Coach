import 'dart:async';
import 'package:flutter/material.dart';
import '../theme.dart';

class FocusScreen extends StatefulWidget {
  const FocusScreen({Key? key}) : super(key: key);

  @override
  State<FocusScreen> createState() => _FocusScreenState();
}

class _FocusScreenState extends State<FocusScreen> with WidgetsBindingObserver {
  int _remainingSeconds = 25 * 60; // 25 minutes
  bool _isActive = true;
  bool _isPaused = false;
  Timer? _timer;

  // On-screen Toast Notification Overlay State
  bool _showDriftToast = false;
  String _driftReason = 'Drift Detected: Stay Off Social Media!';
  int _distractionsResisted = 3;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _startTimer();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _timer?.cancel();
    super.dispose();
  }

  // App Lifecycle / Screen Drift Detection
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (_isActive && !_isPaused) {
      if (state == AppLifecycleState.paused || state == AppLifecycleState.inactive) {
        // User navigated away to Instagram / TikTok / WhatsApp
      } else if (state == AppLifecycleState.resumed) {
        // User returned to Aura Coach after leaving
        _triggerDriftToast('App Switch Detected: Stay Off Social Media!');
      }
    }
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_remainingSeconds > 0 && !_isPaused) {
        setState(() {
          _remainingSeconds--;
        });
      } else if (_remainingSeconds <= 0) {
        _timer?.cancel();
        setState(() {
          _isActive = false;
        });
      }
    });
  }

  void _triggerDriftToast(String reason) {
    setState(() {
      _driftReason = reason;
      _showDriftToast = true;
    });
  }

  void _dismissDriftToast(bool resisted) {
    setState(() {
      _showDriftToast = false;
      if (resisted) {
        _distractionsResisted++;
      }
    });
  }

  String _formatTime(int totalSeconds) {
    final mins = (totalSeconds ~/ 60).toString().padLeft(2, '0');
    final secs = (totalSeconds % 60).toString().padLeft(2, '0');
    return '$mins:$secs';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgBase,
      appBar: AppBar(
        backgroundColor: AppColors.bgSurface,
        title: const Text(
          'Focus Sprint ⏱️',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.warning_amber_rounded, color: AppColors.neonFuchsia),
            tooltip: 'Test On-Screen Drift Overlay',
            onPressed: () => _triggerDriftToast('Test Alert: Stay Off Social Media!'),
          ),
        ],
      ),
      body: Stack(
        children: [
          // Main Focus Timer View
          SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Active Target Card
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: AppColors.bgSurface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.borderBase),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.neonPurple.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.bolt, color: AppColors.neonPurple, size: 20),
                      ),
                      const SizedBox(width: 12),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Target Sprint',
                              style: TextStyle(color: AppColors.textMuted, fontSize: 11),
                            ),
                            Text(
                              'Master Placement Core Algorithms',
                              style: TextStyle(
                                color: AppColors.textPrimary,
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 36),

                // Radial Countdown Timer Display with Neon Glow
                Container(
                  width: 240,
                  height: 240,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppColors.bgSurface,
                    border: Border.all(color: AppColors.neonPurple, width: 3),
                    boxShadow: AppColors.neonGlow(color: AppColors.neonPurple, blur: 24),
                  ),
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          _formatTime(_remainingSeconds),
                          style: const TextStyle(
                            fontSize: 48,
                            fontWeight: FontWeight.w900,
                            color: AppColors.textPrimary,
                            letterSpacing: 2,
                            fontFamily: 'monospace',
                          ),
                        ),
                        const SizedBox(height: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.neonPurple.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.neonPurple.withOpacity(0.5)),
                          ),
                          child: Text(
                            _isPaused ? 'PAUSED' : 'DEEP FOCUS SPRINT',
                            style: const TextStyle(
                              color: AppColors.neonFuchsia,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 36),

                // Controls
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          side: const BorderSide(color: AppColors.borderBase),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          backgroundColor: AppColors.bgElevated,
                        ),
                        icon: const Icon(Icons.coffee, color: AppColors.neonFuchsia, size: 18),
                        label: const Text(
                          '2m Breather',
                          style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.bold),
                        ),
                        onPressed: () {
                          setState(() {
                            _remainingSeconds += 120;
                          });
                        },
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          backgroundColor: AppColors.neonPurple,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          elevation: 6,
                          shadowColor: AppColors.neonPurple.withOpacity(0.5),
                        ),
                        icon: Icon(
                          _isPaused ? Icons.play_arrow : Icons.pause,
                          color: Colors.white,
                          size: 18,
                        ),
                        label: Text(
                          _isPaused ? 'Resume' : 'Pause',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        onPressed: () {
                          setState(() {
                            _isPaused = !_isPaused;
                          });
                        },
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                // Anti-Social Media Drift Shield Banner & Test Trigger
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.bgSurface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.neonPurple),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.neonPurple.withOpacity(0.2),
                        blurRadius: 16,
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Row(
                            children: [
                              Icon(Icons.shield_outlined, color: AppColors.neonPurple, size: 18),
                              SizedBox(width: 8),
                              Text(
                                'Social Media Shield Active',
                                style: TextStyle(
                                  color: AppColors.textPrimary,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                ),
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.neonPurple.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Text(
                              'Auto-Armed',
                              style: TextStyle(color: AppColors.neonFuchsia, fontSize: 10),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'If you leave this app to check Instagram, TikTok, or YouTube, an On-Screen Toast Notification will alert you to stay disciplined.',
                        style: TextStyle(color: AppColors.textSecondary, fontSize: 11, height: 1.4),
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.bgElevated,
                            foregroundColor: AppColors.neonFuchsia,
                            side: const BorderSide(color: AppColors.neonPurple),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          icon: const Icon(Icons.notification_important, size: 16),
                          label: const Text(
                            'Test Social Drift Toast Overlay',
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                          onPressed: () => _triggerDriftToast('Social Drift Detected: Stay Off Social Media!'),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // On-Screen Toast Notification Overlay
          if (_showDriftToast)
            Positioned(
              top: 16,
              left: 16,
              right: 16,
              child: Material(
                elevation: 16,
                borderRadius: BorderRadius.circular(18),
                color: Colors.transparent,
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.bgSurface,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: AppColors.neonPurple, width: 2),
                    boxShadow: AppColors.neonGlow(color: AppColors.neonPurple, blur: 20),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppColors.neonPurple.withOpacity(0.25),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: AppColors.neonPurple),
                            ),
                            child: const Text(
                              '⚠️ STAY OFF SOCIAL MEDIA',
                              style: TextStyle(
                                color: AppColors.neonFuchsia,
                                fontWeight: FontWeight.bold,
                                fontSize: 10,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                          IconButton(
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(),
                            icon: const Icon(Icons.close, color: AppColors.textMuted, size: 18),
                            onPressed: () => _dismissDriftToast(false),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: AppColors.neonPurple,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.lock_clock, color: Colors.white, size: 22),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  _driftReason,
                                  style: const TextStyle(
                                    color: AppColors.textPrimary,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                const Text(
                                  'Your focus sprint is actively running. Instagram, TikTok and YouTube remain locked to safeguard your daily streak!',
                                  style: TextStyle(
                                    color: AppColors.textSecondary,
                                    fontSize: 11,
                                    height: 1.3,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Resisted Distractions Today: $_distractionsResisted (+${_distractionsResisted * 30} XP)',
                            style: const TextStyle(
                              color: AppColors.neonFuchsia,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.neonPurple,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                            onPressed: () => _dismissDriftToast(true),
                            child: const Text('Back to Studying', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
