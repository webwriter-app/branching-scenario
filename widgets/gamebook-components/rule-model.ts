interface Rule {
  output_id: string;
  element: string;
  condition: string;
  match: string;
  target: string;
  isConditionEnabled: Boolean;
  isMatchEnabled: Boolean;
  isTargetEnabled: Boolean;
}

// type AcyclicNodeRepresentation = {
//   tagName?: string;
//   textContent?: string;
//   //index: number;
// };
