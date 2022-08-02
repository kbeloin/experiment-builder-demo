// Modal that shows the module configuration preview during module detail

import { useState } from "react";
import { Modal, Button, Icon } from "semantic-ui-react";
import ConfigTable from "../Tables/Config";
import { config } from "../../containers/Modules/config";
import { useSelector, useDispatch } from "react-redux";

const ModuleConfigPreview = () => {
  const [open, setOpen] = useState(false);
  const [currentModule, setConfig] = useState(
    useSelector((state) => state.modules.currentModule)
  );

  const is_moderator = useSelector((state) => state.auth.is_moderator);

  const dispatch = useDispatch();

  const handleSubmit = () => {
    dispatch({ type: "UPDATE_CURRENT_MODULE", module: currentModule });
    setOpen(false);
  };

  const handleChange = (key, value) => {
    setConfig({
      ...currentModule,
      config: { ...currentModule.config, [key]: value },
    });
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        setOpen(false);
      }}
      trigger={
        is_moderator && (
          <Icon
            link
            onClick={() => {
              setOpen(true);
            }}
            size="large"
            title="Preview Module Configuration"
            name="settings"
            style={{ marginLeft: "auto" }}
          />
        )
      }
    >
      <Modal.Header>Module Configuration Preview</Modal.Header>
      <Modal.Content>
        <ConfigTable
          config={config}
          initial={currentModule?.config ?? {}}
          callback={handleChange}
        />
      </Modal.Content>
      <Modal.Actions>
        <Button color="blue" onClick={handleSubmit}>
          Submit
        </Button>
        <Button
          onClick={(e) => {
            e.preventDefault();
            setOpen(false);
          }}
        >
          Cancel
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default ModuleConfigPreview;
