import * as actionTypes from "../actions/actionTypes";
import { updateObject } from "../utility";

const initialState = {
  files: [],
  currentFile: {},
  currentFileId: null,
  error: null,
  loading: false,
  upload: {},
  getSignedUrl: "",
  postSignedUrl: "",
};

const cleanUpSignedUrl = (state, action) => {
  return updateObject(state, {
    getSignedUrl: "",
    postSignedUrl: "",
    currentFileId: null,
  });
};

const getSignedUrlStart = (state, action) => {
  return updateObject(state, {
    loading: true,
    error: null,
  });
};

const getSignedUrlSuccess = (state, action) => {
  return updateObject(state, {
    loading: false,
    getSignedUrl: action.url,
  });
};

const getSignedUrlFail = (state, action) => {
  return updateObject(state, {
    loading: false,
    error: action.error,
  });
};

const postSignedUrlStart = (state, action) => {
  return updateObject(state, {
    loading: true,
    error: null,
  });
};

const postSignedUrlSuccess = (state, action) => {
  return updateObject(state, {
    loading: false,
    postSignedUrl: action.url,
    currentFileId: action.fileId,
  });
};

const postSignedUrlFail = (state, action) => {
  return updateObject(state, {
    loading: false,
    error: action.error,
  });
};

const getFILEListStart = (state, action) => {
  return updateObject(state, {
    error: null,
    loading: true,
  });
};

const getFILEListSuccess = (state, action) => {
  return updateObject(state, {
    files: action.files,
    error: null,
    loading: false,
  });
};

const getFILEListFail = (state, action) => {
  return updateObject(state, {
    error: action.error,
    loading: false,
  });
};

const getFILEStart = (state, action) => {
  return updateObject(state, {
    error: null,
    loading: true,
  });
};

const getFILESuccess = (state, action) => {
  return updateObject(state, {
    currentFile: action.file,
    error: null,
    loading: false,
  });
};

const getFILEFail = (state, action) => {
  return updateObject(state, {
    error: action.error,
    loading: false,
  });
};

const uploadFILEStart = (state, action) => {
  return updateObject(state, {
    error: null,
    loading: true,
  });
};

const uploadFILESuccess = (state, action) => {
  return updateObject(state, {
    upload: action.file,
    error: null,
    loading: false,
  });
};

const uploadFILEFail = (state, action) => {
  return updateObject(state, {
    error: action.error,
    loading: false,
  });
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.GET_FILE_LIST_START:
      return getFILEListStart(state, action);
    case actionTypes.GET_FILE_LIST_SUCCESS:
      return getFILEListSuccess(state, action);
    case actionTypes.GET_FILE_LIST_FAIL:
      return getFILEListFail(state, action);
    case actionTypes.GET_FILE_START:
      return getFILEStart(state, action);
    case actionTypes.GET_FILE_SUCCESS:
      return getFILESuccess(state, action);
    case actionTypes.GET_FILE_FAIL:
      return getFILEFail(state, action);
    case actionTypes.UPLOAD_FILE_START:
      return uploadFILEStart(state, action);
    case actionTypes.UPLOAD_FILE_SUCCESS:
      return uploadFILESuccess(state, action);
    case actionTypes.UPLOAD_FILE_FAIL:
      return uploadFILEFail(state, action);
    case actionTypes.GET_SIGNED_URL_START:
      return getSignedUrlStart(state, action);
    case actionTypes.GET_SIGNED_URL_SUCCESS:
      return getSignedUrlSuccess(state, action);
    case actionTypes.GET_SIGNED_URL_FAIL:
      return getSignedUrlFail(state, action);
    case actionTypes.POST_SIGNED_URL_START:
      return postSignedUrlStart(state, action);
    case actionTypes.POST_SIGNED_URL_SUCCESS:
      return postSignedUrlSuccess(state, action);
    case actionTypes.POST_SIGNED_URL_FAIL:
      return postSignedUrlFail(state, action);
    case actionTypes.CLEAN_UP_SIGNED_URL:
      return cleanUpSignedUrl(state, action);
    default:
      return state;
  }
};

export default reducer;
