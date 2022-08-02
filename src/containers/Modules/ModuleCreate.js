import React from "react";
import { connect } from "react-redux";
import { Redirect, withRouter } from "react-router-dom";
import {
  Tab,
  Form,
  Icon,
  Button,
  MenuItem,
  Loader,
  Message,
  Segment,
  Header,
} from "semantic-ui-react";

import Hoc from "../../hoc/hoc";
import { createMDL } from "../../store/actions/modules";

import { uploadFILE } from "../../store/actions/s3";
import { Link } from "react-router-dom";

import CopyContextIcon from "../../components/Popup/Copy";
import ConfirmComponent from "../../components/Confirm";
import questionTypes from "../Questions/questionTypes";
import RichTextBox from "../../components/RichTextBox";
import { getValues } from "../../components/utility";
import ConfigTable from "../../components/Tables/Config";
import { config as MDLconfig } from "./config";
import PromptToLeave from "../../components/Popup/BlockingPrompt";

const dropdownOptions = Object.entries(questionTypes)
  .map(([key, value], index) => ({ key: key, text: value.name, value: key }))
  .filter(
    (value) => value.text !== "Custom Question" && value.text !== "Blank"
  );

class ModuleCreate extends React.Component {
  state = {
    qId: 0,
    questions: {},
    title: "",
    instructions: "",
    files: [],
    embeds: [],
    submitted: false,
    response: {},
    config: Object.fromEntries(
      new Map(MDLconfig.map(({ name, options }, i) => [name, options[0]]))
    ),
  };

  remove = (k) => {
    const { questions } = this.state;

    const keys = Object.entries(questions).filter(
      ([key, value], index) => key != k
    );
    const newKeys = Object.fromEntries(keys);

    this.setState({ ...this.state, questions: newKeys });
  };

  copy = (question, num) => {
    const { qId, questions } = this.state;
    const options = { ...question?.options } ?? {};

    // copy question for number of times specified
    let newQid = qId;
    let newQuestions = { ...questions };

    for (let i = 0; i < num; i++) {
      newQuestions = {
        ...newQuestions,
        [newQid]: {
          ...question,
          options: options,
        },
      };
      newQid++;
    }

    this.setState({ ...this.state, questions: newQuestions, qId: newQid });
  };

  add = (question_type) => {
    const { qId, questions } = this.state;
    const nextQuestions = {
      ...questions,
      [qId]: {
        type: questionTypes[question_type].create,
        config: { question_type: question_type },
        target: questionTypes[question_type].target_type,
        title: "",
        files: [],
        embeds: [],
        options: {},
      },
    };
    this.setState({
      ...this.state,
      qId: qId + 1,
      questions: nextQuestions,
    });
  };

  handleChange = (e) => {
    e.preventDefault();
    this.setState({ ...this.state, [e.target.name]: e.target.value });
  };

  handleQuestionChange = (question, id) => {
    const { questions } = this.state;
    this.setState({
      ...this.state,
      questions: { ...questions, [id]: { ...questions[id], ...question } },
    });
  };

  handleFileUpload = (file, callback, options) => {
    this.props.uploadFILE(this.props.token, file, callback, options);
  };

  handleInstructionsChange = (text) => {
    this.setState({
      ...this.state,
      instructions: text,
    });
  };

  handleSubmissionResponse = (e) => {
    if (e instanceof Error) {
      this.setState({ ...this.state, submitted: true, response: e });
    } else {
      this.setState({
        qId: 0,
        questions: {},
        title: "",
        instructions: "",
        files: [],
        embeds: [],
        submitted: true,
        response: e,
      });
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { instructions, title, questions } = this.state;
    let questionValues;
    try {
      questionValues = getValues(questions, "Module must have questions.").map(
        (value, i) => ({
          ...value,
        })
      );
    } catch (err) {
      this.handleSubmissionResponse(err);
    }

    const mdl = {
      moderator: this.props.username,
      title: title,
      instructions: JSON.stringify(instructions),
      questions: questionValues,
      files: this.state.files,
      embeds: this.state.embeds,
      config: this.state.config,
    };
    this.props.createMDL(this.props.token, mdl, this.handleSubmissionResponse);
  };

  render() {
    const { questions, title } = this.state;
    const { token } = this.props;
    const questionsNum = Object.keys(questions).length;
    if (token === null) {
      return <Redirect to="/login" />;
    }

    const questionForms = Object.entries(questions).map(([key, value], i) => (
      <Hoc key={key}>
        <Form.Field as={"div"} style={{ display: "flex" }}>
          <h3>{`Item ${i + 1}`}</h3>
          <CopyContextIcon onClick={(num) => this.copy(value, num)} />
          {questionsNum > 0 ? (
            <Button
              link
              type="button"
              icon="cancel"
              disabled={questionsNum === 0}
              onClick={() => this.remove(key)}
            />
          ) : null}
        </Form.Field>
        <value.type
          id={key}
          {...this.props}
          question={value}
          handleQuestionChange={this.handleQuestionChange}
          handleFileUpload={this.handleFileUpload}
          dropdownOptions={dropdownOptions}
          questionTypes={questionTypes}
        />
      </Hoc>
    ));

    const questionPanes = questionForms.map((q, index) => ({
      menuItem: `${index + 1}`,
      render: () => <Tab.Pane> {q} </Tab.Pane>,
    }));

    const modulePane = {
      menuItem: "General",
      render: () => (
        <Tab.Pane>
          {
            <React.Fragment>
              <Form.Field required>
                <label>Module Title</label>
                <h2 style={{ marginTop: "0" }}>
                  <Form.Input
                    required
                    placeholder="Add a title"
                    onChange={this.handleChange}
                    fluid
                    value={title}
                    name="title"
                  />
                </h2>
              </Form.Field>

              <Form.Field required style={{ display: "block" }}>
                <label>Instructions</label>
                <RichTextBox
                  title={this.state.instructions}
                  uniqueId={"instructions"}
                  handleChange={this.handleInstructionsChange}
                  handleFileUpload={(file, callback, options) =>
                    this.handleFileUpload(file, callback, options)
                  }
                  handleFileChange={(e) => {
                    this.setState({
                      ...this.state,
                      files: this.state.files.concat([e]),
                    });
                  }}
                  handleEmbed={({ embed, instructions }) => {
                    // list of embed ids to be added to the module
                    this.setState({
                      ...this.state,
                      embeds: this.state.embeds.concat(embed),
                      instructions: instructions,
                    });
                  }}
                />
              </Form.Field>
            </React.Fragment>
          }
        </Tab.Pane>
      ),
    };
    const configPane = {
      menuItem: this.props.loading ? (
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
            config={MDLconfig}
            callback={(key, value) => {
              const newConfig = {
                ...this.state.config,
                [key]: value,
              };
              this.setState({ ...this.state, config: newConfig });
            }}
            initial={this.state.config}
          />
        </Tab.Pane>
      ),
    };

    const questionPane = {
      menuItem: `${questionsNum} Questions`,
      render: () =>
        questionsNum > 0 ? (
          <Tab.Pane>
            <Tab
              menu={{
                fluid: true,
                vertical: true,
                className: "wrapped question-tab",
                style: { display: "grid", flexDirection: "row" },
              }}
              panes={questionPanes}
            />
          </Tab.Pane>
        ) : null,
    };

    return (
      <Hoc>
        {!this.state.submitted && (
          <PromptToLeave
            blocking={!this.state.submitted}
            message={"New activity will not be saved."}
          />
        )}
        <Form
          style={{ display: "flex", flexDirection: "column" }}
          onSubmit={this.handleSubmit}
        >
          {this.props.uploading ? <Loader active /> : null}

          {this.state.submitted ? (
            <ConfirmComponent
              open={this.state.submitted}
              onCancel={() =>
                this.setState({ ...this.state, submitted: false })
              }
              header={
                this.state.response instanceof Error ? (
                  <Message error>{"Error!"}</Message>
                ) : (
                  <Message success>{`Success!`}</Message>
                )
              }
              content={
                this.state.response instanceof Error ? (
                  <Segment>
                    {`Activity creation failed with error: ${JSON.stringify(
                      this.state.response.message
                    )}`}
                  </Segment>
                ) : (
                  <Segment>
                    {`${JSON.stringify(this.state.response.data)} Created`}
                  </Segment>
                )
              }
              cancelButton={
                this.state.response instanceof Error ? (
                  <Button>Go Back</Button>
                ) : (
                  "Create Another"
                )
              }
              confirmButton={
                this.state.response instanceof Error ? null : (
                  <Link to="/modules">
                    <Button color="blue">Go to activities</Button>
                  </Link>
                )
              }
            />
          ) : null}
          <Form.Field as={"div"}>
            <Header floated="left">Module Creation</Header>
            <Button floated="right" type="primary" htmlType="submit">
              Submit
            </Button>
            <Button
              floated="right"
              type="secondary"
              icon="info"
              onClick={(e) => {
                e.preventDefault();
                this.add("blank");
              }}
            >
              Add Instruction Page
            </Button>
            <Button
              floated="right"
              type="secondary"
              onClick={(e) => {
                e.preventDefault();
                this.add("custom");
              }}
            >
              Add Question
            </Button>
          </Form.Field>
          <Tab panes={[modulePane, questionPane, configPane]} />
        </Form>
      </Hoc>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    token: state.auth.token,
    username: state.auth.username,
    loading: state.modules.loading,
    error: state.modules.error,
    files: state.s3.files,
    uploading: state.s3.loading,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    createMDL: (token, mdl, callback) =>
      dispatch(createMDL(token, mdl, callback)),
    uploadFILE: (token, file, callback, options) =>
      dispatch(uploadFILE(token, file, callback, options)),
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ModuleCreate)
);
