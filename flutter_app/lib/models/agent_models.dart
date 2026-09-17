class AgentMockQuestion {
  final String id;
  final String question;
  final List<String> options;
  final int correctAnswerIndex;
  final String explanation;
  final String difficulty;

  AgentMockQuestion({
    required this.id,
    required this.question,
    required this.options,
    required this.correctAnswerIndex,
    required this.explanation,
    required this.difficulty,
  });

  factory AgentMockQuestion.fromJson(Map<String, dynamic> json) {
    return AgentMockQuestion(
      id: json['id']?.toString() ?? '',
      question: json['question'] ?? '',
      options: List<String>.from(json['options'] ?? []),
      correctAnswerIndex: json['correctAnswerIndex'] ?? 0,
      explanation: json['explanation'] ?? '',
      difficulty: json['difficulty'] ?? 'medium',
    );
  }
}

class AgentMockTest {
  final String title;
  final int durationMinutesEstimate;
  final List<AgentMockQuestion> questions;

  AgentMockTest({
    required this.title,
    required this.durationMinutesEstimate,
    required this.questions,
  });

  factory AgentMockTest.fromJson(Map<String, dynamic> json) {
    return AgentMockTest(
      title: json['title'] ?? 'Mock Test',
      durationMinutesEstimate: json['durationMinutesEstimate'] ?? 15,
      questions: (json['questions'] as List<dynamic>?)
              ?.map((q) => AgentMockQuestion.fromJson(q))
              .toList() ??
          [],
    );
  }
}

class AgentFlashcard {
  final String id;
  final String front;
  final String back;
  final String? mnemonicOrKeyFact;

  AgentFlashcard({
    required this.id,
    required this.front,
    required this.back,
    this.mnemonicOrKeyFact,
  });

  factory AgentFlashcard.fromJson(Map<String, dynamic> json) {
    return AgentFlashcard(
      id: json['id']?.toString() ?? '',
      front: json['front'] ?? '',
      back: json['back'] ?? '',
      mnemonicOrKeyFact: json['mnemonicOrKeyFact'],
    );
  }
}

class AgentSummary {
  final String title;
  final String executiveSummary;
  final List<Map<String, String>> coreConcepts;
  final List<String> pitfallsToAvoid;

  AgentSummary({
    required this.title,
    required this.executiveSummary,
    required this.coreConcepts,
    required this.pitfallsToAvoid,
  });

  factory AgentSummary.fromJson(Map<String, dynamic> json) {
    return AgentSummary(
      title: json['title'] ?? 'Summary',
      executiveSummary: json['executiveSummary'] ?? '',
      coreConcepts: (json['coreConcepts'] as List<dynamic>?)
              ?.map((c) => {
                    'name': c['name']?.toString() ?? '',
                    'description': c['description']?.toString() ?? '',
                    'exampleOrFormula': c['exampleOrFormula']?.toString() ?? '',
                  })
              .toList() ??
          [],
      pitfallsToAvoid: List<String>.from(json['pitfallsToAvoid'] ?? []),
    );
  }
}

class AgentExecutionResult {
  final String sessionId;
  final String mode;
  final String agentThoughtPlan;
  final AgentMockTest? mockTest;
  final AgentSummary? summary;
  final List<AgentFlashcard>? flashcards;

  AgentExecutionResult({
    required this.sessionId,
    required this.mode,
    required this.agentThoughtPlan,
    this.mockTest,
    this.summary,
    this.flashcards,
  });

  factory AgentExecutionResult.fromJson(Map<String, dynamic> json) {
    return AgentExecutionResult(
      sessionId: json['sessionId'] ?? '',
      mode: json['mode'] ?? 'mock_test',
      agentThoughtPlan: json['agentThoughtPlan'] ?? '',
      mockTest: json['mockTest'] != null
          ? AgentMockTest.fromJson(json['mockTest'])
          : null,
      summary: json['summary'] != null
          ? AgentSummary.fromJson(json['summary'])
          : null,
      flashcards: json['flashcards'] != null && json['flashcards']['cards'] != null
          ? (json['flashcards']['cards'] as List<dynamic>)
              .map((c) => AgentFlashcard.fromJson(c))
              .toList()
          : null,
    );
  }
}
