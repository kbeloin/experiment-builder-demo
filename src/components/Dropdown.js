import React from "react";
import { Dropdown } from "semantic-ui-react";

const CustomDropdown = (props) => {
  const { options, handleChange, value, name, id } = props;

  const setValue = (e, { value }) => {
    handleChange(value);
  };

  return (
    <Dropdown
      selection
      options={options}
      onChange={setValue}
      placeholder="Select"
      value={value}
      name={name}
      key={`custom-question-dropdown-${id}`}
    />
  );
};

export default CustomDropdown;
