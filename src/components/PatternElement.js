// Element used to add choices to pattern matching questiom
// Hook functional component
// state holds the values of input fields
import { useState, useRef } from "react";
import { Form, Input, Dropdown, Button } from "semantic-ui-react";
import axios from "axios";

const patternDropdown = [
  {
    key: "sound_pattern",
    text: "Sound",
    value: "sound_pattern",
  },
  {
    key: "text_pattern",
    text: "Text",
    value: "text_pattern",
  },
];

export const patternResponseClickAction = (choice, ref) => {
  // determine if choice is sound or text
  // if sound, play sound

  if (choice.type === "sound_pattern") {
    // check if ref data is loaded
    return ref.play();
  }
  // if text, display text
  return null;
};

export const PatternResponseElement = ({ choice, setRef }) => {
  const patternRef = useRef();

  setRef(patternRef);
  // returns a single choice element for pattern matching based on the type of the choice
  if (choice.type === "sound_pattern") {
    // returns am audio element without controls; audio element is controlled by parent button
    return (
      <audio
        key={`${choice.id}-audio`}
        ref={patternRef}
        style={{ width: "100%" }}
        className="audio-element"
      >
        <source
          preload="auto"
          src={choice.data}
          type="audio/mpeg"
          crossorigin="anonymous"
        />
      </audio>
    );
  } else if (choice.type === "text_pattern") {
    // returns a text element
    return null;
  } else {
    return null;
  }
};

const PatternElement = ({ optionId, index, addChoice, num }) => {
  const [choice, setChoice] = useState({
    text: `${num}`,
    id: optionId + index,
    data: "",
    type: "sound_pattern",
  });

  const handleChange = (e) => {
    setChoice({
      ...choice,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div>
      <Form.Field as={"div"} style={{ display: "flex", alignItems: "center" }}>
        <Input
          key={`${optionId}-${index}-label`}
          placeholder="Choice"
          onChange={(e) => handleChange(e)}
          value={choice.text}
          name="text"
        />
        <Input
          key={`${optionId}-${index}-label-data`}
          placeholder="Data / URL"
          onChange={(e) => handleChange(e)}
          value={choice.data}
          name="data"
        />
        <Dropdown
          placeholder="Type"
          fluid
          selection
          key={`${optionId}-${index}-type-pattern`}
          options={patternDropdown}
          onChange={(e, { value }) => {
            setChoice({
              ...choice,
              type: value,
            });
          }}
          value={choice.type}
        />
        {/* Adding button */}
        <Button
          type="button"
          icon="plus"
          className="ui button"
          onClick={(e) => {
            e.preventDefault();
            addChoice(choice);
            setChoice({
              text: `${num + 1}`,
              id: optionId + index,
              data: "",
              type: choice.type,
            });
          }}
        />
      </Form.Field>
    </div>
  );
};

export default PatternElement;
