import React from "react";
import { connect } from "react-redux";
import { Redirect, withRouter, Link } from "react-router-dom";
import {
  Tab,
  Form,
  Icon,
  Button,
  Card,
  Dimmer,
  Loader,
  Message,
  Header,
  Dropdown,
  Container,
  MenuItem,
  Grid,
} from "semantic-ui-react";

import { createEXP } from "../../store/actions/experiments";
import { getMDLS } from "../../store/actions/modules";
import { getUSERList } from "../../store/actions/users";

import Hoc from "../../hoc/hoc";

import RichTextBox from "../../components/RichTextBox";
import ConfirmComponent from "../../components/Confirm";
import UserTable from "../../components/Tables/Participants";

import ConfigTable from "../../components/Tables/Config";
import { config as EXPconfig } from "./config";

class ExperimentCreate extends React.Component {
  state = {
    modules: [],
    participants: [],
    title: "",
    instructions: "",
    submitted: false,
    response: {},
    config: Object.fromEntries(
      new Map(EXPconfig.map(({ name, options }, i) => [name, options[0]]))
    ),
  };

  dropdownOptions = (options) => {
    const d = options.map((module, index) => ({
      key: `module-${module.id}-order-${index}`,
      text: `${module.title} (id: ${module.id})`,
      value: module.id,
    }));
    return d;
  };

  componentDidMount() {
    if (this.props.token !== undefined && this.props.token !== null) {
      if (this.props.modules.length === 0 || this.props.modules === undefined) {
        this.props.getMDLS(this.props.token);
      }
      if (this.props.users.length === 0) {
        this.props.getUSERList(this.props.token);
      }
    }
  }

  componentWillReceiveProps(newProps) {
    if (newProps.token !== this.props.token) {
      if (newProps.token !== undefined && newProps.token !== null) {
        this.props.getMDLS(newProps.token);
        this.props.getUSERList(newProps.token);
      }
    }
  }

  remove = (i, key) => {
    const keys = this.state[key];
    const newKeys = keys;
    newKeys.splice(i, 1);

    this.setState({ ...this.state, [key]: newKeys });
  };

  add = (key, value) => {
    const keys = this.state[key];

    const newKeys = keys.concat(value ?? {});

    this.setState({ ...this.state, [key]: newKeys });
  };

  handleChange = (value, key) => {
    this.setState({ ...this.state, [key]: value });
  };

  handleSubmissionResponse = (e) => {
    if (e instanceof Error) {
      this.setState({ ...this.state, submitted: true, response: e });
    } else {
      this.setState({ ...this.state, submitted: true, response: e });
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { title, modules, instructions, participants, config } = this.state;

    const exp = {
      username: this.props.username,
      title: title,
      instructions: JSON.stringify(instructions),
      modules: modules.map(({ id }, i) => id),
      participants: participants.map(({ id }, i) => id),
      config,
    };

    this.props.createEXP(this.props.token, exp, this.handleSubmissionResponse);
  };

  render() {
    const { modules, title, instructions } = this.state;
    const { token } = this.props;
    const modulesNum = modules.length;
    if (token === null) {
      return <Redirect to="/login" />;
    }

    const moduleCards = modules.map((module, i) => (
      <Hoc key={i}>
        <Card
          style={{
            width: "250px",
            height: "250px",
          }}
        >
          {modulesNum > 0 ? (
            <Container
              style={{
                margin: "unset",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.5rem",
              }}
            >
              <Header style={{ marginBottom: "unset" }}>{`${i + 1}`}</Header>
              <Icon
                style={{ margin: "unset" }}
                link
                floated="right"
                name="cancel"
                onClick={(e) => {
                  e.preventDefault();
                  this.remove(i, "modules");
                }}
              />
            </Container>
          ) : null}
          <React.Fragment>
            <Card.Content>
              <Card.Header textAlign="center">
                {module.title ?? "Select a module"}
              </Card.Header>
              <Card.Meta textAlign="center">
                {module.questions
                  ? `${module.questions.length} Questions`
                  : null}
              </Card.Meta>
            </Card.Content>
            <Card.Content extra>
              <Dropdown
                selection
                name="modules"
                placeholder="No Module Selected"
                value={module.id ?? "No Module Selected"}
                options={this.dropdownOptions(this.props.modules)}
                onChange={(e, { value }) => {
                  const newMdl = this.props.modules.filter(
                    (m) => m.id === value
                  )[0];
                  const newMdls = modules;
                  newMdls.splice(i, 1, newMdl);
                  this.handleChange(newMdls, "modules");
                }}
              />
            </Card.Content>
          </React.Fragment>
        </Card>
      </Hoc>
    ));

    const experimentPane = {
      menuItem: "General",
      render: () => (
        <Tab.Pane>
          {
            <React.Fragment>
              <Form.Field required>
                <label>Experiment Title</label>
                <h2 style={{ marginTop: "0" }}>
                  <Form.Input
                    required
                    placeholder="Add a title"
                    onChange={(e) =>
                      this.handleChange(e.target.value, e.target.name)
                    }
                    fluid
                    value={title}
                    name="title"
                  />
                </h2>
              </Form.Field>
              <Form.Field required style={{ display: "block" }}>
                <label>Instructions</label>
                <RichTextBox
                  title={instructions}
                  uniqueId={"instructions"}
                  handleChange={(e) => this.handleChange(e, "instructions")}
                />
              </Form.Field>
            </React.Fragment>
          }
        </Tab.Pane>
      ),
    };

    const modulePane = {
      menuItem: this.props.loadingMDL ? (
        <MenuItem>
          <Loader active inline size="tiny" />
          {" Modules"}
        </MenuItem>
      ) : (
        `${modulesNum} Modules`
      ),
      render: () => (
        <Tab.Pane>
          <div
            style={{ display: "grid", height: "100%", placeItems: "center" }}
          >
            <Card.Group
              style={{ width: "100%" }}
              itemsPerRow={4}
              textAlign="center"
            >
              <Card
                link
                style={{
                  width: "250px",
                  height: "250px",
                  display: "grid",
                  placeContent: "center",
                }}
                centered
                onClick={
                  !this.props.loadingMDL ? () => this.add("modules") : null
                }
              >
                {this.props.loadingMDL ? (
                  <Card.Content centered textAlign="center">
                    <Dimmer active>
                      <Loader>Fetching Modules...</Loader>
                    </Dimmer>
                  </Card.Content>
                ) : (
                  <React.Fragment>
                    <Card.Content centered textAlign="center">
                      <Card.Header>{`Add a Module`}</Card.Header>
                      <Card.Description>
                        <Icon name="add circle" size="big" />
                      </Card.Description>
                    </Card.Content>
                  </React.Fragment>
                )}
              </Card>

              {modulesNum > 0 ? moduleCards : null}
            </Card.Group>
          </div>
        </Tab.Pane>
      ),
    };

    const participantPane = {
      menuItem: this.props.loadingUSER ? (
        <MenuItem>
          <Loader active inline size="tiny" />
          {" Participant"}
        </MenuItem>
      ) : (
        `${this.state.participants.length} Participants`
      ),
      render: () => (
        <Tab.Pane>
          {this.props.loadingUSER ? (
            <Container centered textAlign="center">
              <Dimmer active>
                <Loader>Fetching Participants...</Loader>
              </Dimmer>
            </Container>
          ) : (
            <Grid stackable divided="vertically" style={{ marginTop: "0" }}>
              <Grid.Row columns={2}>
                <Grid.Column>
                  <UserTable
                    users={this.state.participants}
                    label="Remove"
                    btnColor="red"
                    callback={(users) => {
                      this.handleChange(
                        [
                          ...this.state.participants.filter(
                            ({ id }, i) => !users.map((e) => e.id).includes(id)
                          ),
                        ],
                        "participants"
                      );
                    }}
                  />
                </Grid.Column>
                <Grid.Column>
                  <UserTable
                    users={this.props.users.filter(
                      ({ id }, i) =>
                        !this.state.participants.map((e) => e.id).includes(id)
                    )}
                    label="Add"
                    btnColor="blue"
                    callback={(users) => {
                      this.handleChange(
                        [...this.state.participants, ...users],
                        "participants"
                      );
                    }}
                  />
                </Grid.Column>
              </Grid.Row>
            </Grid>
          )}
        </Tab.Pane>
      ),
    };
    const configPane = {
      menuItem: this.props.loadingEXP ? (
        <MenuItem>
          <Loader active inline size="tiny" />
          {" Config"}
        </MenuItem>
      ) : (
        "Config"
      ),
      render: () => (
        <Tab.Pane>
          <ConfigTable
            config={EXPconfig}
            callback={(key, value) => {
              const newConfig = {
                ...this.state.config,
                [key]: value,
              };
              this.handleChange(newConfig, "config");
            }}
            initial={this.state.config}
          />
        </Tab.Pane>
      ),
    };

    return (
      <Hoc>
        <Form
          style={{ display: "flex", flexDirection: "column" }}
          onSubmit={this.handleSubmit}
        >
          <Form.Field as={"div"}>
            <Header floated="left">Experiment Creation</Header>
            <Button type="primary" htmlType="submit" floated="right">
              Submit
            </Button>
          </Form.Field>
          {this.state.submitted ? (
            <ConfirmComponent
              open={this.state.submitted}
              onCancel={() =>
                this.setState({ ...this.state, submitted: false })
              }
              header={
                this.state.response instanceof Error ? (
                  <Message error>{"Error..."}</Message>
                ) : (
                  <Message success>{`Success!`}</Message>
                )
              }
              content={
                this.state.response instanceof Error ? (
                  <Message>
                    {`Module creation failed with error: ${JSON.stringify(
                      this.state.response.message
                    )}`}
                  </Message>
                ) : (
                  <Message>
                    {`${JSON.stringify(this.state.response.data)} Created`}
                  </Message>
                )
              }
              cancelButton={
                this.state.response instanceof Error ? (
                  <Button red>Go Back</Button>
                ) : (
                  "Create Another"
                )
              }
              confirmButton={
                this.state.response instanceof Error ? null : (
                  <Link to="/experiments">
                    <Button teal>Go to experiments</Button>
                  </Link>
                )
              }
            />
          ) : null}
          <Tab
            panes={[experimentPane, modulePane, participantPane, configPane]}
          />
        </Form>
      </Hoc>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    token: state.auth.token,
    username: state.auth.username,
    modules: state.modules.modules,
    users: state.users.users,
    loadingEXP: state.experiments.loading,
    loadingMDL: state.modules.loading,
    loadingUSER: state.users.loading,
    error: state.experiments.error,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    createEXP: (token, exp, callback) =>
      dispatch(createEXP(token, exp, callback)),
    getMDLS: (token) => dispatch(getMDLS(token)),
    getUSERList: (token) => dispatch(getUSERList(token)),
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ExperimentCreate)
);
