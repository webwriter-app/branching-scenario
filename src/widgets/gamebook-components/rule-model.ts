interface Rule {
  output_id: string;
  elementId: string;
  quizTasks: string;
  condition: string;
  match: string;
  target: string;
  isConditionEnabled: Boolean;
  isMatchEnabled: Boolean;
  isTargetEnabled: Boolean;
}
