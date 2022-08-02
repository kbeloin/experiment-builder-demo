import { Table, Icon } from "semantic-ui-react";
import axios from "axios";

export const accordionPanelRow = ({ key, title, content }) => {
  return {
    key: `accordion-${key}`,
    content: {
      className: "p-0",
      content: content,
    },
    title: {
      key: `accordion-${key}-title`,
      as: Table.Row,
      icon: {
        key: `accordion-${key}-title-icon`,
        as: Table.Cell,
        content: (
          <>
            <Icon name={"dropdown"} />
            {title}
          </>
        ),
      },
      content: "",
    },
  };
};

export const toCSV = (objArray, filename) => {
  function convertToCSV(objArray) {
    var array = typeof objArray != "object" ? JSON.parse(objArray) : objArray;
    var str = "";
    // get header row values
    var header = Object.keys(array[0]);
    // get row values
    var row = "";
    for (var index in header) {
      row += header[index] + ",";
    }
    row = row.slice(0, -1);
    str += row + "\r\n";
    // get all values using header row
    for (var i = 0; i < array.length; i++) {
      var row = "";
      for (var index in header) {
        // check if the value contains a comma and replace it with an escape sequence
        var value = array[i][header[index]];
        // check if value is an array
        if (value instanceof Array) {
          // then, check if any values in the array have a comma
          for (var j = 0; j < value.length; j++) {
            if (JSON.stringify(value[j]).indexOf(",") > -1) {
              value[j] = value[j].replace(",", "");
            }
          }
        }
        row += `"${value}"` + ",";
      }
      row = row.slice(0, -1);
      str += row + "\r\n";
    }
    return str;
  }

  function exportCSVFile(items, filename, keys) {
    // Convert Object to JSON
    var jsonObject = JSON.stringify(items);

    var csv = convertToCSV(jsonObject);

    var exportedFilename = `${filename}.csv`;

    var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    if (navigator.msSaveBlob) {
      // IE 10+
      navigator.msSaveBlob(blob, exportedFilename);
    } else {
      var link = document.createElement("a");
      if (link.download !== undefined) {
        // feature detection
        // Browsers that support HTML5 download attribute
        var url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", exportedFilename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }

  exportCSVFile(objArray, filename);
};

export const getValues = (e, message) => {
  const k = Object.values(e);
  if (k.length > 0) {
    return k;
  } else {
    throw new Error("Empty Object", { cause: message });
  }
};

export const configReducer = (config) => {};

export const createContextFromEvent = (e) => {
  const left = e.clientX;
  const top = e.clientY;
  const right = left + 1;
  const bottom = top + 1;

  return {
    getBoundingClientRect: () => ({
      left,
      top,
      right,
      bottom,

      height: 0,
      width: 0,
    }),
  };
};

const eventReducer = (e) => {
  switch (e.target.type) {
    case "text":
      return e.target.value;
    case "checkbox":
      return e.target.checked;
  }
};

export const shuffleArray = (array) => {
  let shuffled = [...array]
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

  return shuffled;
};

/**
 * @param {Object[]} array
 * @param {string} key
 * @returns {Object[]}
 * @example
 * sortObjectArray([{ a: 1, b: 2 }, { a: 2, b: 1 }], "a");
 * // [{ a: 1, b: 2 }, { a: 2, b: 1 }]
 */
export const sortObjectArray = (array, key) => {
  return array.sort((a, b) => {
    if (a[key] < b[key]) {
      return -1;
    }
    if (a[key] > b[key]) {
      return 1;
    }
    return 0;
  });
};

// determine if the browser supports fullscreen and browser specific fullscreen element
const requestFullscreen = () => {
  const element = document.documentElement;
  if (element?.requestFullscreen) {
    element.requestFullscreen();
  } else if (element?.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element?.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if (element?.msRequestFullscreen) {
    element.msRequestFullscreen();
  } else {
    return false;
  }
};

const exitFullScreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  } else {
    return false;
  }
};

export const fullScreenEnabled = () => {
  if (
    document?.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement
  )
    return true;
  else return false;
};

export const toggleFullScreen = (elem) => {
  const inFullScreen = fullScreenEnabled();

  // Polyfill switch case for browsers that don't support fullscreen

  if (!inFullScreen) {
    elem ? elem?.requestFullscreen() : requestFullscreen();
  } else {
    exitFullScreen();
  }
};

export const getAudioFromUrl = ({ url, callback }) => {
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

// Rewrite the getAudioFromUrl above to use async await instead of callback
export const getAudioFromUrlAsync = async (url) => {
  // remove default axios authorization header in get request
  axios.defaults.headers["Authorization"] = "";

  const file = await axios
    .get(encodeURI(url), {
      responseType: "arraybuffer",
    })
    .then((response) => {
      // get file extension from headers content-type
      const filetype = response.headers["content-type"];
      // get file name from url
      const filename = url.split("/").pop();
      // create new file object with the file name and file extension
      return new File([response.data], filename, {
        type: filetype,
      });
    })
    .catch((error) => {
      console.log(error);
    });
  return file;
};

export default eventReducer;
