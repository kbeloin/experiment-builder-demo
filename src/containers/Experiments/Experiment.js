import React from "react";
import { withRouter, Redirect } from "react-router-dom";
import { getCompletedEXPS } from "../../store/actions/completedExperiments";
import { getEXPSDetail } from "../../store/actions/experiments";
import { uploadFILE } from "../../store/actions/s3";
import Hoc from "../../hoc/hoc";
import { connect } from "react-redux";
import Submitted from "../../components/Submitted";
import { createRef } from "react";
import { toggleFullScreen, fullScreenEnabled } from "../../components/utility";
import { end as endMDL } from "../../store/actions/moduleProgress";
import { Container, Step } from "semantic-ui-react";
import ModuleDetail from "../Modules/ModuleDetail";

class Experiment extends React.Component {
  constructor(props) {
    super(props);
    this.containerRef = createRef();
  }

  state = {
    submitted: false,
    prompt: false,
    current: 0,
  };

  componentDidMount() {
    // check if experiment is in location

    if (!this.props.location.state?.userExperiment) {
      console.log("No user experiment");
      this.props.history.push("/");
    }

    if (this.props.location.state?.userExperiment) {
      if (!fullScreenEnabled() && this.containerRef.current) {
        toggleFullScreen(this.containerRef.current);
        // set the display of menu to none
        document.querySelector("#menu").style.display = "none";
        // set top margin of main content to 0
        document.querySelector("#main-content").style.marginTop = "0";
        // listen if the screen is not full and show the menu
        // and set the top margin of main content to original value
        document.addEventListener("fullscreenchange", () => {
          if (!fullScreenEnabled()) {
            document.querySelector("#menu").style.display = "flex";
            document.querySelector("#main-content").style.marginTop =
              "2.85714em";
          } else {
            document.querySelector("#menu").style.display = "none";
            document.querySelector("#main-content").style.marginTop = "0";
          }
        });
      }

      if (this.props.token !== undefined && this.props.token !== null) {
        this.props.getEXPDetail(
          this.props.token,
          this.props.location.state.userExperiment.experiment
        );
        this.props.getCompletedEXPS(
          this.props.token,
          this.props.location.state.userExperiment.experiment
        );
      }
    }
  }

  componentWillUnmount() {
    if (fullScreenEnabled() && this.containerRef.current) {
      toggleFullScreen(this.containerRef.current);
      // show
    }
  }

  componentWillReceiveProps(newProps) {
    if (newProps.token !== this.props.token) {
      if (newProps.token !== undefined && newProps.token !== null) {
        this.props.getEXPDetail(
          newProps.token,
          this.props.location.state.userExperiment.experiment
        );
        this.props.getCompletedEXPS(
          newProps.token,
          this.props.location.state.userExperiment.experiment
        );
      }
    }
    const prev = this.props.incompleteExperiment;
    const next = newProps.completedExperiments;
    // check if prev and next are arrays and if they are not empty
    if (
      Array.isArray(prev) &&
      Array.isArray(next) &&
      prev.length > 0 &&
      next.length > 0
    ) {
      // check if the last element of prev is not equal to the first element of next
      this.forceUpdate();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const currentModule = this.props.incompleteExperiment.length
      ? // Is there an incomplete module ?
        this.props.incompleteExperiment[0].current_module[1]
      : null;
    const prevModule = prevProps.location.state.mdl;
    if (!this.state.submitted) {
      if (currentModule === null) {
        this.setState({ submitted: true });
      }
      if (currentModule && prevModule !== currentModule) {
        this.props.history.replace(`/start`, {
          currentExperiment: this.props.currentExperiment,
          userExperiment: this.props.incompleteExperiment[0],
          mdl: currentModule,
        });
      }
    }
  }

  next = () => {
    const current = this.state.current + 1;
    this.setState({ current });
    this.props.endMDL();
  };

  prev() {
    const current = this.state.current - 1;
    this.setState({ current });
  }

  update = () => {
    console.log("update");
    this.props.getCompletedEXPS(
      this.props.token,
      this.props.location.state.userExperiment.experiment
    );
  };

  render() {
    const { incompleteExperiment } = this.props;
    const { currentExperiment } = this.props.location.state ?? this.props;
    // if experiment is undefined
    if (!this.props.location?.state?.userExperiment) {
      // redirect to home
      return <Redirect to="/" />;
    }

    const userExperiment =
      this.props.location.state?.userExperiment ?? incompleteExperiment[0];

    const currentModule = incompleteExperiment.length
      ? // Is there an incomplete module ?
        incompleteExperiment[0].current_module[1]
      : null;

    // on refresh, warn the user that the experiment will be restarted
    window.onbeforeunload = () => {
      if (this.state.submitted) {
        return;
      }
      return "Are you sure you want to leave this page?";
    };

    return (
      <Hoc>
        <Container
          as={"div"}
          id="experiment-container"
          fluid
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1em",
            flex: "0 1 100%",
            height: "100%",
          }}
        >
          <Step.Group ordered>
            {currentExperiment.modules.map((module, i) => (
              <Step
                completed={
                  i + 1 < userExperiment.current_module[0] ||
                  this.state.submitted
                }
                active={
                  i + 1 === userExperiment.current_module[0] &&
                  !this.state.submitted
                }
              >
                <Step.Content></Step.Content>
              </Step>
            ))}
          </Step.Group>{" "}
          {!this.state.submitted ? (
            <ModuleDetail
              updateExperiment={this.update}
              callback={this.next}
              key={this.state.current}
            />
          ) : (
            <Submitted
              callback={this.props.endMDL}
              message={"Complete Lesson"}
              path={`/experiments/${currentExperiment.id}/` ?? "/"}
              delay={1000}
            />
          )}
        </Container>
      </Hoc>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    token: state.auth.token,
    currentExperiment: state.experiments.currentExperiment,
    loading: state.experiments.loading,
    submittingModule: state.completedModules.loading,
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
    getCompletedEXPS: (token, expId, callback) =>
      dispatch(getCompletedEXPS(token, expId, callback)),
    endMDL: () => dispatch(endMDL()),
  };
};
export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Experiment)
);
