import React from "react";
import {
  Button,
  Form,
  Header,
  Segment,
  Message,
  Icon,
} from "semantic-ui-react";
import { connect } from "react-redux";
import { NavLink, Redirect } from "react-router-dom";
import { authLogin } from "../../store/actions/auth";

class LoginForm extends React.Component {
  state = {
    username: "",
    password: "",
  };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { username, password } = this.state;
    this.props.login(username, password);
  };

  render() {
    const { error, loading, token } = this.props;
    const { username, password } = this.state;
    if (token) {
      return <Redirect to="/" />;
    }
    return (
      <React.Fragment>
        {error && <p>{this.props.error.message}</p>}
        <Form onSubmit={this.handleSubmit}>
          <Segment className={"form-inner"}>
            <Header as="h2" textAlign="center">
              Log into your account
            </Header>
            <Form.Input
              required
              className="login"
              onChange={this.handleChange}
              value={username}
              name="username"
              fluid
              icon="user"
              iconPosition="left"
              placeholder="Username"
            />
            <Form.Input
              required
              className="login"
              onChange={this.handleChange}
              fluid
              value={password}
              name="password"
              icon="lock"
              iconPosition="left"
              placeholder="Password"
              type="password"
            />
            <Button
              fluid
              size="large"
              color="teal"
              loading={loading}
              disabled={loading}
              className="form-button login"
            >
              Login
            </Button>
            {/* Message reminding the user to not use Safari or mobile devices in a list*/}
            {/* <Message
              warning
              style={{
                placeSelf: "flex-start",
                marginRight: "auto",
                marginLeft: "auto",
                marginBottom: "1em",
                display: "block",
              }}
            >
              <Message.Header>Warning:</Message.Header>
              <Message.List>
                <Message.Item>
                  Please use a desktop or laptop computer.{" "}
                  <b>Mobile and Tablet devices will not work.</b>
                </Message.Item>
                <Message.Item>
                  Please use{" "}
                  <a
                    class="link"
                    href="https://support.google.com/chrome/answer/95346?hl=en&co=GENIE.Platform%3DDesktop"
                  >
                    Chrome
                  </a>
                  ,{" "}
                  <a class="link" href="https://www.mozilla.org/firefox/new/">
                    Firefox
                  </a>
                  , or{" "}
                  <a
                    class="link"
                    href="https://support.microsoft.com/microsoft-edge/download-the-new-microsoft-edge-based-on-chromium-0f4a3dd7-55df-60f5-739f-00010dba52cf"
                  >
                    Edge
                  </a>{" "}
                  browsers. <b>Safari will not work.</b>
                </Message.Item>
              </Message.List>
            </Message> */}
          </Segment>
        </Form>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    loading: state.auth.loading,
    error: state.auth.error,
    token: state.auth.token,
    userName: state.auth,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    login: (username, password) => dispatch(authLogin(username, password)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);
