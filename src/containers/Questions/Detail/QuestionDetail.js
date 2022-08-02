import React from "react";
import { Form, Card, Segment } from "semantic-ui-react";
import Hoc from "../../../hoc/hoc";
import cardStyle from "../../../containers/Style/cardStyle";

class Question extends React.Component {
  state = {
    responses:
      this.props.usersAnswers[this.props.questionId] ??
      this.props.options.map((e, i) => {
        return "";
      }),
  };

  handleResponse = (response, responseId, questionId) => {
    const responses = this.props.usersAnswers[this.props.questionId] ?? {};
    const newResponses = { ...responses, [responseId]: response };
    this.props.change(newResponses, questionId);
  };

  render() {
    const { questionId, options, question, type } = this.props;
    return (
      <Hoc>
        <Card
          key={questionId}
          style={{ ...cardStyle, width: "100%", height: "100%" }}
        >
          <Segment
            style={{ height: "auto" }}
            className={"ql-editor"}
            basic
            dangerouslySetInnerHTML={{ __html: question }}
          />
          {options.map((option, index) => {
            return (
              <Form.Field
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginBottom: "1em",
                  gap: ".5em",
                }}
              >
                <type.view
                  questionId={questionId}
                  responseId={index}
                  option={option}
                  response={this.props.usersAnswers[questionId] ?? {}}
                  key={`${questionId}-${index}-${type}`}
                  update={(response) =>
                    this.handleResponse(response, index, questionId)
                  }
                />
              </Form.Field>
            );
          })}
        </Card>
      </Hoc>
    );
  }
}

export default Question;
