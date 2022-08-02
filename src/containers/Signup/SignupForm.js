import React from "react";
import { Button, Form, Header, Segment, Dropdown } from "semantic-ui-react";
import { connect } from "react-redux";
import { NavLink } from "react-router-dom";
import { authSignup } from "../../store/actions/auth";
const options = [
  { key: "participant", value: "participant", text: "Participant" },
  { key: "moderator", value: "moderator", text: "Moderator" },
];

class RegistrationForm extends React.Component {
  state = {
    username: "",
    email: "",
    password1: "",
    password2: "",
    userType: "participant",
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { username, email, password1, password2, userType } = this.state;
    this.props.signup(
      username,
      email,
      password1,
      password2,
      userType,
      this.handleCallback
    );
  };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleCallback = (e) => {
    if (e instanceof Error) {
      console.log(e);
    } else {
      const user = this.state;
      this.setState({
        username: "",
        email: "",
        password1: "",
        password2: "",
        userType: "participant",
      });
      this.props.callback({ response: e, user });
    }
  };

  render() {
    const { username, email, password1, password2, userType } = this.state;
    const { error, loading, token } = this.props;

    return (
      <React.Fragment>
        {error && <p>{this.props.error.message}</p>}

        <Segment
          basic
          as={Form}
          onSubmit={this.handleSubmit}
          className={"form-inner"}
        >
          <Header as="h2" textAlign="center">
            Add a new user
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
            value={email}
            name="email"
            fluid
            icon="mail"
            iconPosition="left"
            placeholder="E-mail address"
          />
          <Form.Input
            required
            className="login"
            onChange={this.handleChange}
            fluid
            value={password1}
            name="password1"
            icon="lock"
            iconPosition="left"
            placeholder="Password"
            type="password"
            autocomplete="new-password"
          />

          <Form.Input
            required
            onChange={this.handleChange}
            fluid
            value={password2}
            name="password2"
            icon="lock"
            iconPosition="left"
            placeholder="Confirm password"
            type="password"
            autocomplete="new-password"
          />

          <Dropdown
            as={Form.Field}
            fluid
            selection
            options={options}
            onChange={(e, { value }) =>
              this.setState({ ...this.state, userType: value })
            }
            placeholder="Select"
            value={this.state.userType}
            name={"userType"}
          />

          <Button
            class="form-button"
            color="teal"
            fluid
            size="large"
            loading={loading}
            disabled={loading}
            className="form-button"
          >
            Add User
          </Button>
        </Segment>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    loading: state.auth.loading,
    error: state.auth.error,
    token: state.auth.token,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    signup: (username, email, password1, password2, userType, callback) =>
      dispatch(
        authSignup(username, email, password1, password2, userType, callback)
      ),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(RegistrationForm);
