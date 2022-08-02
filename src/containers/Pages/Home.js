import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import {
  Dimmer,
  Loader,
  Card,
  Icon,
  Header,
  CardContent,
  Message,
} from "semantic-ui-react";
import { authCheckState } from "../../store/actions/auth";
import Hoc from "../../hoc/hoc";
import { withRouter } from "react-router-dom";
class Home extends React.PureComponent {
  render() {
    return (
      <Hoc>
        {this.props.loading ? (
          <Dimmer active>
            <Loader>Loading Home...</Loader>
          </Dimmer>
        ) : (
          <div
            style={{ display: "grid", height: "100%", placeItems: "center" }}
          >
            <Card.Group
              style={{ width: "100%" }}
              itemsPerRow={4}
              textAlign="center"
              centered
            >
              <Card
                as={Link}
                to={"/experiments"}
                link
                centered
                style={{ width: "250px", height: "250px" }}
                content={
                  <CardContent
                    centered
                    style={{ margin: "3em" }}
                    textAlign="center"
                  >
                    <Header icon>
                      <Icon name="boxes" />
                      Lessons
                    </Header>
                  </CardContent>
                }
              />
              {this.props.is_moderator && (
                <>
                  <Card
                    as={Link}
                    to={"/modules"}
                    link
                    centered
                    style={{ width: "250px", height: "250px" }}
                    content={
                      <CardContent
                        centered
                        style={{ margin: "3em" }}
                        textAlign="center"
                      >
                        <Header icon>
                          <Icon name="book" />
                          Activities
                        </Header>
                      </CardContent>
                    }
                  />
                  <Card
                    as={Link}
                    to={"/users"}
                    link
                    style={{ width: "250px", height: "250px" }}
                    centered
                    content={
                      <CardContent
                        centered
                        style={{ margin: "3em" }}
                        textAlign="center"
                      >
                        <Header icon>
                          <Icon name="users" />
                          Users
                        </Header>
                      </CardContent>
                    }
                  />
                </>
              )}
            </Card.Group>
            <Message
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
            </Message>
          </div>
        )}
      </Hoc>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isAuthenticated: state.auth.token !== null,
    is_participant: state.auth.is_participant,
    is_moderator: state.auth.is_moderator,
    loading: state.auth.loading,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onTryAutoSignup: () => dispatch(authCheckState()),
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Home));
