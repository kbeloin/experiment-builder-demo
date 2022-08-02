import { Segment, Header, Icon, Button, Loader } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export const Submitted = (props) => {
  const [delay, setDelay] = useState(props.delay ?? null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (delay === null) {
      setLoaded(true);
    }
    // otherwise, wait for delay
    else {
      setTimeout(() => {
        setLoaded(true);
      }, delay);
    }
  }, [delay, props.delay]);

  return (
    <Segment
      style={{
        display: "grid",

        placeContent: "center",
        height: "100%",
        width: "100%",
      }}
    >
      {/* Check if there is a delay set in props */}
      <Header as="h2" icon textAlign="center">
        <Icon color="green" name="check circle" />
        <Header.Content>
          {loaded
            ? "Thank you! Your responses have been recorded."
            : "Submitting..."}
        </Header.Content>
      </Header>
      {/* If there is a delay, show a loading screen */}
      {loaded ? (
        <>
          {props.extra}
          {/* Check if there is a delay set in props */}
          {/* If there is a delay set, show a button to go to the next page after delay is finished*/}

          {props.callback && (
            <Button
              type={"button"}
              content={props.message ?? "Go back"}
              onClick={(e) => {
                props.callback();
              }}
              as={props.path && Link}
              to={props.path ?? "/"}
            />
          )}
        </>
      ) : (
        <Loader style={{ justifySelf: "center" }} active inline />
      )}
    </Segment>
  );
};

export default Submitted;
