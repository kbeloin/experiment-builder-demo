import React from "react";
import { Form, Icon, Checkbox, Input } from "semantic-ui-react";
import Hoc from "../../../../hoc/hoc";

let id = 0;

class ShortResponseBase extends React.Component {
  handleQuestionChange = this.props.handleQuestionChange;
  qTypes = this.props.questionTypes;

  handleSubQuestionTitleChange = (e, optionId) => {
    const { option, question, qId } = this.props;
    const { title } = JSON.parse(option.value);

    this.handleQuestionChange(
      {
        ...question,
        options: {
          ...question.options,
          [optionId]: {
            value: JSON.stringify({
              title: e,
            }),
            target: option.target,
          },
        },
      },
      qId
    );
  };

  render() {
    const { option, optionId, question, qId, index } = this.props;
    const { title } = JSON.parse(option.value);

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
              this.handleSubQuestionTitleChange(e.target.value, optionId)
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
          <Input
            readonly
            disabled
            key={`${optionId}-${index}-label`}
            placeholder="Response Field"
            value={`Placeholder`}
            name="options"
          />
        </Form.Field>
      </Hoc>
    );
  }
}

export default ShortResponseBase;
