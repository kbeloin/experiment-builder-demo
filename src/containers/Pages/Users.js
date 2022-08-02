import React from "react";
import { connect } from "react-redux";
import { getUSERList } from "../../store/actions/users";
import UserTable from "../../components/Tables/Participants";
import AddParticipant from "../../components/Tables/AddParticipants";
import { Dimmer, Button, Dropdown } from "semantic-ui-react";

import Hoc from "../../hoc/hoc";

const options = [
  {
    key: "Edit",
    icon: "edit",
    text: "Edit User(s)",

    value: {
      color: "teal",
      name: "Edit",
      function: () => console.log("edited"),
    },
  },
  {
    key: "Remove",

    icon: "delete",
    text: "Delete User(s)",
    value: {
      color: "red",
      name: "Delete",
      function: (e) => console.log("deleted", e),
    },
  },
  {
    key: "Export",

    icon: "download",
    text: "Export Data",
    value: {
      color: "blue",
      name: "Export",
      function: (e) => console.log("exported", e),
    },
  },
];

class Users extends React.PureComponent {
  state = {
    selection: {
      color: "blue",
      name: "Export",
      function: (e) => console.log("exported", e),
    },
  };

  componentDidMount() {
    if (this.props.token !== undefined && this.props.token !== null) {
      this.props.getUserList(this.props.token);
    }
  }

  componentWillReceiveProps(newProps) {
    if (newProps.token !== this.props.token) {
      if (newProps.token !== undefined && newProps.token !== null) {
        this.props.getUserList(newProps.token);
      }
    }
  }

  callbackOne = (e) => {
    console.log("callbackOne", e);
  };
  callbackTwo = (e, f) => {
    console.log("callbackTwo", e, f);
  };

  render() {
    const btns = [
      <Button
        floated="right"
        size="small"
        style={{ padding: "0" }}
        color={this.state.selection.color}
        disabled={this.state.selection.name === "Select"}
        content={
          <>
            <Button
              size="small"
              color={this.state.selection.color}
              disabled={this.state.selection.name === "Select"}
              style={{
                padding: ".78571429rem 1.5rem .78571429rem  1.5rem",
                borderTopRightRadius: "0",
                borderBottomRightRadius: "0",
              }}
            >
              {this.state.selection.name}
            </Button>
            <Dropdown
              style={{
                padding: ".78571429rem .78571429rem .78571429rem 0",
              }}
              floating
              direction="left"
              options={options}
              trigger={<></>}
              onChange={(e, { value }) => this.setState({ selection: value })}
              value={this.state.selection}
            />
          </>
        }
        onClick={(e) => this.state.selection.function(e)}
      />,
    ];

    return (
      <Hoc>
        {this.props.loading ? (
          <Dimmer active />
        ) : (
          <Hoc>
            <UserTable
              users={this.props.users}
              callback={(e) => console.log(e)}
              label={"Log"}
              btnColor={"teal"}
              btns={btns}
              extra={<AddParticipant />}
            />
          </Hoc>
        )}
      </Hoc>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    token: state.auth.token,
    users: state.users.users,
    loading: state.users.loading,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getUserList: (token, callback) => dispatch(getUSERList(token, callback)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Users);
