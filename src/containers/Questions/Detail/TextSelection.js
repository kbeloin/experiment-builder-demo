import React, { useState, useEffect } from "react";
import { Form, List, Checkbox, Button } from "semantic-ui-react";

const TextSelection = (props) => {
  const { questionId, responseId, update, response, option } = props;
  const [selection, setSelection] = useState(
    response[option.id] ??
      option.choices.map((e) => {
        return "";
      })
  );
  const { choices, source, title } = option;

  const handleResponse = (e) => {
    e.preventDefault();
    const newSelection = [...selection];
    newSelection[e.target.name] =
      newSelection[e.target.name] === "" ? e.target.value : "";
    setSelection(newSelection);
  };

  useEffect(() => {
    if (update !== undefined) {
      update(selection);
    }
  }, [selection]);

  return (
    <Form.Field
      id={`${questionId}-${responseId ?? 0}-field`}
      style={{ display: "flex", flexDirection: "column" }}
    >
      <h4>{title}</h4>
      <p>
        You've selected:
        {selection !== undefined && selection !== null ? selection : null}
      </p>
      <Form.Field
        id={`${questionId}-${responseId ?? 0}-field`}
        style={{ display: "flex", flexDirection: "column" }}
      >
        <Button.Group
          size="large"
          style={{ border: "unset", flexWrap: "wrap" }}
        >
          {choices.map((choice, i) => {
            var answer =
              response[option.id] !== undefined
                ? response[option.id][i] ?? ""
                : "";
            return (
              <Button
                size="large"
                key={i}
                value={choice}
                name={i}
                active={answer === choice}
                color={answer === choice ? "green" : ""}
                onClick={handleResponse}
                style={{
                  flex: "unset",
                  borderRadius: "unset",
                  paddingRight: "0.5ch",
                  paddingLeft: "0.5ch",
                }}
              >
                {choice}
              </Button>
            );
          })}
        </Button.Group>
      </Form.Field>
    </Form.Field>
  );
};

export default TextSelection;
