import React, { useState, useEffect } from "react";
import { Form, Button } from "semantic-ui-react";
import PatternContextElement from "../../../components/Popup/PatternContextElement";

const PatternMatching = (props) => {
  const { questionId, responseId, update, response, option } = props;
  const [selection, setSelection] = useState(response[option.id] ?? []);

  const { choices, answer, title } = option;

  const handleResponse = (id) => {
    const newSelection = [...selection, id];
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
      <Form.Field
        id={`${questionId}-${responseId ?? 0}-field`}
        style={{ display: "flex", flexDirection: "column" }}
      >
        <Button.Group
          size="large"
          style={{
            border: "unset",
            flexWrap: "wrap",
            flexDirection: "column-reverse",
            width: "60%",
            margin: "auto",
          }}
        >
          {choices.map((choice, i) => {
            const { text, id, data, type } = choice;
            return (
              <PatternContextElement
                extraStyle={{
                  width: "100%",
                  flex: "0 1 60%",
                  margin: "auto",
                  marginBottom: "0.5em",
                }}
                key={`${questionId}-${responseId ?? 0}-${id}`}
                choice={choice}
                onClick={() => {
                  handleResponse(id);
                }}
              />
            );
          })}
        </Button.Group>
      </Form.Field>
    </Form.Field>
  );
};

export default PatternMatching;
