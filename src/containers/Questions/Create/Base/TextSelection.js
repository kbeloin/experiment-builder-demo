import React from "react";
import { Form, Icon, Button, Checkbox, Input } from "semantic-ui-react";
import Hoc from "../../../../hoc/hoc";

let id = 0;

class TextSelectionBase extends React.Component {
  handleQuestionChange = this.props.handleQuestionChange;
  qTypes = this.props.questionTypes;

  handleAnswerChange = (e, index, i) => {
    e.preventDefault();
    const { option, question, qId } = this.props;
    const { choices, answer, source, title } = JSON.parse(option.value);

    const newAnswers = answer;
    newAnswers[i] = newAnswers[i] === "" ? e.target.value : "";

    this.handleQuestionChange(
      {
        ...question,
        options: {
          ...question.options,
          [index]: {
            value: JSON.stringify({
              choices: choices,
              answer: newAnswers,
              source: source,
              title: title,
            }),
            target: option.target,
          },
        },
      },
      qId
    );
  };

  handleTextSourceChange = (e, index) => {
    const { option, question, qId } = this.props;
    const { title } = JSON.parse(option.value);
    this.handleQuestionChange(
      {
        ...question,
        options: {
          ...question.options,
          [index]: {
            value: JSON.stringify({
              choices: e !== "" ? e.split(" ") : [],
              answer:
                e !== ""
                  ? e.split(" ").map((e) => {
                      return "";
                    })
                  : [],
              source: e,
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
    const { choices, answer, source } = JSON.parse(option.value);

    this.handleQuestionChange(
      {
        ...question,
        options: {
          ...question.options,
          [optionId]: {
            value: JSON.stringify({
              choices: choices,
              answer: answer,
              source: source,
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

    return (
      <Hoc key={`${qId}-${optionId}`}>
        <Form.Field
          as={"div"}
          style={{ display: "flex", alignItems: "center" }}
        >
          <Input
            key={`${optionId}-subtitle`}
            placeholder="Question Description"
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
        <Form.Field
          as={"div"}
          style={{ display: "flex", alignItems: "center" }}
        >
          <Input
            key={`${optionId}-source`}
            placeholder="Enter source text"
            onChange={(e) =>
              this.handleTextSourceChange(e.target.value, optionId)
            }
            value={JSON.parse(option.value).source ?? ""}
            name="options"
            label={"Source Text"}
          />
        </Form.Field>
        <Form.Field>
          <Button.Group
            label={"Answers"}
            size="small"
            style={{ border: "unset", flexWrap: "wrap" }}
          >
            <div
              className="ui label"
              style={{
                paddingTop: "1em",
                paddingBottom: "1em",
              }}
            >
              {"Select Answers"}
            </div>
            {JSON.parse(option.value).choices.map((choice, i) => {
              var answer = JSON.parse(option.value).answer[i];
              return (
                <Button
                  key={i}
                  value={choice}
                  active={answer === choice}
                  color={answer === choice ? "green" : "grey"}
                  onClick={(e) => this.handleAnswerChange(e, optionId, i)}
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
      </Hoc>
    );
  }
}

export default TextSelectionBase;
