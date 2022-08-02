import axios from "axios";
import FormData from "form-data";
import * as actionTypes from "./actionTypes";

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

const getSignedUrlStart = () => {
  return {
    type: actionTypes.GET_SIGNED_URL_START,
  };
};

const getSignedUrlFail = (error) => {
  return {
    type: actionTypes.GET_SIGNED_URL_FAIL,
    error: error,
  };
};

const getSignedUrlSuccess = (url, callback) => {
  if (callback) {
    callback(url);
  }

  return {
    type: actionTypes.GET_SIGNED_URL_SUCCESS,
    url: url,
  };
};

export const getSignedUrl = (token, fileId, callback) => {
  return (dispatch) => {
    dispatch(getSignedUrlStart());
    axios.defaults.headers = {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    };

    const query = `?file=${fileId}`;

    axios
      .get(`/s3/presigned/${query}`)
      .then((res) => {
        const url = res.data;
        dispatch(getSignedUrlSuccess(url, callback));
      })
      .catch((err) => {
        dispatch(getSignedUrlFail(err));
      });
  };
};

const postSignedUrlStart = () => {
  return {
    type: actionTypes.POST_SIGNED_URL_START,
  };
};

const postSignedUrlSuccess = (data) => {
  return {
    type: actionTypes.POST_SIGNED_URL_SUCCESS,
    url: data.url,
    fileId: data.fileId,
  };
};

export const cleanUpSignedUrl = () => {
  return {
    type: actionTypes.CLEAN_UP_SIGNED_URL,
  };
};

const postSignedUrlFail = (error) => {
  return {
    type: actionTypes.POST_SIGNED_URL_FAIL,
    error: error,
  };
};

export const postSignedUrl = (token, question, option, contentType) => {
  axios.defaults.headers = {
    "Content-Type": "application/json",
    Authorization: `Token ${token}`,
  };

  const formData = new FormData();
  formData.append("question", question);
  formData.append("option", option);
  formData.append("content_type", contentType);

  return (dispatch) => {
    dispatch(postSignedUrlStart());
    axios
      .post("/s3/presigned/", formData, {
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
        },
      })
      .then((res) => {
        const data = res.data;
        dispatch(postSignedUrlSuccess(data));
      })
      .catch((err) => {
        dispatch(postSignedUrlFail(err));
      });
  };
};

const getFILEListStart = () => {
  return {
    type: actionTypes.GET_FILE_LIST_START,
  };
};

const getFILEListSuccess = (modules) => {
  return {
    type: actionTypes.GET_FILE_LIST_SUCCESS,
    modules,
  };
};

const getFILEListFail = (error) => {
  return {
    type: actionTypes.GET_FILE_LIST_FAIL,
    error: error,
  };
};

export const getFILEList = (token) => {
  return (dispatch) => {
    dispatch(getFILEListStart());
    axios.defaults.headers = {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    };
    axios
      .get("/s3/")
      .then((res) => {
        const files = res.data;
        dispatch(getFILEListSuccess(files));
      })
      .catch((err) => {
        dispatch(getFILEListFail());
      });
  };
};

const getFILEStart = () => {
  return {
    type: actionTypes.GET_FILE_START,
  };
};

const getFILESuccess = (file) => {
  return {
    type: actionTypes.GET_FILE_SUCCESS,
    file,
  };
};

const getFILEFail = (error) => {
  return {
    type: actionTypes.GET_FILE_FAIL,
    error: error,
  };
};

export const getFILE = (token, key) => {
  return (dispatch) => {
    dispatch(getFILEStart());
    axios.defaults.headers = {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    };
    axios
      .get(`/s3/${key}/`)
      .then((res) => {
        const file = res.data;
        dispatch(getFILESuccess(file));
      })
      .catch((err) => {
        dispatch(getFILEFail());
      });
  };
};

const uploadFILEStart = () => {
  return {
    type: actionTypes.UPLOAD_FILE_START,
  };
};

const uploadFILESuccess = (file, callback) => {
  if (callback) {
    callback(file);
  }
  return {
    type: actionTypes.UPLOAD_FILE_SUCCESS,
    file,
  };
};

const uploadFILEFail = (error) => {
  return {
    type: actionTypes.UPLOAD_FILE_FAIL,
    error: error,
  };
};

export const uploadFILE = (token, data, callback, options) => {
  var form = new FormData();
  form.append("file", data);
  if (options) {
    Object.entries(options).forEach(([key, value], index, array) => {
      form.append(key, value);
    });
  }

  return (dispatch) => {
    dispatch(uploadFILEStart());
    axios.defaults.headers = {
      Authorization: `Token ${token}`,
    };
    axios
      .post(`/s3/upload/`, form)
      .then((res) => {
        let file = res.data;
        dispatch(uploadFILESuccess(file, callback));
      })
      .catch((err) => {
        console.error(err);
        dispatch(uploadFILEFail());
      });
  };
};

export const getWithSignedUrl = (pre_signed_url, callback) => {
  return (dispatch) => {
    dispatch(getFILEStart());
    axios.defaults.headers = {
      "Content-Type": "application/json",
    };
    axios
      .get(pre_signed_url)
      .then((res) => {
        const file = res.data;
        dispatch(getFILESuccess(file, callback));
      })
      .catch((err) => {
        dispatch(getFILEFail(err));
      });
  };
};

export const uploadWithSignedUrl = (pre_signed_url, data, fileId, callback) => {
  const form = new FormData();
  // append all fields from presigned url
  // reset axios headers
  axios.defaults.headers = {};

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

  return (dispatch) => {
    dispatch(uploadFILEStart());
    axios
      .post(pre_signed_post.url, form, {
        headers: { ...form.get("headers"), ContentType: "multipart/form-data" },
      })
      .then((res) => {
        dispatch(uploadFILESuccess(fileId, callback));
      })
      .catch((err) => {
        console.error(err);
        dispatch(uploadFILEFail());
      });
  };
};
