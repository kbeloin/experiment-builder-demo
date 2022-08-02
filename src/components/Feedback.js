const Feedback = (props) => {
  const check = (e) => {
    e.preventDefault();

    const qId = this.props.questions[this.state.current].props.questionId;
    const question = this.props.currentModule.questions.filter(
      (e) => e.id == qId
    )[0];

    const { target, options } = question;
    const typeMap = Object.values(question.config.type_mapping);

    const answers = Object.fromEntries(
      new Map(
        [...options.filter((e) => target.includes(e.id))].map((option, i) => {
          switch (questionTypes[typeMap[i]].target_type) {
            case "exact":
              return [option.id, option.answer];
            case "partial":
              return [option.id, option.answer];
            case "complete":
              return [option.id, undefined];
            default:
              return;
          }
        })
      )
    );

    const response = this.props.usersAnswers[qId];

    const evaluated = Object.fromEntries(
      new Map(
        Object.keys(response).map((key, i) => {
          // Because answers include all targets, encountering an undefined means response is optional.
          let r = response[key];
          let a = answers[key] ?? response[key];

          const validate = (e) => (Array.isArray(e) ? JSON.stringify(e) : e);

          return [key, validate(r) === validate(a)];
        })
      )
    );

    const prevAttempts = this.state.attempts;
    const nextAttempts = [...prevAttempts, response];

    if (!Object.values(evaluated).includes(false)) {
      this.setState({
        ...this.state,
        attempts: nextAttempts,
        targetMet: [true, "correct"],
      });
    } else {
      const incorrectAnswers = Object.fromEntries(
        Object.entries(response).filter(([key, value], i) => !evaluated[key])
      );

      if (
        parseInt(this.props.currentModule.config.num_attempts) ===
        nextAttempts.length
      ) {
        this.setState({
          ...this.state,
          attempts: nextAttempts,
          targetMet: [true, "attempts"],
          showFeeback: [false, null, incorrectAnswers],
        });
      } else {
        this.setState({
          ...this.state,
          attempts: nextAttempts,
          showFeeback: [true, "incorrect", incorrectAnswers],
        });
      }
    }
  };

  getFeedback = (feedback) => {
    switch (feedback) {
      case "correct":
        return (
          <Message
            success
            header="Correct!"
            content={
              this.state.current + 1 < this.props.questions.length ? (
                <Button
                  size="large"
                  positive
                  onClick={this.next}
                  content={"Next Question"}
                />
              ) : (
                <Button
                  size="large"
                  onClick={() =>
                    this.props.submit(
                      this.props.updateExperiment ?? this.update,
                      this.state.responseAttempts
                    )
                  }
                  content={"Submit"}
                />
              )
            }
          />
        );
      case "incorrect":
        return (
          <Message
            error
            header={`Incorrect`}
            content={
              <Segment basic>
                {`${
                  (this.props.currentModule.config.num_attempts ?? 3) -
                  this.state.attempts.length
                } Attempts Remaining`}
                <Button
                  size="large"
                  negative
                  onClick={() => {
                    this.setState({
                      ...this.state,
                      showFeeback: [false, null, null],
                    });
                  }}
                >
                  Try Again
                </Button>
              </Segment>
            }
          />
        );
      case "attempts":
        return (
          <Message
            error
            header={`Incorrect`}
            content={
              this.state.current + 1 < this.props.questions.length ? (
                <Container>
                  No Attempts Remaining
                  <Button negative onClick={this.next}>
                    Next Question
                  </Button>
                </Container>
              ) : null
            }
          />
        );
    }
  };
  return (
    <Popup
      basic
      as={Message}
      success={this.state.showFeeback[1] === "correct"}
      error={this.state.showFeeback[1] !== "correct"}
      attached
      wide
      trigger={
        <Button
          disabled={
            missingTargets.includes(null) ||
            missingTargets.includes("") ||
            this.state.showFeeback[0] === true
          }
          onClick={check}
          // disabled={this.state.attempts.length >= maxAttempts}
        >
          Check
        </Button>
      }
      content={this.getFeedback(this.state.showFeeback[1])}
      on="click"
      open={this.state.showFeeback[0]}
      onClose={this.handleClose}
      onOpen={this.handleOpen}
      position="top right"
    />
  );
};
