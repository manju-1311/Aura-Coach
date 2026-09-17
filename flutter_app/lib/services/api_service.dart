import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/agent_models.dart';

class ApiService {
  // Default to local Node.js Express backend (10.0.2.2 points to host machine on Android emulator)
  static String baseUrl = 'http://10.0.2.2:3000';

  static void setBaseUrl(String url) {
    baseUrl = url;
  }

  /// Run Agentic Study Synthesis (Mock Test, Summary, Flashcards)
  static Future<AgentExecutionResult> runStudyAgent({
    required String prompt,
    required String mode,
    String? notes,
    String? pdfBase64,
    String? fileName,
  }) async {
    final uri = Uri.parse('$baseUrl/api/agent/run');

    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'userPrompt': prompt,
        'mode': mode,
        'notes': notes ?? '',
        'pdfBase64': pdfBase64,
        'fileName': fileName,
        'depth': 'standard',
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['success'] == true && data['result'] != null) {
        return AgentExecutionResult.fromJson(data['result']);
      }
    }
    throw Exception('Failed to execute study agent: ${response.body}');
  }

  /// Check backend server status
  static Future<bool> checkHealth() async {
    try {
      final res = await http.get(Uri.parse('$baseUrl/api/health'));
      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}
