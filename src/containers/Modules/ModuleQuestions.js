import React from "react";
import { Button, Container, Progress } from "semantic-ui-react";
import Submitted from "../../components/Submitted";

class Questions extends React.Component {
  // This should be in the moduleProgress actions file
  state = {
    current: 0,
    submitted: false,
  };

  next() {
    const current = this.state.current + 1;
    this.setState({ current });
  }

  prev() {
    const current = this.state.current - 1;
    this.setState({ current });
  }

  render() {
    const { current } = this.state;
    const { questions, usersAnswers, currentModule } = this.props;
    return (
      <Container
        fluid
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1em",
          flex: "0 1 100%",
        }}
      >
        <Progress
          value={`${current + 1}`}
          total={`${questions.length}`}
          progress="ratio"
        />
        {!this.state.submitted ? (
          <>
            <div
              style={{ flex: "1 1 100%" }}
              id={`module-${currentModule.id ?? null}`}
            >
              {questions[current]}
            </div>

            <Container
              style={{
                display: "flex",
                flexDirection: "row",
                position: "fixed",
                top: "90vh",
                right: "1em",
                justifyContent: "flex-end",
              }}
            >
              <Button disabled={!(current > 0)} onClick={() => this.prev()}>
                Previous
              </Button>
              <Button
                disabled={!(current < questions.length - 1)}
                onClick={() => this.next()}
              >
                Next
              </Button>
              <Button
                disabled={this.props.loading || this.state.submitted}
                onClick={() =>
                  this.props.submit(
                    this.setState({ ...this.state, submitted: true })
                  )
                }
              >
                Submit
              </Button>
            </Container>
          </>
        ) : (
          <Submitted />
        )}
      </Container>
    );
  }
}

export default Questions;
