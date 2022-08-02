import React, { useCallback, useEffect } from "react";
import { Modal, ModalContent } from "semantic-ui-react";
import LoginForm from "./LoginForm";
import Hoc from "../../hoc/hoc";

const LoginModal = (props) => {
  const token = props.token;
  const [open, setOpen] = React.useState(token === null);

  useEffect(() => {
    if (token !== null) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [token]);

  return (
    <Modal open={open} trigger={null} style={{ width: "min(450px, 100%)" }}>
      <ModalContent>
        <LoginForm />
      </ModalContent>
    </Modal>
  );
};

export default LoginModal;
