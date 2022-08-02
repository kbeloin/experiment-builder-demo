import React, { useEffect, useState } from "react";
import { Form, Label } from "semantic-ui-react";

const Slider = (props) => {
  const { questionId, responseId, update, response, option } = props;
  const [value, setValue] = useState(response[option.id] ?? 0);

  useEffect(() => {
    if (update !== undefined) {
      update(value);
    } else {
      console.warn("No callback registered. Text will be set to local state.");
    }
  }, [value]);

  return (
    <>
      <Form.Field
        id={`${questionId}-${responseId ?? 0}-field`}
        style={{ display: "flex", flexDirection: "column" }}
      >
        <h4>{option.title}</h4>
      </Form.Field>
      <Form.Field>
        <Label
          className="bg-none"
          style={{
            display: "flex",
            width: "fit-content",
            gap: "1rem",
            backgroundColor: "transparent",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            textAlign: "center",
          }}
        >
          <p style={{ margin: "0" }}>{`${value}`}</p>
          <input
            style={{ width: "min(75%, 600px)" }}
            name="range"
            type="range"
            value={value}
            min={option.min ?? 0}
            max={option.max ?? 100}
            step={option.step ?? 1}
            key={`${questionId}-${option.id ?? 0}-input`}
            onChange={(e) => setValue(e.target.value)}
            disabled={responseId === undefined}
          />
        </Label>
      </Form.Field>
    </>
  );
};

export default Slider;
