// Prompt to stop navigation when leaving a page

import { useState } from "react";
import { Prompt } from "react-router-dom";

const PromptToLeave = (props) => {
  const { message, blocking } = props;
  const [isBlocking, setIsBlocking] = useState(blocking);

  return (
    <Prompt
      when={isBlocking}
      message={(location) =>
        `Are you sure you want to go to leave the page? ${message}`
      }
    />
  );
};

export default PromptToLeave;
