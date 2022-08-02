import React from "react";
import { Form, Icon, Button, Checkbox, Input } from "semantic-ui-react";
import eventReducer from "../../../components/utility";
import Hoc from "../../../hoc/hoc";
import RichTextBox from "../../../components/RichTextBox";

let id = 0;

class MultipleChoiceQuestion extends React.Component {
  handleQuestionChange = this.props.handleQuestionChange;

  remove = (k) => {
    const keys = this.props.question.options;

    if (keys.length === 1) return;
    const newKeys = Object.fromEntries(
      Object.entries(keys).filter(([key, value], index) => key != k)
    );

    this.handleQuestionChange(
      { ...this.question, options: newKeys },
      this.props.id
    );
  };

  add = (e) => {
    e.preventDefault();
    const keys = this.props.question.options ?? {};
    const valueString = JSON.stringify({
      choices: [],
      answer: null,
      title: "",
    });
    const nextKeys = {
      ...keys,
      [id]: { value: valueString, target: false },
    };
    ++id;
    this.handleQuestionChange(
      { ...this.question, options: nextKeys },
      this.props.id
    );
  };

  addChoice = (e, index) => {
    e.preventDefault();
    const { choices, answer, title } = JSON.parse(
      this.props.question.options[index].value
    );
    choices.push("");

    this.handleQuestionChange(
      {
        ...this.question,
        options: {
          ...this.props.question.options,
          [index]: {
            value: JSON.stringify({
              choices: choices,
              answer: answer,
              title: title,
            }),
            target: this.props.question.options[index].target,
          },
        },
      },
      this.props.id
    );
  };

  handleChoiceChange = (e, index, i) => {
    const { choices, answer, title } = JSON.parse(
      this.props.question.options[index].value
    );
    choices[i] = e;
    this.handleQuestionChange(
      {
        ...this.question,
        options: {
          ...this.props.question.options,
          [index]: {
            value: JSON.stringify({
              choices: choices,
              answer: answer,
              title: title,
            }),
            target: this.props.question.options[index].target,
          },
        },
      },
      this.props.id
    );
  };

  handleAnswerChange = (e, index) => {
    const { choices, answer, title } = JSON.parse(
      this.props.question.options[index].value
    );
    this.handleQuestionChange(
      {
        ...this.question,
        options: {
          ...this.props.question.options,
          [index]: {
            value: JSON.stringify({
              choices: choices,
              answer: e,
              title: title,
            }),
            target: this.props.question.options[index].target,
          },
        },
      },
      this.props.id
    );
  };

  handleSubQuestionTitleChange = (e, index) => {
    const { title, choices, answer } = JSON.parse(
      this.props.question.options[index].value
    );

    this.handleQuestionChange(
      {
        ...this.question,
        options: {
          ...this.props.question.options,
          [index]: {
            value: JSON.stringify({
              choices: choices,
              answer: answer,
              title: e,
            }),
            target: this.props.question.options[index].target,
          },
        },
      },
      this.props.id
    );
  };

  handleChange = (e, k, key) => {
    const keys = this.props.question;

    const newKeys = {
      ...keys,
      [e.target.name]: {
        ...keys[e.target.name],
        [k]: {
          ...keys[e.target.name][k],
          [key]: eventReducer(e),
        },
      },
    };
    this.handleQuestionChange({ ...newKeys }, this.props.id);
  };

  render() {
    const keys = this.props.question.options ?? {};
    const qId = this.props.id;
    const question = this.props.question;
    const title = this.props.question.title ?? "";

    const formItems = Object.keys(keys).map((k, index) => (
      <Hoc key={`${qId}-${k}`}>
        <Form.Field
          as={"div"}
          style={{ display: "flex", alignItems: "center" }}
        >
          <Input
            key={k}
            placeholder="Enter subquestion description"
            onChange={(e) =>
              this.handleSubQuestionTitleChange(e.target.value, k)
            }
            value={JSON.parse(keys[k].value).title ?? ""}
            name="options"
            label={index + 1}
          />
          <Checkbox
            checked={keys[k].target}
            id={`${qId}-${k}-checkbox`}
            label="Target"
            onChange={(e) => this.handleChange(e, k, "target")}
            style={{ margin: "0.5em" }}
            name="options"
          />
          {Object.keys(keys).length > 1 ? (
            <Icon
              name="minus circle"
              disabled={keys.length === 1}
              onClick={() => this.remove(k)}
              style={{ margin: "0.5em" }}
            />
          ) : null}
        </Form.Field>
        <Form.Field>
          {JSON.parse(keys[k].value).choices.map((choice, i) => {
            return (
              <Form.Field
                as={"div"}
                style={{ display: "flex", alignItems: "center" }}
              >
                <Input
                  key={i}
                  placeholder="Answer choice"
                  onChange={(e) =>
                    this.handleChoiceChange(e.target.value, k, i)
                  }
                  value={choice}
                  name="options"
                  label={`${index + 1} . ${i + 1}`}
                />
                <Checkbox
                  checked={JSON.parse(keys[k].value).answer == choice}
                  id={`${qId}-${k}-answer-checkbox`}
                  label="Answer"
                  onChange={(e) => this.handleAnswerChange(choice, k)}
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
            onClick={(e) => this.addChoice(e, k)}
            style={{ width: "60%" }}
          >
            <Icon name="plus" /> Add a choice.
          </Button>
        </Form.Field>
      </Hoc>
    ));
    return (
      <Hoc>
        <Form.Field style={{ display: "flex", flexDirection: "column" }}>
          <RichTextBox
            handleChange={(e) =>
              this.handleQuestionChange({ ...question, title: e }, qId)
            }
            title={question.title ?? ""}
            key={`question-${qId}`}
          />
        </Form.Field>
        <h3>Subquestions: </h3>
        {formItems}
        <Button
          key={id}
          type="dashed"
          onClick={this.add}
          style={{ width: "60%" }}
        >
          <Icon name="plus" /> Add a subquestion.
        </Button>
      </Hoc>
    );
  }
}

export default MultipleChoiceQuestion;
