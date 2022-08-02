import React from "react";
import { Form, Icon, Checkbox, Input } from "semantic-ui-react";
import Recorder from "../../Detail/Recorder";
import Hoc from "../../../../hoc/hoc";

class AudioResponseBase extends React.Component {
  handleQuestionChange = this.props.handleQuestionChange;
  qTypes = this.props.questionTypes;

  handleSubQuestionChange = (e, key, optionId) => {
    const { option, question, qId } = this.props;

    const value = JSON.parse(option.value);

    this.handleQuestionChange(
      {
        ...question,
        options: {
          ...question.options,
          [optionId]: {
            value: JSON.stringify({
              ...value,
              [key]: e,
            }),
            target: option.target,
          },
        },
      },
      qId
    );
  };

  render() {
    const { option, optionId, qId, index } = this.props;
    const { title, process } = JSON.parse(option.value);

    return (
      <Hoc>
        <Form.Field
          as={"div"}
          style={{ display: "flex", alignItems: "center" }}
        >
          <Input
            key={`${optionId}-${index}-label`}
            placeholder="Instructions for additional input"
            onChange={(e) =>
              this.handleSubQuestionChange(e.target.value, "title", optionId)
            }
            value={title}
            name="options"
            label={index + 1}
          />
          <Checkbox
            checked={option.target}
            id={`${qId}-${optionId}-checkbox`}
            label="Target"
            onChange={(e) => this.props.handleChange(e, optionId, "target")}
            style={{ margin: "0.5em" }}
            name="options"
          />
          <Icon
            name="minus circle"
            onClick={() => this.props.remove(optionId)}
            style={{ margin: "0.5em" }}
          />
        </Form.Field>
        <Form.Field>
          <Recorder />
          <Checkbox
            checked={process === "pitch"}
            id={`${qId}-${optionId}-checkbox-process`}
            label="Process"
            onChange={(e) => {
              const k = process === "" ? "pitch" : "";
              this.handleSubQuestionChange(k, "process", optionId);
            }}
            style={{ margin: "0.5em" }}
          />
        </Form.Field>
      </Hoc>
    );
  }
}

export default AudioResponseBase;
