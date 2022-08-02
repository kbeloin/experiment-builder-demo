import React from "react";
import { Form, Icon, Button } from "semantic-ui-react";
import eventReducer from "../../../components/utility";
import Hoc from "../../../hoc/hoc";
import RichTextBox from "../../../components/RichTextBox";
import CustomDropdown from "../../../components/Dropdown";

let id = 0;

class CustomQuestion extends React.Component {
  handleQuestionChange = this.props.handleQuestionChange;
  handleFileUpload = this.props.handleFileUpload;
  questionTypes = this.props.questionTypes;
  dropdownOptions = this.props.dropdownOptions;

  state = {
    selectedType: "multiple_choice",
  };

  remove = (k) => {
    const options = this.props.question.options;
    const config = this.props.question.config;

    if (options.length === 1) return;
    const newOptions = Object.fromEntries(
      Object.entries(options).filter(([key, value], index) => key != k)
    );

    const newConfig = {
      ...config,
      type_mapping: Object.fromEntries(
        Object.entries(config.type_mapping).filter(
          ([key, value], index) => key != k
        )
      ),
    };

    this.handleQuestionChange(
      { ...this.props.question, options: newOptions, config: newConfig },
      this.props.id
    );
  };

  add = (e) => {
    e.preventDefault();
    const options = this.props.question.options ?? {};
    const config = this.props.question.config;
    const qType = this.state.selectedType;
    const qTypes = this.props.questionTypes;

    const optionsValue = qTypes[qType].default_value;

    const newConfig = {
      ...config,
      type_mapping: {
        ...config.type_mapping,
        [id]: qType,
      },
    };

    const newOptions = {
      ...options,
      [id]: { value: optionsValue, target: true },
    };

    ++id;

    this.handleQuestionChange(
      { ...this.props.question, options: newOptions, config: newConfig },
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
    const options = this.props.question.options ?? {};
    const qId = this.props.id;
    const question = this.props.question;
    const title = this.props.question.title ?? "";

    const formItems = Object.entries(options).map(([key, value], index) => {
      const qType = this.props.questionTypes[question.config.type_mapping[key]];
      return (
        <div dataid={key} datatype={"option"}>
          <qType.base
            option={value}
            optionId={key}
            question={question}
            qId={qId}
            index={index}
            handleChange={this.handleChange}
            handleQuestionChange={this.handleQuestionChange}
            remove={this.remove}
          />
        </div>
      );
    });
    return (
      <Hoc>
        <Form.Field style={{ display: "flex", flexDirection: "column" }}>
          <RichTextBox
            handleChange={(e) =>
              this.props.handleQuestionChange(
                // This must refer to props > question because most recent returned does not contain new props.
                { ...this.props.question, title: e },
                qId
              )
            }
            title={title}
            uniqueId={`question-${qId}`}
            handleFileUpload={(file, callback, options) =>
              this.props.handleFileUpload(file, callback, options)
            }
            handleFileChange={(e) =>
              this.props.handleQuestionChange(
                // This must refer to props > question because most recent returned does not contain new props.
                {
                  ...this.props.question,
                  files: this.props.question.files.concat([e]),
                },
                qId
              )
            }
            handleEmbed={({ embed, instructions }) =>
              this.props.handleQuestionChange(
                // This must refer to props > question because most recent returned does not contain new props.
                {
                  ...this.props.question,
                  embeds: this.props.question.embeds.concat(embed),
                  title: instructions,
                },
                qId
              )
            }
          />
        </Form.Field>
        <h3>Fields: </h3>
        {formItems}
        <Button
          key={id}
          type="dashed"
          onClick={this.add}
          style={{ width: "60%", marginTop: "2em" }}
        >
          <Icon name="plus" /> Add Selected Field Type
        </Button>
        <CustomDropdown
          options={this.dropdownOptions}
          handleChange={(value) => {
            this.setState({ ...this.state, selectedType: value });
          }}
          id={`question-${qId}`}
          value={this.state.selectedType}
          name={"qType"}
        />
      </Hoc>
    );
  }
}

export default CustomQuestion;
