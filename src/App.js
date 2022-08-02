import React, { Component } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { connect } from "react-redux";
import BaseRouter from "./routes";
import * as actions from "./store/actions/auth";
import "./index.css";
import "./App.css";
import axios from "axios";
import "semantic-ui-css/semantic.min.css";
import "quill/dist/quill.snow.css";

import CustomLayout from "./containers/Layout/CustomLayout";

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

class App extends Component {
  componentDidMount() {
    this.props.onTryAutoSignup();
  }

  appRef = React.createRef();

  render() {
    return (
      <Router>
        <CustomLayout {...this.props} layoutRef={this.appRef}>
          <BaseRouter
            layoutRef={this.appRef}
            auth={this.props.isAuthenticated}
            is_moderator={this.props.is_moderator}
          />
        </CustomLayout>
      </Router>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isAuthenticated: state.auth.token !== null,
    is_moderator: state.auth.is_moderator,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onTryAutoSignup: () => dispatch(actions.authCheckState()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
