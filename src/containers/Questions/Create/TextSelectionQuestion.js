import React from "react";
import { Form, Icon, Button, Checkbox, Input } from "semantic-ui-react";
import eventReducer from "../../../components/utility";
import Hoc from "../../../hoc/hoc";
import RichTextBox from "../../../components/RichTextBox";

let id = 0;

class TextSelectionQuestion extends React.Component {
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
      source: "",
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

  handleAnswerChange = (e, index, i) => {
    e.preventDefault();
    const { choices, answer, source } = JSON.parse(
      this.props.question.options[index].value
    );

    const newAnswers = answer;
    newAnswers[i] = newAnswers[i] === "" ? e.target.value : "";

    this.handleQuestionChange(
      {
        ...this.question,
        options: {
          ...this.props.question.options,
          [index]: {
            value: JSON.stringify({
              choices: choices,
              answer: newAnswers,
              source: source,
            }),
            target: this.props.question.options[index].target,
          },
        },
      },
      this.props.id
    );
  };

  handleTextSourceChange = (e, index) => {
    const { choices, answer, source } = JSON.parse(
      this.props.question.options[index].value
    );

    this.handleQuestionChange(
      {
        ...this.question,
        options: {
          ...this.props.question.options,
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
            placeholder="Enter source text"
            onChange={(e) => this.handleTextSourceChange(e.target.value, k)}
            value={JSON.parse(keys[k].value).source ?? ""}
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
          <Button.Group
            size="small"
            style={{ border: "unset", flexWrap: "wrap" }}
          >
            {JSON.parse(keys[k].value).choices.map((choice, i) => {
              var answer = JSON.parse(keys[k].value).answer[i];
              return (
                <Button
                  key={i}
                  value={choice}
                  active={answer === choice}
                  color={answer === choice ? "green" : ""}
                  onClick={(e) => this.handleAnswerChange(e, k, i)}
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

export default TextSelectionQuestion;
