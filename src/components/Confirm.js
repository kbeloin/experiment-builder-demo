import React, { Component } from "react";
import { Button, Confirm } from "semantic-ui-react";
import { withRouter } from "react-router-dom";

class ConfirmComponent extends Component {
  render() {
    return (
      <div>
        <Confirm
          open={this.props.open}
          cancelButton={this.props.cancelButton}
          confirmButton={this.props.confirmButton}
          onCancel={this.props.onCancel}
          content={this.props.content}
          header={this.props.header}
        />
      </div>
    );
  }
}

export default withRouter(ConfirmComponent);
