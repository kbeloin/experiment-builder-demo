import { PitchChart } from "./Charts/AudioChart";
import axios from "axios";

export const processes = {
  pitch: {
    chart: PitchChart,
  },
};

export const processMap = (process, key) => {
  const element = processes[process][key];
  return element;
};

export const processAudio = (token, audio, process, callback) => {
  axios.defaults.xsrfCookieName = "csrftoken";
  axios.defaults.xsrfHeaderName = "X-CSRFToken";
  // utility funciton to process audio data using the process api
  // process is the name of the process
  var form = new FormData();

  form.append("file", audio);
  form.append("process", process ?? "pitch");
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
      callback(data);
    })
    // if there is an error
    .catch((error) => {
      console.log(error);
    });
};

export default processMap;
