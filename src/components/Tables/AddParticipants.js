import React from "react";
import { Button, Modal, Message } from "semantic-ui-react";
import RegistrationForm from "../../containers/Signup/SignupForm";
import Hoc from "../../hoc/hoc";
import { toCSV } from "../utility";

function AddParticipant() {
  const [open, setOpen] = React.useState(false);
  const [userAdded, addUser] = React.useState(null);

  const handleAdd = (e) => {
    addUser(e["user"]);
  };

  return (
    <Hoc>
      <Modal
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        open={open}
        trigger={<Button floated="right">Add</Button>}
        className={"attached"}
      >
        <Modal.Content>
          <RegistrationForm callback={(e) => handleAdd(e)} />
        </Modal.Content>
        <Modal.Actions style={{ display: "flex", justifyContent: "flex-end" }}>
          {userAdded ? (
            <Message
              size="small"
              positive
              style={{
                display: "flex",
                gap: "0.5em",
                alignItems: "center",
                paddingTop: "0",
                paddingBottom: "0",
                paddingRight: "0",
                margin: "0",
                width: "100%",
              }}
            >
              Successfully Added {userAdded.username} as a {userAdded.userType}!
              <Button
                icon="download"
                size="mini"
                style={{ marginLeft: "auto" }}
                onClick={(e) => {
                  e.preventDefault();
                  toCSV(userAdded);
                }}
              />
            </Message>
          ) : null}
          <Button content="Back" onClick={() => setOpen(false)} />
        </Modal.Actions>
      </Modal>
    </Hoc>
  );
}

export default AddParticipant;
