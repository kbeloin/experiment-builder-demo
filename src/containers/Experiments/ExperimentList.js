import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Table, Dimmer, List, Loader, Button, Icon } from "semantic-ui-react";
import * as actions from "../../store/actions/experiments";
import { topRight as buttonStyle } from "../Style/buttonStyle";
import Hoc from "../../hoc/hoc";
import { sortObjectArray } from "../../components/utility";
import { toCSV } from "../../components/utility";
import axios from "axios";

class ExperimentList extends React.PureComponent {
  downloadExperimentResponses = (e, experimentId) => {
    console.log(experimentId);
    const url = `/experiments/${experimentId}/responses/`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Token ${this.props.token}`,
    };
    axios
      .get(url, { headers })
      .then((response) => {
        const data = response.data;
        const csv = toCSV(data, `experiment-responses-${experimentId}`);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  renderBodyRow = ({ title, id, valid_date }, i) => {
    const currentDate = new Date();
    // date of the item
    const itemDate = valid_date ? new Date(valid_date) : null;
    // if the item is expired
    // if the item is valid or null
    const isValid = itemDate ? currentDate > itemDate : true;
    const download = this.downloadExperimentResponses.bind(this, id);

    return (
      isValid && {
        key: `row-${i}-id` || `row-${i}`,
        cells: [
          i + 1,
          {
            content: <Link to={`/experiments/${id}`}>{title}</Link>,
            selectable: true,
          },
          {
            content: this.props.is_mod && (
              <Icon link onClick={() => download(id)} name="download"></Icon>
            ),
          },
        ],
      }
    );
  };
  componentDidMount() {
    if (this.props.token !== undefined && this.props.token !== null) {
      this.props.getEXPS(this.props.token);
    }
  }

  componentWillReceiveProps(newProps) {
    if (newProps.token !== this.props.token) {
      if (newProps.token !== undefined && newProps.token !== null) {
        this.props.getEXPS(newProps.token);
      }
    }
  }

  renderItem(item) {
    // current date
    const currentDate = new Date();
    // date of the item
    const itemDate = item.date ? new Date(item.date) : null;
    // if the item is expired
    // if the item is valid or null
    const isValid = itemDate ? itemDate > currentDate : true;

    return (
      <>
        {isValid && (
          <Link to={`/modules/${item.id}`}>
            <List.Item>{item.title}</List.Item>
          </Link>
        )}
      </>
    );
  }

  render() {
    return (
      <Hoc>
        {this.props.is_mod && (
          <Button
            as={Link}
            to={`/create/experiment`}
            style={buttonStyle}
            link
            floated="right"
          >
            Create Lesson
          </Button>
        )}
        {this.props.loading ? (
          <Dimmer active>
            <Loader>Loading Experiments...</Loader>
          </Dimmer>
        ) : (
          <React.Fragment>
            <h3 style={{ margin: "16px 0" }}>Available Lessons</h3>
            <Table
              tableData={sortObjectArray(this.props.experiments, "order")}
              renderBodyRow={this.renderBodyRow}
            />
          </React.Fragment>
        )}
      </Hoc>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    token: state.auth.token,
    is_mod: state.auth.is_moderator,
    experiments: state.experiments.experiments,
    loading: state.experiments.loading,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getEXPS: (token) => dispatch(actions.getEXPS(token)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ExperimentList);
