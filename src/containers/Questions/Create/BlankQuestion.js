// This class component will be used to create a new question without options
// It will be based on the CustomQuestion class component
// It will be used to create a new question without options
import React from "react";
import { Form } from "semantic-ui-react";
import Hoc from "../../../hoc/hoc";
import RichTextBox from "../../../components/RichTextBox";

class BlankQuestion extends React.Component {
  handleQuestionChange = this.props.handleQuestionChange;
  handleFileUpload = this.props.handleFileUpload;
  questionTypes = this.props.questionTypes;

  render() {
    const qId = this.props.id;
    const title = this.props.question.title ?? "";

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
      </Hoc>
    );
  }
}

export default BlankQuestion;
