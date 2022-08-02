import React from "react";
import { Form, Icon, Button, Checkbox, Input } from "semantic-ui-react";
import eventReducer from "../../../components/utility";
import Recorder from "../Detail/Recorder";
import Hoc from "../../../hoc/hoc";
import RichTextBox from "../../../components/RichTextBox";

let id = 0;

class AudioResponseQuestion extends React.Component {
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
    const keys =
      id < 1
        ? { 0: { value: "Default", target: true } }
        : this.props.question.options;
    if (id < 1) {
      ++id;
    }
    const nextKeys = { ...keys, [id]: { value: "", target: false } };
    ++id;
    this.handleQuestionChange(
      { ...this.question, options: nextKeys },
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

  componentDidMount() {
    if (
      this.props.question.options === undefined ||
      this.props.question.options === null
    ) {
      this.handleQuestionChange(
        {
          ...this.question,
          options: { 0: { value: "Default", target: true } },
        },
        this.props.id
      );
      ++id;
    }
  }

  render() {
    const keys = this.props.question.options ?? {};
    const qId = this.props.id;
    const question = this.props.question;
    const title = question.title ?? "";

    const formItems = Object.keys(keys).map((k, index) => (
      <Hoc key={`${qId}-${k}`}>
        {k > 0 ? (
          <Hoc>
            <Form.Field
              as={"div"}
              style={{ display: "flex", alignItems: "center" }}
            >
              <Input
                key={`${k}-${index}-label`}
                placeholder="Instructions for additional input"
                onChange={(e) => this.handleChange(e, k, "value")}
                value={keys[k].value}
                name="options"
              />
              <Checkbox
                checked={keys[k].target}
                id={`${qId}-${k}-checkbox`}
                label="Target"
                onChange={(e) => this.handleChange(e, k, "target")}
                style={{ margin: "0.5em" }}
                name="options"
              />
              <Icon
                name="minus circle"
                disabled={k === 0}
                onClick={() => this.remove(k)}
                style={{ margin: "0.5em" }}
              />
            </Form.Field>
            <Form.Field>
              <Recorder />
            </Form.Field>
          </Hoc>
        ) : null}
      </Hoc>
    ));

    return (
      <Hoc>
        <Form.Field style={{ display: "flex", flexDirection: "column" }}>
          <RichTextBox
            title={title ?? ""}
            handleChange={(e) =>
              this.handleQuestionChange({ ...question, title: e }, qId)
            }
            key={`question-${qId}`}
          />
        </Form.Field>
        <Form.Field
          as={"div"}
          style={{ display: "flex", alignItems: "center" }}
        >
          <Recorder />
          <Checkbox
            disabled
            readonly
            checked={true}
            id={`checkbox`}
            label="Target"
            style={{ margin: "0.5em" }}
            name="options"
          />
        </Form.Field>
        {formItems}
        <Button
          key={id}
          type="dashed"
          onClick={this.add}
          style={{ width: "60%" }}
        >
          <Icon name="plus" /> Add additional input field
        </Button>
      </Hoc>
    );
  }
}

export default AudioResponseQuestion;
