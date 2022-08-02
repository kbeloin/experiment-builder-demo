import React from "react";
import { Form, Card, Segment, Divider, Grid } from "semantic-ui-react";
import Hoc from "../../../hoc/hoc";
import cardStyle from "../../../containers/Style/cardStyle";
import questionTypes from "../questionTypes";
import { connect } from "react-redux";

// component used by CustomQuestion
class CustomQuestion extends React.Component {
  state = {
    startTime: new Date(),
    currentResponse: null,
    responseTimes: {}, // {responseId: timeTaken}
  };

  // When component is mounted, save a timestamp of when the component was mounted
  // so that we can track how long it takes for the user to complete the question

  // check if on the same question as before and if not get the time it took to complete the question
  componentDidUpdate(prevProps) {
    if (
      prevProps.questionId !== this.props.questionId &&
      this.props.questionId !== null
    ) {
      // reset the start time
      this.setState({ startTime: new Date() });
    }
  }

  // When component is unmounted, save the time it took the user to complete the question

  handleResponse = (response, responseId, questionId) => {
    // get the time
    const { startTime } = this.state;
    const endTime = new Date();
    const timeTaken = endTime - startTime;

    const responses = this.props.usersAnswers[this.props.questionId] ?? {};
    const newResponses = { ...responses, [responseId]: response };
    // set the response time in the parent
    this.props.change(newResponses, questionId, timeTaken, responseId);
  };

  // if the currentResponse is null, set the response to the response

  render() {
    const { questionId, options, question, types } = this.props;
    const qTypes = Object.values(types || {});
    return (
      <Hoc>
        <Card
          key={questionId}
          style={{
            ...cardStyle,
            width: "100%",
            height: "100%",
            flexDirection: "column",
            position: "relative",
            justifyContent: "center",
          }}
        >
          <Grid stackable divided="horizontally" style={{ height: "100%" }}>
            <Grid.Row stackable columns={2} style={{ height: "100%" }}>
              <Grid.Column style={{ height: "100%" }}>
                <Segment
                  basic
                  style={{ height: "100%", overflow: "auto" }}
                  dangerouslySetInnerHTML={{ __html: question }}
                />
              </Grid.Column>
              <Grid.Column style={{ height: "100%" }}>
                <Segment basic style={{ height: "100%", overflow: "auto" }}>
                  {options.map((option, index) => {
                    const qType = questionTypes[qTypes[index]];
                    return (
                      <Form.Field
                        className={`${qTypes[index]} question`}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          marginBottom: "1em",
                          gap: ".5em",
                        }}
                      >
                        <div datatype="option" dataid={option.id}>
                          <qType.view
                            questionId={questionId}
                            responseId={index}
                            option={option}
                            response={this.props.usersAnswers[questionId] ?? {}}
                            key={`${questionId}-${index}-${qType}`}
                            update={(response) =>
                              this.handleResponse(
                                response,
                                option.id,
                                questionId
                              )
                            }
                            upload={this.props.upload}
                            onUpload={this.props.onUpload}
                            uploading={this.props.uploading}
                          />
                        </div>
                      </Form.Field>
                    );
                  })}
                </Segment>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Card>
      </Hoc>
    );
  }
}

export default CustomQuestion;
