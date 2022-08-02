import { useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
const lamejs = require("lamejstmp");

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

const UploadRecording = () => {
  // This function takes any audio file, and sets the publicly accessible URL
  // initial state is based on audio settings
  // soruce of the audio file to be attached to the audio component; can be file object or url
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = useSelector((state) => state.auth.token);

  // the callback will take in an object with the settings that the user has selected

  // get the signed url for the audio file

  const convertToMp3 = async (file) => {
    let sampleBlockSize = 1152;

    const encoder = new lamejs.Mp3Encoder(1, 44100, 128);

    const newFile = await file.arrayBuffer().then((samples) => {
      var mp3Tmp = encoder.encodeBuffer(samples); //encode mp3

      //Push encode buffer to mp3Data variable
      mp3Data.push(mp3Tmp);

      // Get end part of mp3
      mp3Tmp = encoder.flush();
      const mp3Data = [];

      for (var i = 0; i < samples.length; i += sampleBlockSize) {
        let sampleChunk = samples.subarray(i, i + sampleBlockSize);
        let mp3buf = encoder.encodeBuffer(sampleChunk);
        if (mp3buf.length > 0) {
          mp3Data.push(mp3buf);
        }
      }

      let mp3buf = encoder.flush(); //finish writing mp3

      if (mp3buf.length > 0) {
        mp3Data.push(new Int8Array(mp3buf));
      }
      return mp3Data;
    });
    return newFile;
  };

  // 1. Get the signed url for uploading an audio file; returns fileId and presigned url
  // 2. Client uploads the audio file to the presigned url
  // 3. On a successful upload, the client requests the signed url to get the publicly accessible url
  // 4. The client then attaches the url to the audio component

  const getPublicUrl = async (id) => {
    let headers = {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    };

    const query = `?file=${id}`;

    const { url, fileId } = await axios
      .get(`/s3/presigned/${query}`, { ...headers })
      .then((res) => {
        return { url: res.data, fileId: id };
      })
      .catch((err) => {
        console.log(err);
        setError(err);
      });
    return { url, fileId };
  };

  const uploadWithSignedUrl = async (pre_signed_url, fileId, data) => {
    // Uploads audio file to S3 from client side
    const form = new FormData();
    // append all fields from presigned url
    // reset axios headers
    axios.defaults.headers = {};

    console.log(data);

    const pre_signed_post = pre_signed_url;
    // append files
    const file = new File([data], pre_signed_post.fields.key, {
      type: "audio/mpeg",
    });

    Object.entries(pre_signed_post.fields).forEach(
      ([key, value], index, array) => {
        form.append(key, value);
      }
    );

    form.append("file", file);

    console.log(file);

    const publicURL = await axios
      .post(pre_signed_post.url, form, {
        headers: {
          ...form.get("headers"),
          ContentType: "multipart/form-data",
          ContentDisposition: "attachment",
        },
      })
      .then((res) => {
        //   on success, call the getSignedUrl action to get the public url
        console.log("Done loading");
        setLoading(false);
        return fileId;
      })
      .catch((err) => {
        setError(err);
      });
    return publicURL;
  };

  const createPreSignedPostURL = async (question, option) => {
    axios.defaults.headers = {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    };

    const formData = new FormData();
    formData.append("question", question);
    formData.append("option", option);
    formData.append("content_type", "audio/mpeg");

    const { url, fileId } = await axios
      .post("/s3/presigned/", formData)
      .then((res) => {
        console.log(res);
        return res.data;
      })
      .catch((err) => {
        console.error(err);
        setError(err);
      });
    return { url, fileId };
  };

  const setUpload = async (data, question, option) => {
    setLoading(true);
    const res = convertToMp3(data).then((file) => {
      const res = createPreSignedPostURL(question, option)
        .then((res) => {
          const publicUrl = uploadWithSignedUrl(res.url, res.fileId, file).then(
            (res) => {
              const url = getPublicUrl(res).then((res) => {
                return res;
              });
              return url;
            }
          );
          return publicUrl;
        })
        .catch((err) => {
          setError(err);
        });
      return res;
    });
    return res;
  };

  return [setUpload, loading];
};

export default UploadRecording;
