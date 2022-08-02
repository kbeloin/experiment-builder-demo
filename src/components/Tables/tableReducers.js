import { Checkbox, Dropdown } from "semantic-ui-react";

export const configInputReducer = ({
  input,
  options,
  name,
  initial,
  callback,
}) => {
  switch (input) {
    case "switch" || "checkbox":
      return (
        <Checkbox
          toggle
          name={name}
          onChange={(e) => callback(name, e.target.checked)}
          defaultChecked={initial}
        />
      );
    case "select":
      return (
        <Dropdown
          selection
          name={name}
          value={initial}
          onChange={(e, { value }) => callback(name, value)}
          options={options.map((option, i) => ({
            key: i,
            text: option,
            value: option,
          }))}
        />
      );
    default:
      console.warn("Invalid input type for config.");
      return;
  }
};
