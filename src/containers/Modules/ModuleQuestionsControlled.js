import React from "react";
import { withRouter } from "react-router-dom";
import {
  Button,
  Container,
  Progress,
  Message,
  Header,
  Dimmer,
  Loader,
} from "semantic-ui-react";
import questionTypes from "../Questions/questionTypes";
import { connect } from "react-redux";
import Submitted from "../../components/Submitted";
import Hoc from "../../hoc/hoc";
import {
  updateValue as updateMDL,
  updateValues as updateMDLValues,
  end as endMDL,
} from "../../store/actions/moduleProgress";

export class QuestionsControlled extends React.Component {
  state = {
    submitted: false,
    current: 0,
    attempts: [],
    targetMet: [false, null],
    responseAttempts: {},
    showFeeback: [false, null, null],
    allTargets: [],
    allTargetsMet: [],
    timeStarted: null,
  };

  componentDidMount() {
    if (!this.props.moduleProgress.allTargets.length) {
      const targets = this.props.currentModule.questions.reduce(
        (prevTargets, { target }) => [...prevTargets, ...target],
        []
      );
      this.props.updateMDL("allTargets", targets);
    }

    // Listen for any audio recording events, and log them to the console
    window.addEventListener(
      "audioRecording",
      (e) => {
        console.log("audioRecording");
      } /*, false*/
    );
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.props.moduleProgress.submitted) {
      if (this.props.moduleProgress.targetMet[0] === true) {
        const qId =
          this.props.questions[this.props.moduleProgress.current].props
            .questionId;
        const prevAttempts = this.props.moduleProgress.attempts;
        const prevResponseAttempts = this.props.moduleProgress.responseAttempts;
        this.props.updateMDLValues({
          attempts: [],
          responseAttempts: {
            ...prevResponseAttempts,
            [qId]: prevAttempts,
          },
          targetMet: [false, null],

          showFeeback: [
            true,
            this.props.moduleProgress.targetMet[1],
            this.props.moduleProgress.targetMet[2] === "attempts"
              ? this.props.moduleProgress.showFeeback[2]
              : prevAttempts[-1],
          ],
        });
      }
      // Begin check for all targets met
      if (
        prevProps.moduleProgress.responseAttempts !==
        this.props.moduleProgress.responseAttempts
      ) {
        const checkTargets = this.props.moduleProgress.allTargets
          .map((targetId, i) => {
            const validTargets = Object.values(
              this.props.moduleProgress.responseAttempts
            ).reduce((prevValues, responseAttempt) => {
              const validTarget = [
                ...responseAttempt.filter((attempt) => attempt[targetId]),
              ];
              if (validTarget[0]?.[targetId] === undefined) {
                return [...prevValues];
              } else {
                return [...prevValues, targetId];
              }
            }, []);
            return validTargets;
          })
          .reduce((oldItems, newItems) => [...oldItems, ...newItems], []);
        this.props.updateMDLValues({
          allTargetsMet: checkTargets,
        });
      }
    } else {
      console.info("Submitted!");
    }
  }

  cardRef = React.createRef();

  onSubmit = (e) => {
    e.preventDefault();
    // get question id
    const qId =
      this.props.questions[this.props.moduleProgress.current].props.questionId;
    // get inherited submit function
    const submit = this.props.submit;

    const submitAttempts = this.props.updateExperiment ?? this.update;
    // check if responseAttempts is empty
    let responses;
    const prevAttempts =
      this.props.moduleProgress.attempts.length === 0
        ? [this.props.moduleProgress.usersAnswers[qId]]
        : this.props.moduleProgress.attempts;

    const newResponses = {
      ...this.props.moduleProgress.responseAttempts,
      [qId]: prevAttempts,
    };

    // submit responses
    submit(submitAttempts, newResponses);
  };

  update = () => {
    this.props.updateMDLValues({
      submitted: true,
    });
  };

  next = (e) => {
    e.preventDefault();
    // ensure that attempts are saved before moving to next question
    const qId =
      this.props.questions[this.props.moduleProgress.current].props.questionId;
    // is responseAttempts for this question empty?
    let newResponseAttempts = this.props.moduleProgress.responseAttempts;
    if (this.props.moduleProgress.responseAttempts[qId] === undefined) {
      // if so, save the current attempt from usersAnswers
      const attempts =
        [this.props.moduleProgress.usersAnswers[qId] ?? {}] ?? [];
      // update responseAttempts
      newResponseAttempts = {
        ...this.props.moduleProgress.responseAttempts,
        [qId]: attempts,
      };
    }

    const current = this.props.moduleProgress.current + 1;

    this.props.updateMDLValues({
      // state must be updated first before setting new state

      responseAttempts: {
        ...newResponseAttempts,
      },
      attempts: [],
      targetMet: [false, null],
      showFeeback: [false, null, null],
    });
    this.props.updateMDL("current", current);
  };

  prev() {
    const current = this.props.moduleProgress.current - 1;
    this.props.updateMDLValues({ current });
  }

  check = (e) => {
    e.preventDefault();

    const qId =
      this.props.questions[this.props.moduleProgress.current].props.questionId;
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

    const response = this.props.moduleProgress.usersAnswers[qId];

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

    const prevAttempts = this.props.moduleProgress.attempts;
    const nextAttempts = [...prevAttempts, response];

    if (!Object.values(evaluated).includes(false)) {
      this.props.updateMDLValues({
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
        this.props.updateMDLValues({
          attempts: nextAttempts,
          targetMet: [true, "attempts"],
          showFeeback: [false, null, incorrectAnswers],
        });
      } else {
        this.props.updateMDLValues({
          attempts: nextAttempts,
          showFeeback: [true, "incorrect", incorrectAnswers],
        });
      }
    }
  };
  // TODO: abstract this out to a new component
  getFeedback = (feedback) => {
    switch (feedback) {
      case "correct":
        return (
          <>
            <Header as="h3">Success!</Header>
            {this.props.moduleProgress.current + 1 <
            this.props.questions.length ? (
              <>
                <Header as="h4">{"Select 'Next' to continue"}</Header>
                <Button
                  size="large"
                  positive
                  onClick={this.next}
                  content={"Next"}
                />
              </>
            ) : (
              <>
                <Header as="h4">{"Select 'Submit' to continue"}</Header>
                <Button
                  size="large"
                  onClick={this.onSubmit}
                  content={"Submit"}
                />
              </>
            )}
          </>
        );
      case "incorrect":
        return (
          <>
            <Header as="h3">Incorrect</Header>
            {this.props.moduleProgress.current + 1 <=
            this.props.questions.length ? (
              <>
                <Header as="h4">
                  {`${
                    (this.props.currentModule.config.num_attempts ?? 3) -
                    this.props.moduleProgress.attempts.length
                  } Attempts Remaining`}
                </Header>
                <Button
                  size="large"
                  negative
                  onClick={() => {
                    this.props.updateMDLValues({
                      showFeeback: [false, null, null],
                    });
                  }}
                >
                  Try Again
                </Button>
              </>
            ) : (
              <>
                <Header as="h4">{"Select 'Submit' to continue"}</Header>
                <Button
                  size="large"
                  onClick={this.onSubmit}
                  content={"Submit"}
                />
              </>
            )}
          </>
        );
      case "attempts":
        return (
          <>
            <Header as="h3">Incorrect</Header>
            {this.props.moduleProgress.current + 1 <
            this.props.questions.length ? (
              <>
                <Header as="h4">{`No Attempts Remaining`}</Header>

                <Button size="large" negative onClick={this.next}>
                  Next
                </Button>
              </>
            ) : (
              <>
                <Header as="h4">{"Select 'Submit' to continue"}</Header>
                <Button
                  size="large"
                  onClick={this.onSubmit}
                  content={"Submit"}
                />
              </>
            )}
          </>
        );
    }
  };

  render() {
    const { allTargets, responseAttempts } = this.props.moduleProgress;
    const { questions, currentModule } = this.props;
    const { current } = this.props.moduleProgress;
    const maxAttempts = currentModule.config.num_attempts ?? 3;
    const show_feedback = currentModule.config.show_feedback ?? false;

    const SubmitButton = (
      <Button
        size="large"
        style={{ marginLeft: "auto" }}
        color="blue"
        onClick={this.onSubmit}
        content={`Submit`}
      />
    );

    const target = this.props.currentModule.questions.filter(
      (e) =>
        e.id ===
        this.props.questions[this.props.moduleProgress.current].props.questionId
    )[0].target;

    const response =
      this.props.moduleProgress.usersAnswers[
        this.props.questions[this.props.moduleProgress.current].props.questionId
      ];

    const missingTargets = response
      ? Object.entries(response)
          .filter(([key, value], i) => target.includes(parseInt(key)))
          .reduce((prev, curr) => [...prev, curr[1]], [])
      : [null];

    return (
      <Hoc>
        {this.props.loading ? (
          <Dimmer active>
            <Loader>Loading Modules...</Loader>
          </Dimmer>
        ) : (
          <Container
            fluid
            QuestionId={
              this?.props?.questions[this.props.moduleProgress.current]?.props
                ?.questionId ?? null
            }
            className="w-100 module__container--width"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1em",
              flex: "0 1 100%",
              margin: "unset",
            }}
          >
            {!this.props.moduleProgress.submitted ? (
              <>
                <div
                  style={{
                    paddingBottom: "64px",
                    display: "flex",
                    height: "100%",
                    flexDirection: "column",
                  }}
                  id={`module-${currentModule.id ?? null}`}
                  ref={this.cardRef}
                  className={"module__container"}
                >
                  <Progress
                    percent={((current + 1) / questions.length) * 100}
                    attached="top"
                  >
                    {current + 1}/{questions.length}
                  </Progress>
                  {questions[current]}
                </div>

                <Message
                  style={{ minHeight: "unset", position: "fixed" }}
                  className={
                    this.props.moduleProgress.showFeeback[1] === "correct"
                      ? "success module-controls"
                      : this.props.moduleProgress.showFeeback[1] === "incorrect"
                      ? "error module-controls"
                      : this.props.moduleProgress.showFeeback[1] === "attempts"
                      ? "error module-controls"
                      : "module-controls"
                  }
                  content={
                    <Container
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        margin: "0 !important",
                        alignItems: "center",
                      }}
                      className="module-controls__container"
                    >
                      {this.props.moduleProgress.showFeeback[0] ? (
                        this.getFeedback(
                          this.props.moduleProgress.showFeeback[1]
                        )
                      ) : (
                        <>
                          {/* Check if question type is Blank question type */}
                          {/* log question type */}
                          {questions[current].props.type?.name === "Blank" ??
                          null ? (
                            // If it is, render a next button but only if the user is not on the last question
                            current + 1 < questions.length ? (
                              <Button
                                size="large"
                                style={{ marginLeft: "auto" }}
                                color="blue"
                                onClick={this.next}
                                content={"Next"}
                              />
                            ) : (
                              // If it is not, render a submit button
                              SubmitButton
                            )
                          ) : // If it is not, render a next button but only if the user is not on the last question
                          current + 1 <= questions.length ? (
                            <Button
                              size="large"
                              style={{ marginLeft: "auto" }}
                              disabled={
                                missingTargets.includes(null) ||
                                missingTargets.includes("") ||
                                this.props.moduleProgress.showFeeback[0] ===
                                  true
                              }
                              color={
                                missingTargets.includes(null) ||
                                missingTargets.includes("") ||
                                this.props.moduleProgress.showFeeback[0] ===
                                  true
                                  ? ""
                                  : "blue"
                              }
                              onClick={
                                show_feedback
                                  ? this.check
                                  : current + 1 < questions.length
                                  ? this.next
                                  : this.onSubmit
                              }
                              // disabled={this.props.moduleProgress.attempts.length >= maxAttempts}
                            >
                              {/* if showFeedback in config for currenModule */}
                              {show_feedback
                                ? "Check"
                                : current + 1 < questions.length
                                ? "Next"
                                : "Submit"}
                            </Button>
                          ) : (
                            SubmitButton
                          )}
                        </>
                      )}
                    </Container>
                  }
                  attached
                />
              </>
            ) : (
              <Submitted />
            )}
          </Container>
        )}
      </Hoc>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    token: state.auth.token,
    currentModule: state.modules.currentModule,
    loading: state.modules.loading,
    username: state.auth.username,
    uploading: state.s3.loading,
    moduleProgress: state.moduleProgress,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateMDL: (key, value) => dispatch(updateMDL(key, value)),
    updateMDLValues: (values) => dispatch(updateMDLValues(values)),
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(QuestionsControlled)
);
