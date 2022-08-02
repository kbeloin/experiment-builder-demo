import React, { useEffect, useState } from "react";
import { Form, Input } from "semantic-ui-react";

const Text = (props) => {
  const { questionId, responseId, update, response, option } = props;
  const [text, setText] = useState(response[option.id] ?? "");

  useEffect(() => {
    if (update !== undefined) {
      update(text);
    } else {
      console.warn("No callback registered. Text will be set to local state.");
    }
  }, [text]);

  return (
    <Form.Field
      id={`${questionId}-${responseId ?? 0}-field`}
      style={{ display: "flex", flexDirection: "column" }}
    >
      <h4>{option.title}</h4>
      <Input
        name="text"
        value={text}
        key={`${questionId}-${option.id ?? 0}-input`}
        onChange={(e) => setText(e.target.value)}
        disabled={responseId === undefined}
      />
    </Form.Field>
  );
};

export default Text;
