export const config = [
  {
    text: "User Progress",
    description:
      "Whether a user can freely move between questions within a module before entering a response.",
    input: "select",
    options: ["Controlled", "Uncontrolled"],
    name: "user_progress",
  },
  {
    text: "Strict Target Evaluation",
    description:
      "Whether a user can submit a module before meeting targets for each question.",
    input: "switch",
    options: [true, false],
    name: "target_eval",
    disabled: true,
  },
  {
    text: "Number of Attempts",
    description: "The number of times a user can attempt each question.",
    input: "select",
    options: [...Array(10).keys()].map((i) => i + 1),
    name: "num_attempts",
  },
  {
    text: "Randomize Questions",
    description:
      "Randomize order of questions in the module. If false, order in module creation is used.",
    input: "switch",
    options: [false, true],
    name: "random_modules",
    disabled: true,
  },
  // setting to allow users to change the answer of a question
  {
    text: "Allow Question Change",
    description: "Whether a user can freely change the answer of a question.",
    input: "switch",
    options: [true, false],
    name: "allow_question_change",
  },
  // setting to show feedback after submitting a question
  {
    text: "Show Feedback",
    description: "Whether to show feedback after submitting a question.",
    input: "switch",
    options: [true, false],
    name: "show_feedback",
  },
];
