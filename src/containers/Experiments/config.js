export const config = [
  {
    text: "User Progress",
    description:
      "Whether a user can freely move between modules within an experiument before submitting the current module.",
    input: "select",
    options: ["Controlled", "Uncontrolled"],
    name: "user_progress",
  },
  {
    text: "Strict Target Evaluation",
    description:
      "Whether a user can submit an experiument before meeting targets within each module.",
    input: "switch",
    options: [true, false],
    name: "target_eval",
    disabled: true,
  },
  {
    text: "Number of Attempts",
    description: "The number of times a user can submit an experiment.",
    input: "select",
    options: [...Array(10).keys()].map((i) => i + 1),
    name: "num_attempts",
  },
  {
    text: "Randomize Modules",
    description:
      "Randomize order of modules with each experiment. If false, order in experiment creation is used.",
    input: "switch",
    options: [false, true],
    name: "random_modules",
    disabled: true,
  },
];
