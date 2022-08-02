import React from "react";
import { Redirect, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Dimmer, Loader, Icon, Grid, Button } from "semantic-ui-react";
import QuestionsControlled from "./ModuleQuestionsControlled";
import Questions from "./ModuleQuestions";
import { getMDLSDetail } from "../../store/actions/modules";
import { createCompletedMDL } from "../../store/actions/completedModules";
import { updateCurrentMDL } from "../../store/actions/modules";
import { bottomRight as buttonStyle } from "../Style/buttonStyle";
import {
  start as startMDL,
  submit as submitMDL,
  updateValue as updateMDL,
  updateValues as updateMDLs,
  end as endMDL,
} from "../../store/actions/moduleProgress";
import { uploadFILE } from "../../store/actions/s3";
import CustomModal from "../../components/Modal";
import Hoc from "../../hoc/hoc";
import questionTypes from "../Questions/questionTypes";
import Submitted from "../../components/Submitted";
import Question from "../Questions/Detail/QuestionDetail";
import CustomQuestion from "../Questions/Detail/CustomQuestionDetail";
import ModuleConfigPreview from "../../components/Modals/ModuleConfigPreview";
import { Link } from "react-router-dom";
import PromptToLeave from "../../components/Popup/BlockingPrompt";
import { getCompletedEXPS } from "../../store/actions/completedExperiments";

const sortQuestions = (questions) => {
  const sortedQuestions = questions.sort((a, b) => {
    if (a.order > b.order) {
      return 1;
    }
    if (a.order < b.order) {
      return -1;
    }
    return 0;
  });
  return sortedQuestions;
};

const moduleController = (user_progress) => {
  switch (user_progress) {
    case "Controlled":
      return QuestionsControlled;
    case "Uncontrolled":
      return Questions;
    default:
      return Questions;
  }
};

class ModuleDetail extends React.Component {
  state = {
    submitted: false,
    usersAnswers: {},
    files: [],
    callback: null,
    experiment: null,
    timestamps: {},
  };

  componentDidMount() {
    const exp = this.props.location.state?.userExperiment?.id ?? null;

    if (this.props.token !== undefined && this.props.token !== null) {
      if (exp) {
        this.setState({ ...this.state, experiment: exp });
      }
      this.props.getMDLSDetail(
        this.props.token,
        this.props.location.state.mdl,
        ({ id }) => {
          this.props.moduleProgress.started &&
          this.props.moduleProgress.mdlId === id
            ? console.log("module already started")
            : // check if submitted
            this.props.moduleProgress.submitted
            ? console.log("module already submitted")
            : this.props.startMDL(this.props.token, id ?? null, exp ?? null);
        }
      );
    }
  }

  componentWillReceiveProps(newProps) {
    if (newProps.token !== this.props.token) {
      if (newProps.token !== undefined && newProps.token !== null) {
        // Call the action to start create a completed module, and then start module
        this.props.getMDLSDetail(
          newProps.token,
          this.props.location.state.mdl,
          ({ id }) => {
            this.props.moduleProgress.started
              ? console.log("module already started")
              : this.props.startMDL(
                  this.props.token,
                  id ?? null,
                  this.state.exp ?? null
                );
          }
        );
      }
    }
    const prevMdl = this.props.currentModule.id ?? null;
    const currentMdl = this.props.location.state.mdl ?? null;
  }

  // check if component is updated
  componentDidUpdate(prevProps, prevState) {
    // check if the current module is submitted
    if (
      !prevProps.moduleProgress.submitted &&
      this.props.moduleProgress.submitted
    )
      this.onSubmit();
  }

  onChange = (e, qId, timeTaken, responseId) => {
    const { usersAnswers, timestamps } = this.props.moduleProgress;

    const newAnswers = { ...usersAnswers, [qId]: e };
    const newTimestamps = { ...timestamps, [responseId]: timeTaken };

    this.props.updateMDLValues({
      usersAnswers: newAnswers,
      timestamps: newTimestamps,
    });
  };

  handleFileUpload = (data, callback, option) => {
    this.props.uploadFILE(this.props.token, data, callback, option);
  };

  onSubmit = () => {
    const { usersAnswers, files, callback, timestamps, mdlId, userMdlId } =
      this.props.moduleProgress;
    // would prefer to get this from store
    const exp = this.props.location.state?.userExperiment?.id ?? null;

    let mdl = {
      username: this.props.username,
      mdlId,
      userMdlId,
      responses: usersAnswers,
      files,
      timestamps,
    };

    if (exp) {
      mdl = { ...mdl, expId: exp };
    }

    this.props.createCompletedMDL(this.props.token, mdl, callback);
  };

  handleSubmit = (callback, attempts) => {
    const { usersAnswers } = this.props.moduleProgress;

    // set state to submitted and callback to the callback and the users answers
    this.props.updateMDLValues({
      usersAnswers: attempts ?? usersAnswers,
      callback,
      submitted: true,
    });
  };

  render() {
    const { currentModule, token } = this.props;
    const { title, instructions, questions } = currentModule;

    const { usersAnswers } = this.props.moduleProgress;

    const progressComponent = currentModule.config?.user_progress ?? false;
    const moduleDict = { module: moduleController(progressComponent) };

    if (token === null) {
      return <Redirect to="/login" />;
    }
    return (
      <Hoc>
        {this.props.loading ? (
          <Grid className="h-100">
            <Dimmer active>
              <Loader>Preparing Activity...</Loader>
            </Dimmer>
          </Grid>
        ) : Object.keys(currentModule).length > 0 ? (
          <>
            {this.props.loading ? (
              <Grid className="h-100">
                <Dimmer active>
                  <Loader>Preparing Activity {title}...</Loader>
                </Dimmer>
              </Grid>
            ) : (
              <Grid
                stackable
                padded
                className="h-100 w-100"
                style={{
                  flexWrap: "nowrap",
                  flexDirection: "column",
                  bottom: "1rem",
                  width: "100%",
                }}
              >
                <Grid.Row style={{ height: "fit-content" }} columns={1}>
                  <Grid.Column style={{ display: "flex" }}>
                    {this.props.is_moderator && <ModuleConfigPreview />}

                    <CustomModal
                      data={{ __html: instructions }}
                      element={
                        <Icon
                          link
                          title="Show Instructions"
                          name="help circle"
                          size="large"
                          id="show-instructions-modal"
                          style={{ marginLeft: "auto" }}
                        />
                      }
                    />
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row
                  style={{
                    flex: "1 1 0%",
                  }}
                >
                  {progressComponent && !this.props.moduleProgress.submitted ? (
                    <moduleDict.module
                      updateExperiment={this.props.updateExperiment ?? null}
                      submit={this.handleSubmit}
                      usersAnswers={usersAnswers}
                      currentModule={currentModule}
                      loading={this.props.loading}
                      questions={sortQuestions(currentModule.questions).map(
                        (q) => {
                          const qType = q.config.question_type;
                          return qType !== "custom" ? (
                            <Question
                              usersAnswers={usersAnswers}
                              questionId={q.id}
                              question={q.question}
                              options={q.options}
                              change={this.onChange}
                              type={questionTypes[qType]}
                              currentModule={currentModule}
                            />
                          ) : (
                            <CustomQuestion
                              submitted={this.props.moduleProgress.submitted}
                              usersAnswers={usersAnswers}
                              currentModule={currentModule}
                              questionId={q.id}
                              question={q.question}
                              options={q.options}
                              targets={q.target}
                              change={this.onChange}
                              types={q.config.type_mapping}
                              upload={this.handleFileUpload}
                              onUpload={({ id, option }) => {
                                const oldFiles =
                                  this.props.moduleProgress.files;
                                this.props.updateMDL("files", [
                                  ...oldFiles,
                                  { id, option },
                                ]);
                              }}
                              uploading={this.props.uploading}
                            />
                          );
                        }
                      )}
                    />
                  ) : (
                    <>
                      <Submitted
                        callback={this.props.endMDL}
                        message={"Go Back"}
                        path={
                          this.props.exp
                            ? `/experiments/${this.state.exp}/`
                            : "/"
                        }
                        delay={2000}
                        extra={
                          this.props.updateExperiment && this.props.callback ? (
                            <Button
                              style={{ marginBottom: "1rem" }}
                              color="blue"
                              onClick={() => {
                                this.props.callback();
                              }}
                            >
                              {"Next"}
                            </Button>
                          ) : null
                        }
                      />
                    </>
                  )}
                </Grid.Row>
              </Grid>
            )}
          </>
        ) : null}
      </Hoc>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    token: state.auth.token,
    currentExperiment: state.experiments.currentExperiment,
    currentModule: state.modules.currentModule,
    moduleProgress: state.moduleProgress,
    loading: state.modules.loading,
    username: state.auth.username,
    is_moderator: state.auth.is_moderator,
    uploading: state.s3.loading,
    completedExperiments: state.completedExperiments.experiments,
    incompleteExperiment: state.completedExperiments.incomplete,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getMDLSDetail: (token, id, callback) =>
      dispatch(getMDLSDetail(token, id, callback)),
    uploadFILE: (token, file, callback, option) =>
      dispatch(uploadFILE(token, file, callback, option)),
    createCompletedMDL: (token, mdl, callback) =>
      dispatch(createCompletedMDL(token, mdl, callback)),
    updateCurrentModule: (token, mdl, callback) =>
      dispatch(updateCurrentMDL(token, mdl, callback)),
    startMDL: (token, mdlId, expId, callback) =>
      dispatch(startMDL(token, mdlId, expId, callback)),
    updateMDL: (key, value) => dispatch(updateMDL(key, value)),
    updateMDLValues: (values) => dispatch(updateMDLs(values)),
    submitMDL: (token, mdl, callback) =>
      dispatch(submitMDL(token, mdl, callback)),
    endMDL: (token, mdl, callback) => dispatch(endMDL(token, mdl, callback)),
    getCompletedEXPS: (token, expId, callback) =>
      dispatch(getCompletedEXPS(token, expId, callback)),
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModuleDetail)
);
