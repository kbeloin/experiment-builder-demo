import React from "react";
import { Form, Icon, Button, Checkbox, Input } from "semantic-ui-react";
import Hoc from "../../../../hoc/hoc";

class ChoiceBase extends React.Component {
  handleQuestionChange = this.props.handleQuestionChange;
  qTypes = this.props.questionTypes;

  addChoice = (e, index) => {
    e.preventDefault();
    const { option, question, qId } = this.props;
    const { choices, answer, title } = JSON.parse(option.value);

    choices.push("");

    this.handleQuestionChange(
      {
        ...question,
        options: {
          ...question.options,
          [index]: {
            value: JSON.stringify({
              choices: choices,
              answer: answer,
              title: title,
            }),
            target: option.target,
          },
        },
      },
      qId
    );
  };

  handleChoiceChange = (e, index, i) => {
    const { option, question, qId } = this.props;
    const { choices, answer, title } = JSON.parse(option.value);

    choices[i] = e;
    this.handleQuestionChange(
      {
        ...question,
        options: {
          ...question.options,
          [index]: {
            value: JSON.stringify({
              choices: choices,
              answer: answer,
              title: title,
            }),
            target: option.target,
          },
        },
      },
      qId
    );
  };

  handleAnswerChange = (e, index) => {
    const { option, question, qId } = this.props;
    const { choices, title } = JSON.parse(option.value);
    this.handleQuestionChange(
      {
        ...question,
        options: {
          ...question.options,
          [index]: {
            value: JSON.stringify({
              choices: choices,
              answer: e,
              title: title,
            }),
            target: option.target,
          },
        },
      },
      qId
    );
  };

  handleSubQuestionTitleChange = (e, optionId) => {
    const { option, question, qId } = this.props;
    const { choices, answer } = JSON.parse(option.value);

    this.handleQuestionChange(
      {
        ...question,
        options: {
          ...question.options,
          [optionId]: {
            value: JSON.stringify({
              choices: choices,
              answer: answer,
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
    const { option, optionId, qId, index } = this.props;

    return (
      <Hoc key={`${qId}-${optionId}`}>
        <Form.Field
          as={"div"}
          style={{ display: "flex", alignItems: "center" }}
        >
          <Input
            key={optionId}
            placeholder="Enter subquestion description"
            onChange={(e) =>
              this.handleSubQuestionTitleChange(e.target.value, optionId)
            }
            value={JSON.parse(option.value).title ?? ""}
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
          {JSON.parse(option.value).choices.map((choice, i) => {
            return (
              <Form.Field
                as={"div"}
                style={{ display: "flex", alignItems: "center" }}
              >
                <Input
                  key={i}
                  placeholder="Answer choice"
                  onChange={(e) =>
                    this.handleChoiceChange(e.target.value, optionId, i)
                  }
                  value={choice}
                  name="options"
                  label={`${index + 1} . ${i + 1}`}
                />
                <Checkbox
                  checked={JSON.parse(option.value).answer === choice}
                  id={`${qId}-${optionId}-answer-checkbox`}
                  label="Answer"
                  onChange={(e) => this.handleAnswerChange(choice, optionId)}
                  style={{ margin: "0.5em" }}
                />
              </Form.Field>
            );
          })}
        </Form.Field>
        <Form.Field>
          <Button
            key={index}
            type="dashed"
            onClick={(e) => this.addChoice(e, optionId)}
            style={{ width: "60%" }}
          >
            <Icon name="plus" /> Add a choice.
          </Button>
        </Form.Field>
      </Hoc>
    );
  }
}

export default ChoiceBase;
