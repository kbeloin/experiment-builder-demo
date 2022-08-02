import React from "react";
import { Menu, Icon, Sidebar, Segment } from "semantic-ui-react";
import { Link, withRouter, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { logout } from "../../store/actions/auth";
import CustomSidebar from "../../components/Sidebar";
import LoginModal from "../Login/LoginModal";

class CustomLayout extends React.Component {
  state = {
    visible: false,
  };

  setVisible = (e) => {
    this.setState({ ...this.state, visible: e });
  };

  render() {
    const { authenticated, token } = this.props;

    if (authenticated === null) {
      return <Redirect to="/login" />;
    }

    return (
      <div class={"h-100"}>
        <LoginModal token={token} />
        {authenticated && (
          <Menu
            id="menu"
            fixed="top"
            inverted
            style={{
              height: "2.85714286em",
              background: "var(--primary-bg-color-dark)",
              flexDirection: "row-reversed",
            }}
          >
            {authenticated ? (
              <React.Fragment>
                <Menu.Item
                  header
                  onClick={() => this.setVisible(!this.state.visible)}
                >
                  <Icon name={this.state.visible ? "cancel" : "content"} />
                </Menu.Item>
                <Menu.Item as={Link} to={"/"} header>
                  Home
                </Menu.Item>

                <Menu.Item header style={{ marginLeft: "auto" }}>
                  Hello, {this.props.username}
                </Menu.Item>
                <Menu.Item header onClick={this.props.logout}>
                  Logout
                </Menu.Item>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Link to="/login">
                  <Menu.Item header link>
                    Login
                  </Menu.Item>
                </Link>
              </React.Fragment>
            )}
          </Menu>
        )}
        <Sidebar.Pushable style={{ overflowX: "unset" }}>
          <CustomSidebar
            {...this.props}
            visible={this.state.visible}
            setVisible={this.setVisible}
          />
          <Sidebar.Pusher>
            <Segment
              id="main-content"
              style={{
                marginTop: "2.85714em",
                height: "calc(100vh - 2.85714286em)",
                overflow: "auto",
              }}
            >
              {this.props.children}
            </Segment>
          </Sidebar.Pusher>
        </Sidebar.Pushable>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    authenticated: state.auth.token !== null,
    token: state.auth.token,
    username: state.auth.username,
    userId: state.auth.userId,
    is_moderator: state.auth.is_moderator,
    moduleProgress: state.moduleProgress,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    logout: () => dispatch(logout()),
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(CustomLayout)
);
