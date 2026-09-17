import 'package:flutter/material.dart';

class AppColors {
  // Deep Cosmic Purple Canvas & Surfaces
  static const Color bgBase = Color(0xFF0D0221);
  static const Color bgSurface = Color(0xFF190838);
  static const Color bgElevated = Color(0xFF260D52);
  static const Color bgInput = Color(0xFF13052E);

  // Borders & Dividers
  static const Color borderBase = Color(0xFF4C1D95);
  static const Color borderFocus = Color(0xFFC084FC);

  // High-Contrast Crisp Whites & Purples
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFFF3E8FF);
  static const Color textMuted = Color(0xFFC084FC);

  // Electric Neon Accents
  static const Color neonPurple = Color(0xFFA855F7);
  static const Color neonHover = Color(0xFF9333EA);
  static const Color neonFuchsia = Color(0xFFF0ABFC);
  static const Color neonCyan = Color(0xFF00F0FF);
  static const Color neonGreen = Color(0xFF10B981);
  static const Color neonRed = Color(0xFFFF0055);
  static const Color neonYellow = Color(0xFFFFE600);

  // Glow Decoration
  static List<BoxShadow> neonGlow({Color color = neonPurple, double blur = 16}) {
    return [
      BoxShadow(
        color: color.withOpacity(0.4),
        blurRadius: blur,
        spreadRadius: 1,
      ),
      BoxShadow(
        color: color.withOpacity(0.2),
        blurRadius: blur * 2,
        spreadRadius: 2,
      ),
    ];
  }
}

ThemeData getAppTheme() {
  return ThemeData(
    useMaterial3: true,
    scaffoldBackgroundColor: AppColors.bgBase,
    brightness: Brightness.dark,
    colorScheme: const ColorScheme.dark(
      surface: AppColors.bgSurface,
      primary: AppColors.neonPurple,
      secondary: AppColors.neonFuchsia,
      onPrimary: Colors.white,
      onSurface: AppColors.textPrimary,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.bgSurface,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: TextStyle(
        color: AppColors.textPrimary,
        fontSize: 18,
        fontWeight: FontWeight.bold,
      ),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: AppColors.bgSurface,
      selectedItemColor: AppColors.neonPurple,
      unselectedItemColor: AppColors.textMuted,
      showUnselectedLabels: true,
      type: BottomNavigationBarType.fixed,
    ),
  );
}
