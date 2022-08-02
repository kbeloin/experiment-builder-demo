import React from "react";
import { Button, Modal } from "semantic-ui-react";

function CustomModal(props) {
  const [open, setOpen] = React.useState(true);

  // if this modal is open, pause any video or audio that is playing on the page
  React.useEffect(() => {
    if (open) {
      const video = document.querySelector("video");
      const audio = document.querySelector("audio");
      if (video) {
        // try to pause the video and catch any errors
        try {
          video.pause();
        } catch (error) {
          // do nothing
        }
      }
      if (audio) {
        try {
          audio.pause();
        } catch (error) {
          // do nothing
        }
      }
    }
    // resume any video or audio that was playing before this modal was opened
    return () => {
      if (open) {
        const video = document.querySelector("video");
        const audio = document.querySelector("audio");
        // try to play the video and catch any errors

        if (video && video.paused) {
          try {
            video.play();
          } catch (error) {
            // do nothing
          }
        }
        if (audio && audio.paused) {
          try {
            audio.play();
          } catch (error) {
            // do nothing
          }
        }
      }
    };
  }, [open]);

  const content = props.data;
  const element = props.element ? (
    props.element
  ) : (
    <Button>Show intructions</Button>
  );
  return (
    <Modal
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      trigger={element}
    >
      <Modal.Header>Instructions</Modal.Header>
      <Modal.Content>
        <div dangerouslySetInnerHTML={content} />
      </Modal.Content>
      <Modal.Actions>
        <Button
          content="Okay"
          labelPosition="right"
          icon="checkmark"
          onClick={() => setOpen(false)}
          color="blue"
        />
      </Modal.Actions>
    </Modal>
  );
}

export default CustomModal;
