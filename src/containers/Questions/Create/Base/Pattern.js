import React from "react";
import { Form, Icon, Button, Checkbox, Input } from "semantic-ui-react";
import Hoc from "../../../../hoc/hoc";
import PatternElement from "../../../../components/PatternElement";
import PatternContextElement from "../../../../components/Popup/PatternContextElement";

let id = 0;

class PatternMatchingBase extends React.Component {
  handleQuestionChange = this.props.handleQuestionChange;
  qTypes = this.props.questionTypes;

  handleSubQuestionChange = (e, key, optionId) => {
    const { option, question, qId } = this.props;

    const value = JSON.parse(option.value);

    // Using pattern_matching question type

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

  addAnswer = (choice) => {
    const { optionId, option } = this.props;

    const { answer } = JSON.parse(option.value);

    const newAnswer = [...answer, choice];

    this.handleSubQuestionChange(newAnswer, "answer", optionId);
  };

  addChoice = (choice) => {
    // add choice to question
    const { option, optionId } = this.props;
    const { choices } = JSON.parse(option.value);
    // set choice id to length of choices array + 1
    const choiceId = id++;
    const newChoices = [...choices, { ...choice, id: choiceId }];

    this.handleSubQuestionChange(newChoices, "choices", optionId);
  };

  editChoice = (choice) => {
    // edit choice in question
    const { option, optionId } = this.props;
    const { choices } = JSON.parse(option.value);
    const newChoices = choices.map((c) => {
      if (c.id === choice.id) {
        return choice;
      }
      return c;
    });

    this.handleSubQuestionChange(newChoices, "choices", optionId);
  };

  deleteElement = (elements, key, index) => {
    const { optionId } = this.props;

    const newElements = [...elements];
    newElements.splice(index, 1);
    // get the object choice at index and check if it has an id

    this.handleSubQuestionChange(newElements, key, optionId);
  };

  render() {
    const { option, optionId, qId, index } = this.props;
    const { title, choices, answer } = JSON.parse(option.value);

    const patternChoices = choices.map((choice, i) => (
      <PatternContextElement
        index={i}
        choice={choice}
        onClick={() => this.addAnswer(choice.id)}
        onEdit={(choice) => this.editChoice(choice)}
        onDelete={(i) => {
          this.deleteElement(choices, "choices", i);
        }}
      />
    ));

    const answerChoices = answer.map((a, i) => {
      const choice = choices.find((choice) => choice.id === a);
      // if choice is not found, return null and delete the answer
      if (!choice) {
        this.deleteElement(answer, "answer", i);
        return null;
      }
      return (
        <PatternContextElement
          choice={choice}
          onEdit={undefined}
          onDelete={(i) => {
            this.deleteElement(answer, "answer", i);
          }}
          index={i}
        />
      );
    });

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
            link
            name="minus circle"
            onClick={() => this.props.remove(optionId)}
            style={{ margin: "0.5em" }}
          />
        </Form.Field>
        <Form.Field>
          {/* Row of buttons that represent the answers chosen from  */}
          <div style={{ display: "flex", flexDirection: "row" }}>
            <Button
              color={"blue"}
              style={{ width: "100px" }}
              type={"button"}
              onClick={() => null}
            >
              Answer:{" "}
            </Button>
            {answerChoices}
          </div>
        </Form.Field>
        <Form.Field>
          {/* Row of buttons that represent rendered choices */}
          <div
            id={`pattern-choices-${optionId}`}
            style={{ display: "flex", flexWrap: "wrap" }}
          >
            <Button
              color={"blue"}
              style={{ width: "100px" }}
              type={"button"}
              onClick={() => null}
            >
              Choices:{" "}
            </Button>

            {patternChoices}
          </div>
        </Form.Field>
        <Form.Field style={{ marginBottom: "2em" }}>
          {/* Add choice element */}

          <PatternElement
            num={choices.length + 1}
            optionId={optionId}
            index={index}
            addChoice={this.addChoice}
          />
        </Form.Field>
      </Hoc>
    );
  }
}

export default PatternMatchingBase;
