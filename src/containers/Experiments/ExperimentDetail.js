import React from "react";
import { Redirect, withRouter, Link } from "react-router-dom";
import { connect } from "react-redux";
import { Dimmer, Loader, Header, Card, Button } from "semantic-ui-react";
import { bottomRight as buttonStyle } from "../Style/buttonStyle";

import {
  createCompletedEXP,
  getCompletedEXPS,
} from "../../store/actions/completedExperiments";
import { getEXPSDetail } from "../../store/actions/experiments";
import { uploadFILE } from "../../store/actions/s3";
import Hoc from "../../hoc/hoc";

class ExperimentDetail extends React.Component {
  state = {
    usersAnswers: {},
    files: [],
  };

  componentDidMount() {
    if (this.props.token !== undefined && this.props.token !== null) {
      this.props.getEXPDetail(this.props.token, this.props.match.params.id);
      this.props.getCompletedEXPS(this.props.token, this.props.match.params.id);
    }
  }

  componentWillReceiveProps(newProps) {
    if (newProps.token !== this.props.token) {
      if (newProps.token !== undefined && newProps.token !== null) {
        this.props.getEXPDetail(newProps.token, this.props.match.params.id);
        this.props.getCompletedEXPS(newProps.token, this.props.match.params.id);
      }
    }
  }

  onChange = (e, qId) => {
    const { usersAnswers } = this.state;
    usersAnswers[qId] = e;

    this.setState({ ...this.state, usersAnswers });
  };

  handleFileUpload = (data, callback, option) => {
    this.props.uploadFILE(this.props.token, data, callback, option);
  };

  handleCreate = (e, { expId }) => {
    e.preventDefault();
    this.props.createCompletedEXP(this.props.token, { expId: expId }, (res) =>
      this.props.getCompletedEXPS(this.props.token, this.props.match.params.id)
    );
  };

  render() {
    const {
      currentExperiment,
      completedExperiments,
      token,
      incompleteExperiment,
    } = this.props;
    const { title, instructions } = currentExperiment;
    const currentModule = incompleteExperiment.length
      ? // Is there an incomplete module ?
        incompleteExperiment[0].current_module[1] ??
        currentExperiment.modules[0]
      : null;
    const nextButton = (
      <Button
        color="blue"
        style={buttonStyle}
        floated="right"
        as={Link}
        to={{
          pathname: `/start`,
          state: {
            currentExperiment: currentExperiment,
            userExperiment: incompleteExperiment[0],
            mdl: currentModule,
          },
        }}
      >
        {"Next"}
      </Button>
    );

    if (token === null) {
      return <Redirect to="/login" />;
    }
    return (
      <Hoc>
        {Object.keys(currentExperiment).length > 0 ? (
          <Hoc>
            {this.props.loading ? (
              <Dimmer active>
                <Loader>Preparing Experiment {title}...</Loader>
              </Dimmer>
            ) : (
              <React.Fragment>
                <Card.Content
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  <Header> {title} </Header>

                  {this.props.incompleteExperiment.length ? (
                    <>
                      {nextButton}
                      <h3>Instructions: </h3>
                      <div dangerouslySetInnerHTML={{ __html: instructions }} />
                    </>
                  ) : currentExperiment.config.num_attempts ===
                    completedExperiments.length ? (
                    <Button style={buttonStyle} floated="right" disabled>
                      {"Max Attempts Reached"}
                    </Button>
                  ) : (
                    <Button
                      style={buttonStyle}
                      floated="right"
                      onClick={(e) =>
                        this.handleCreate(e, { expId: currentExperiment.id })
                      }
                    >
                      {"Begin Lesson"}
                    </Button>
                  )}
                </Card.Content>
              </React.Fragment>
            )}
          </Hoc>
        ) : null}
      </Hoc>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    token: state.auth.token,
    currentExperiment: state.experiments.currentExperiment,
    loading: state.experiments.loading,
    completedExperiments: state.completedExperiments.experiments,
    incompleteExperiment: state.completedExperiments.incomplete,
    username: state.auth.username,
    uploading: state.s3.loading,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getEXPDetail: (token, id) => dispatch(getEXPSDetail(token, id)),
    uploadFILE: (token, file, callback, option) =>
      dispatch(uploadFILE(token, file, callback, option)),
    createCompletedEXP: (token, exp, callback) =>
      dispatch(createCompletedEXP(token, exp, callback)),
    getCompletedEXPS: (token, expId) =>
      dispatch(getCompletedEXPS(token, expId)),
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ExperimentDetail)
);
