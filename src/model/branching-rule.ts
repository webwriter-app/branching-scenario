export interface Rule {
  output_id: string;
  elementId: string;
  quizTasks: string;
  condition: string;
  match: string;
  target: string | number;
  isConditionEnabled: boolean;
  isMatchEnabled: boolean;
  isTargetEnabled: boolean;
}

/** A rule without element, condition, match or target. */
export function emptyRule(output_id: string): Rule {
  return {
    output_id,
    elementId: "",
    quizTasks: "",
    condition: "",
    match: "",
    target: "",
    isConditionEnabled: false,
    isMatchEnabled: false,
    isTargetEnabled: false,
  };
}

/** The number of an output id such as `output_3`. */
export function outputNumber(output_id: string): number {
  return parseInt(output_id.split("_")[1], 10);
}
