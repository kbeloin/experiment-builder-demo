import React from "react";
import { Form, Icon, Checkbox, Input, Label } from "semantic-ui-react";
import Hoc from "../../../../hoc/hoc";

let id = 0;

class SliderResponseBase extends React.Component {
  state = {
    sliderValue: 0,
  };

  handleQuestionChange = this.props.handleQuestionChange;
  qTypes = this.props.questionTypes;

  handleSubQuestionTitleChange = (e, optionId) => {
    e.preventDefault();
    const { option, question, qId } = this.props;
    const { title, min, max, step } = JSON.parse(option.value);

    const value = JSON.parse(option.value);
    const NewValue = {
      ...value,
      [e.target.name]: e.target.value,
    };

    this.handleQuestionChange(
      {
        ...question,
        options: {
          ...question.options,
          [optionId]: {
            value: JSON.stringify({
              ...NewValue,
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
    const { title, min, max, step } = JSON.parse(option.value);

    return (
      <Hoc>
        <Form.Field
          as={"div"}
          style={{ display: "flex", alignItems: "center" }}
        >
          <Input
            key={`${optionId}-${index}-label`}
            maxlength="255"
            placeholder="Instructions for additional input"
            onChange={(e) => {
              e.preventDefault();
              this.handleSubQuestionTitleChange(e, optionId);
            }}
            value={title}
            name="title"
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
            key={`${optionId}-${index}-label-min`}
            placeholder="min"
            type={`number`}
            onChange={(e) => {
              e.preventDefault();
              this.handleSubQuestionTitleChange(e, optionId);
            }}
            value={min}
            name="min"
            label={"Min"}
          />
          <Input
            key={`${optionId}-${index}-label-max`}
            placeholder="max"
            type={`number`}
            onChange={(e) => {
              e.preventDefault();
              this.handleSubQuestionTitleChange(e, optionId);
            }}
            value={max}
            name="max"
            label={"Max"}
          />
          <Input
            key={`${optionId}-${index}-label-step`}
            placeholder="step"
            type={`number`}
            onChange={(e) => {
              e.preventDefault();
              this.handleSubQuestionTitleChange(e, optionId);
            }}
            value={step}
            name="step"
            label={"Step"}
          />
        </Form.Field>
        <Form.Field>
          <Label
            className="bg-none"
            style={{
              display: "flex",
              width: "fit-content",
              gap: "1rem",
              backgroundColor: "none",
              width: "100%",
              justifyContent: "center",
            }}
          >
            <input
              style={{ width: "min(75%,600px" }}
              type={"range"}
              key={`${optionId}-${index}-label`}
              placeholder="Response Field"
              value={this.state.sliderValue}
              name="options"
              min={min}
              max={max}
              step={step}
              onChange={(e) => {
                this.setState({
                  sliderValue: e.target.value,
                });
              }}
            />
            <p style={{ margin: "0" }}>{`${this.state.sliderValue}`}</p>
          </Label>
        </Form.Field>
      </Hoc>
    );
  }
}

export default SliderResponseBase;
