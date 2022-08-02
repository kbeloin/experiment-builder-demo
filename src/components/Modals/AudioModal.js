import {
  Modal,
  List,
  Input,
  Checkbox,
  Grid,
  Icon,
  Form,
  Header,
  Button,
  Segment,
  Divider,
} from "semantic-ui-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import processMap from "../Data/processes";
import { getAudioFromUrlAsync } from "../utility";
// Modal that displays a list of checkboxes
// Each checkbox is a setting for the audio component
// The checkbox is checked if the audio component has that setting
// The checkbox is unchecked if the audio component does not have that setting
const audioSettings = {
  autoplay: {
    name: "Autoplay",
    title: "autoplay",
    description: "Whether the audio should autoplay",
    value: false,
  },
  awaitEnded: {
    name: "Await Ended",
    title: "awaitEnded",
    description:
      "Whether user audio should wait for the audio to end before interacting with the page",
    value: false,
  },
  controls: {
    name: "Hide Controls",
    title: "controls",
    description: "Whether the audio should have controls",
    value: false,
  },
  disableAfterPlaying: {
    name: "Disable After Playing",
    title: "disableAfterPlaying",
    description: "Whether the audio should be disabled after playing",
    value: false,
  },
};

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

const AudioModal = (props) => {
  // initial state is based on audio settings
  const [settings, setState] = useState(audioSettings);
  // soruce of the audio file to be attached to the audio component; can be file object or url
  const [source, setSource] = useState({ type: "url", value: "" });
  // open state of the modal
  const [open, setOpen] = useState(false);
  const [visualization, setVisualization] = useState({
    active: false,
    component: null,
    element: null,
    data: null,
    img: null,
    process: null,
  });
  const token = useSelector((state) => state.auth.token);

  // the callback will take in an object with the settings that the user has selected
  const { callback, handleFileUpload, handleEmbed } = props;

  // Upload Image to Image Server such as AWS S3, Cloudinary, Cloud Storage, etc..
  const saveToServer = (file, filetype) => {
    const options = { origin: "rich_text" };
    handleFileUpload(
      file,
      (res) => {
        callback(res, filetype, settings);
      },
      options
    );
  };

  const attachAudioFile = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "audio/*");
    // unique id for the input element
    input.id = "audio-file-input";
    input.click();
    input.onchange = () => {
      const type = "file";
      const file = input.files[0];
      setSource({ type: type, value: file });
    };
  };

  const getAudioFromUrl = ({ url, callback }) => {
    // remove default axios authorization header in get request
    axios.defaults.headers["Authorization"] = "";

    axios
      .get(encodeURI(url), {
        responseType: "arraybuffer",
      })
      .then((response) => {
        // get file extension from headers content-type
        const filetype = response.headers["content-type"];
        // get file name from url
        const filename = url.split("/").pop();
        // create new file object with the file name and file extension
        const file = new File([response.data], filename, {
          type: filetype,
        });
        callback(file);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // when the user clicks the submit button
  const processAudioData = (audio) => {
    const component = processMap(visualization.process ?? "pitch", "chart");
    if (audio !== undefined) {
      // post request to audio endpoint

      var form = new FormData();

      form.append("file", audio);
      form.append("process", visualization.process ?? "pitch");
      axios
        .post("/audio/process/", form, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Token ${token}`,
          },
        })
        // set the visualization data to the response
        .then((response) => {
          const data = response.data;
          // set the visualization data and component

          setVisualization({
            ...visualization,
            component: component,
            data: data,
          });
        })
        // if there is an error
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const handleProcessRequest = () => {
    // element process will always be chart
    let audio;
    if (visualization.element) {
      visualization.element.destroy();
    }

    if (source.type === "file") {
      // get the file
      audio = source.value;
      processAudioData(audio);
    } else {
      // if the source is a url create new audio object with the url
      // check if source is a url
      if (source.type === "url") {
        // request to get the audio data from a url asynchronously
        const asyncFile = getAudioFromUrlAsync(source.value);

        // wait for the audio data to be returned
        asyncFile
          .then(
            (file) => {
              processAudioData(file);
            }
            // if there is an error
          )
          .catch(
            (error) => {
              console.log(error);
            }
            // if the source is a file
          );
      }
    }
  };

  const handleSubmit = () => {
    // the callback will take in an object with the settings that the user has selected
    // callback is insertEmbed in RichTextEditor

    // if source is a file use saveToServer to upload the file to the server
    const sourceType = source.type;
    const sourceSettings = settings;
    if (visualization.active && visualization.img) {
      // if visualization is active
      // insert the visualization img into the editor
      callback({ url: visualization.img }, "chart");
    }
    // switch statement to determine what type of source the user has selected

    switch (sourceType) {
      case "file":
        // if the source is a file
        // save the file to the server
        saveToServer(source.value, "audio");
        break;
      case "url":
        // if the source is a url don't save the file to the server
        // just use the url
        callback({ url: source.value }, "audio", sourceSettings);

        break;
      default:
        console.log("error");
    }
    // check if visualization is active and has image

    // close the modal
    setOpen(false);
  };

  // if modal is closed, reset the state for settings and source
  const handleClose = () => {
    setState(audioSettings);
    setSource(null);
  };

  // if visualization data changes, update the visualization element
  // use useEffect to update the visualization element

  // if the source changes, update the visualization element
  // use useEffect to destroy the old element
  useEffect(() => {
    if (visualization.element !== null) {
      // force update the visualization element by toggling the active state
      setVisualization({ ...visualization, active: !visualization.active });
    }
  }, [visualization.data]);

  // If active is false and the visualization data is not null
  // toggle the active state
  useEffect(() => {
    if (visualization.active === false && visualization.process !== null) {
      setVisualization({ ...visualization, active: true });
    }
  }, [visualization.active]);

  // The Modal Content will display three sections:

  // 1. Option to attach and upload audio file or enter the URL of an audio file
  // 2. Checkboxes that allow the user to select which settings to display
  // 3. A button that will submit the settings

  return (
    <Modal
      closeOnDimmerClick={false}
      open={open}
      onClose={handleClose}
      trigger={
        <Button
          onClick={(e) => {
            e.preventDefault();
            setOpen(true);
          }}
          style={{ background: "#e0e1e2 none", width: "unset" }}
        >
          Add Audio
        </Button>
      }
    >
      <Modal.Header textAlign={"center"} centered>
        Add Audio
      </Modal.Header>
      <Modal.Content>
        {/* Grid with two columns and vertical 'or' divider */}
        {/* Left column contains the upload or attach option, and right column allows user to enter URL */}
        <Grid columns={2}>
          <Grid.Row centered>
            <Grid.Column textAlign="center" centered>
              <Header>Upload</Header>
              {/* Upload button */}
              <Input
                action={{
                  onClick: attachAudioFile,
                  type: "button",
                  color: "blue",
                  icon: "upload",
                  value: "Upload",
                  content: "Upload",
                }}
                actionPosition="left"
                value={
                  source && source.type === "file"
                    ? source.value.name
                    : "No file selected"
                }
              />

              {/* Text that shows the name of file */}
            </Grid.Column>
            <Divider vertical>Or</Divider>
            <Grid.Column textAlign="center" centered>
              <Header>Enter URL</Header>
              {/* Input for URL */}

              <Input
                placeholder="Enter URL"
                style={{ width: "80%" }}
                type="url"
                value={source.type === "url" ? source.value : ""}
                onChange={(e) => {
                  setSource({ type: "url", value: e.target.value });
                }}
              />
            </Grid.Column>
          </Grid.Row>
          <Divider />
          <Grid.Row stretched divided>
            <Grid.Column width={4}>
              <Header>Settings</Header>
              {/* List of checkboxes */}
              <List>
                {Object.keys(audioSettings).map((key) => {
                  return (
                    <List.Item key={key}>
                      <Checkbox
                        label={settings[key].name}
                        checked={settings[key].value}
                        onChange={() => {
                          setState({
                            ...settings,
                            [key]: {
                              ...settings[key],
                              value: !settings[key].value,
                            },
                          });
                        }}
                      />
                    </List.Item>
                  );
                })}
                <List.Item>
                  <Checkbox
                    label="Process audio file"
                    onChange={(e) => {
                      setVisualization({
                        ...visualization,
                        active: !visualization.active,
                        process: e.target.checked ? "pitch" : null,
                      });
                    }}
                    checked={visualization.active}
                  />
                </List.Item>
              </List>
            </Grid.Column>
            <Grid.Column width={8}>
              {visualization.active && source && (
                <>
                  <Segment
                    placeholder={!visualization.component}
                    style={{ width: "470px", height: "350px" }}
                  >
                    {visualization.component ? (
                      <visualization.component
                        data={visualization.data}
                        callback={(e) => {
                          const chartImg = e.chart.toBase64Image();
                          const chart = e.chart;
                          setVisualization({
                            ...visualization,
                            img: chartImg,
                            element: chart,
                          });
                        }}
                        setRef={(e) => {
                          setVisualization({ ...visualization, element: e });
                        }}
                      />
                    ) : (
                      <>
                        <Header icon>
                          <Icon name="file audio outline" />
                          No Audio To Process
                        </Header>
                        <Button
                          disabled={!source.value}
                          onClick={handleProcessRequest}
                        >
                          Process Audio
                        </Button>
                      </>
                    )}
                  </Segment>
                  {/* Button is on its own; only show when vis component available*/}
                  {visualization.component && (
                    <Form.Field>
                      <Button disabled={!source} onClick={handleProcessRequest}>
                        Process Audio
                      </Button>
                    </Form.Field>
                  )}
                </>
              )}
            </Grid.Column>
          </Grid.Row>
          {/* Row that shows processed audio */}
        </Grid>
      </Modal.Content>
      <Modal.Actions>
        <Button
          onClick={(e) => {
            e.preventDefault();
            setOpen(false);
          }}
        >
          Cancel
        </Button>
        <Button color={"blue"} onClick={handleSubmit}>
          Submit
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default AudioModal;
