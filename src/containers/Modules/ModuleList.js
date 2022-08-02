import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Table, Dimmer, Loader, Button } from "semantic-ui-react";
import * as actions from "../../store/actions/modules";
import Hoc from "../../hoc/hoc";
import { topRight as buttonStyle } from "../Style/buttonStyle";

const renderBodyRow = ({ title, id }, i) => ({
  key: id || `row-${i}`,
  cells: [
    id,
    {
      content: (
        <Link to={{ pathname: `/modules/${id}`, state: { mdl: id } }}>
          {title}
        </Link>
      ),
      selectable: true,
    },
  ],
});

class ModuleList extends React.PureComponent {
  componentDidMount() {
    if (this.props.token !== undefined && this.props.token !== null) {
      this.props.getMDLS(this.props.token);
    }
  }

  componentWillReceiveProps(newProps) {
    if (newProps.token !== this.props.token) {
      if (newProps.token !== undefined && newProps.token !== null) {
        this.props.getMDLS(newProps.token);
      }
    }
  }

  render() {
    return (
      <Hoc>
        {this.props.is_mod && (
          <Button
            floated="right"
            as={Link}
            to={`/create/module`}
            style={buttonStyle}
            link
          >
            Create Activity
          </Button>
        )}
        {this.props.loading ? (
          <Dimmer active>
            <Loader>Loading Activities...</Loader>
          </Dimmer>
        ) : (
          <React.Fragment>
            <h3 style={{ margin: "16px 0" }}>Available Activities</h3>
            <Table
              tableData={this.props.modules}
              renderBodyRow={renderBodyRow}
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
    modules: state.modules.modules,
    loading: state.modules.loading,
    is_mod: state.auth.is_moderator,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getMDLS: (token) => dispatch(actions.getMDLS(token)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ModuleList);
