import React, { useState, useEffect } from "react";
import { Form, Checkbox, Button } from "semantic-ui-react";

const Choice = (props) => {
  const { questionId, responseId, update, response, option } = props;
  const [selection, setSelection] = useState(response[option.id] ?? null);
  const { choices, answer, title } = option;

  useEffect(() => {
    if (update !== undefined) {
      update(selection);
    } else {
      console.warn("No callback registered.");
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
        {choices.length === 2 ? (
          <Form.Field>
            <Button.Group>
              <Button
                key={0}
                value={choices[0]}
                name={0}
                active={selection === choices[0]}
                color={selection === choices[0] ? "green" : ""}
                onClick={(e) => setSelection(e.target.value)}
              >
                {choices[0]}
              </Button>
              <Button.Or />
              <Button
                key={1}
                value={choices[1]}
                name={1}
                active={selection === choices[1]}
                color={selection === choices[1] ? "green" : ""}
                onClick={(e) => setSelection(e.target.value)}
              >
                {choices[1]}
              </Button>
            </Button.Group>
          </Form.Field>
        ) : (
          choices.map((choice, index) => {
            return (
              <Form.Field>
                <Checkbox
                  radio
                  name={`${responseId}-choices`}
                  value={choice}
                  key={`${responseId}-${index}`}
                  checked={choice === selection}
                  onChange={(e) => setSelection(e.target.value)}
                  label={choice}
                />
              </Form.Field>
            );
          })
        )}
      </Form.Field>
    </Form.Field>
  );
};

export default Choice;
