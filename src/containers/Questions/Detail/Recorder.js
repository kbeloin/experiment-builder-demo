import React, { useEffect, useState, useRef } from "react";
import {
  Button,
  Form,
  Loader,
  Dimmer,
  Segment,
  Header,
  Icon,
} from "semantic-ui-react";
import axios from "axios";
import processMap from "../../../components/Data/processes";
import { useSelector } from "react-redux";

var options = {
  audioBitsPerSecond: 44100,
};

const useRecorder = (existingURL) => {
  const [audioURL, setAudioURL] = useState(existingURL);
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [rawData, setRawData] = useState(null);
  const [wavData, setWavData] = useState(null);

  useEffect(() => {
    // Lazily obtain recorder first time we're recording.
    if (recorder === null) {
      if (isRecording) {
        requestRecorder().then(setRecorder, console.error);
      }
      return;
    }

    // Manage recorder state.
    if (isRecording) {
      recorder.start();
    } else {
      // check if inactive
      if (recorder.state === "inactive") {
        console.log("Recorder inactive");
      }
      // check if recording
      else {
        recorder.stop();
      }
    }

    // Obtain the audio when ready.
    const handleData = (e) => {
      // const blob = new Blob([e.data]);

      let ctx = new AudioContext();
      let reader = new FileReader();
      const blob = new Blob([e.data], { type: "audio/mpeg" });
      reader.readAsArrayBuffer(e.data);
      reader.onloadend = () => {
        console.info("data loaded");
        ctx
          .decodeAudioData(reader.result)
          .then(function (decodedData) {
            // create new blob with type of mp3 from e.data
            const view = decodedData.getChannelData(0); //
            setWavData(view);
            setRawData(blob); // This might be done by
            setAudioURL(URL.createObjectURL(e.data)); //log of base64data is "data:audio/ogg; codecs=opus;base64,GkX..."
          })
          .catch((err) => {
            console.error(err);
            // alert user of error
            window.alert("Error decoding audio data. Please try again.");
          });
      };
    };
    recorder.addEventListener("dataavailable", handleData);
    return () => recorder.removeEventListener("dataavailable", handleData);
  }, [recorder, isRecording]);

  const startRecording = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  return [
    audioURL,
    isRecording,
    startRecording,
    stopRecording,
    rawData,
    wavData,
  ];
};

async function requestRecorder() {
  // check if browser supports web audio API
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.log("Web audio API not supported.");
    return;
  }
  let stream = null;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    /* use the stream */
  } catch (err) {
    console.log(`navigator.mediaDevices.getUserMedia() failed: ${err.message}`);
    /* handle the error */
  }

  if (stream === null) {
    console.log("Stream is null");
  }

  return new MediaRecorder(stream, options);
}

const Recorder = (props) => {
  const {
    questionId,
    responseId,
    update,
    onUpload,
    response,
    option,
    upload,
    uploading,
  } = props;

  const [
    audioURL,
    isRecording,
    startRecording,
    stopRecording,
    rawData,
    wavData,
  ] = useRecorder(response !== undefined ? response[option.id] ?? null : null);

  const [visualization, setVisualization] = React.useState({
    active: option?.process ?? "" !== "",
    element: null,
    data: null,
    component: null,
    chart: null,
  });

  const token = useSelector((state) => state.auth.token);

  const [uploadURL, setUploadURL] = React.useState(null);

  const [processing, setProcessing] = useState(false);

  const [playing, setPlaying] = useState(false);

  const [error, setError] = useState(null);

  const audioRef = useRef(null);

  const pitchData = (res) => {
    const data = res.data;
    if (visualization.active) {
      const data = res.data;
      const component = processMap(option.process, "chart");
      setVisualization({
        ...visualization,
        active: !visualization.active,
        data,
        component,
      });
    }

    onUpload({ id: res.fileId, option: option.id });
    setUploadURL(res.url);
  };

  const onPlay = () => {
    if (audioURL) {
      console.log("playing");
      setPlaying(true);
    }
  };

  const onEnd = () => {
    // if audio is playing, stop it
    if (playing) {
      console.log("stopped");
      setPlaying(false);
    }
  };

  const resetInterface = (error) => {
    setProcessing(false);
    setPlaying(false);
    setVisualization({
      active: option?.process ?? "" !== "",
      element: null,
      data: null,
      component: null,
      chart: null,
    });
  };

  const handlePlay = () => {
    if (audioURL) {
      audioRef.current.play();
    }
  };

  const processAudioData = (audio) => {
    const component = processMap(visualization.process ?? "pitch", "chart");
    if (audio) {
      // post request to audio endpoint

      var form = new FormData();

      form.append("file", JSON.stringify(audio));
      form.append("process", visualization.process ?? "pitch");
      form.append("convert", "wav");
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
          setProcessing(false);
        })
        // if there is an error
        .catch((error) => {
          setError(error);
        });
    }
  };

  useEffect(() => {
    if (option !== undefined) {
      if (option.process && upload && rawData) {
        upload(
          rawData,
          (res) => {
            setVisualization({
              ...visualization,
              active: true,
            });
            setUploadURL(res.url);
            setProcessing(true);
            onUpload({ id: res.fileId, option: option.id });
          },
          {
            origin: "user_response",
            question: questionId,
          }
        );
      } else {
        if (upload && rawData) {
          upload(
            rawData,
            (res) => {
              setUploadURL(res.url);
              onUpload({ id: res.fileId, option: option.id });
            },
            {
              origin: "user_response",
              option: option.id,
              question: questionId,
            }
          );
        }
      }
    }
  }, [rawData]);

  useEffect(() => {
    if (update !== undefined) {
      if (visualization.active) {
        processAudioData(wavData);
        update(uploadURL);
      } else {
        update(uploadURL);
      }
    }
  }, [uploadURL]);

  // if theres an error, reset other state

  useEffect(() => {
    if (error) {
      resetInterface(error);
    }
  }, [error]);

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

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h4>{option !== undefined ? option.title : null}</h4>
      {option?.process ?? "" !== "" ? (
        error ? (
          <Segment
            placeholder
            style={{ maxWidth: "470px", maxHeight: "350px", height: "350px" }}
          >
            <Header icon>
              <Icon name="circle cancel" color="negative" />
              Sorry, there was an error processing your audio!
            </Header>
            <Button
              onClick={() => {
                setError(null);
                startRecording();
              }}
            >
              Try Again
            </Button>
          </Segment>
        ) : uploading || processing ? (
          <Segment
            placeholder
            style={{ maxWidth: "470px", maxHeight: "350px", height: "350px" }}
          >
            <Dimmer
              style={{ maxWidth: "470px", maxHeight: "350px", height: "350px" }}
              active
            >
              <Loader>
                Processing Audio... {"\n"}
                (This may take up to 30 seconds!)
              </Loader>
            </Dimmer>
          </Segment>
        ) : (
          <Segment
            placeholder={visualization.data === null}
            style={{ maxWidth: "470px", maxHeight: "350px", height: "350px" }}
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
            ) : isRecording ? (
              <Dimmer
                style={{
                  maxWidth: "470px",
                  maxHeight: "350px",
                  height: "350px",
                }}
                active
              >
                <Loader>Recording...</Loader>
              </Dimmer>
            ) : (
              <Header icon>
                <Icon name="file audio outline" />
                No Audio To Process
              </Header>
            )}
          </Segment>
        )
      ) : null}
      <Form.Field
        className="Recorder"
        id={`recorder-${questionId}-${responseId}`}
        style={{ display: "flex", flexDirection: "row" }}
      >
        <audio
          src={audioURL !== undefined && audioURL !== null ? audioURL : null}
          ref={audioRef}
          onPlay={onPlay}
          onEnded={onEnd}
          onPause={onEnd}
        />
        {/* if recorder is not recording, show the start button */}
        <Button
          icon
          labelPosition="left"
          onClick={handlePlay}
          // make sure the width of button doesn't change
          // width is the length of maxiumum number of characters in the button
          // the longest button contains the chars "PROCESSING"
          style={{
            width: "150px",
          }}
          disabled={
            isRecording ||
            audioURL == undefined ||
            audioURL == null ||
            processing ||
            playing ||
            uploading
          }
          content={
            // case switch for the button content
            // if player is playing show pause button
            // if player is paused show play button
            // if player is uploading show loading icon
            // if player is processing show loading icon
            uploading ? (
              <>
                <Icon
                  name="spinner"
                  style={{ backgroundColor: "transparent" }}
                />
                UPLOADING
              </>
            ) : processing ? (
              <>
                <Icon
                  name="spinner"
                  loading
                  style={{ backgroundColor: "transparent" }}
                />
                PROCESSING
              </>
            ) : audioRef.current && !isRecording ? (
              playing ? (
                <>
                  <Icon
                    name="spinner"
                    loading
                    style={{ backgroundColor: "transparent" }}
                  />
                  PLAYING
                </>
              ) : (
                <>
                  <Icon name="play" />
                  PLAY
                </>
              )
            ) : (
              <>
                <Icon name="play" />
                PLAY
              </>
            )
          }
        />
        <Button
          icon={"red circle"}
          labelPosition="left"
          onClick={startRecording}
          disabled={
            isRecording || questionId === undefined || responseId === undefined
          }
          style={{
            width: "150px",
          }}
          content={
            isRecording ? (
              <>
                <Icon
                  name="spinner"
                  loading
                  style={{ backgroundColor: "transparent" }}
                />
                RECORDING
              </>
            ) : (
              <>START</>
            )
          }
        />
        <Button
          icon={"stop"}
          labelPosition="left"
          onClick={stopRecording}
          disabled={!isRecording}
          content={"STOP"}
          style={{
            width: "150px",
          }}
        />
      </Form.Field>
    </div>
  );
};

export default Recorder;
