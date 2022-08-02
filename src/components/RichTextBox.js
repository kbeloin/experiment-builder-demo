import React from "react";
import { useQuill } from "react-quilljs";
import { Form, Button, Icon, Checkbox, Segment } from "semantic-ui-react";
import { processMap } from "./Data/processes";
import "quill/dist/quill.snow.css";
import AudioModal from "./Modals/AudioModal";

const formats = [
  "header",
  "font",
  "background",
  "color",
  "code",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "script",
  "align",
  "direction",
  "link",
  "image",
  "code-block",
  "formula",
  "audio",
  "video",
  "chart",
];

const visKey = {
  audio: "pitch",
};
// Settings are passed to the Quill editor instance on Blot creation.
// key is the name of the setting, and value is a callback to be passed to Quill.
const elementSettingsMap = {
  autoplay: (node) => node.setAttribute("autoplay", true),
  // remove controls
  controls: (node) => node.removeAttribute("controls"),
  disableAfterPlaying: (node) => {
    // check if onended attribute is already set and conactenate with new value
    const onended = node.getAttribute("onended")
      ? `${node.getAttribute("onended")}`
      : "";
    node.setAttribute("onended", `${onended}this.style.pointerEvents="none"`);
  },
  awaitEnded: (node) => {
    // check if onplay attribute is already set and conactenate with new value
    const onplay = node.getAttribute("onplay")
      ? `${node.getAttribute("onplay")}`
      : "";
    node.setAttribute(
      "onplay",
      `${onplay}document.querySelector("body").style.pointerEvents = "none";`
    );
    // when element starts playing, disable input on the page
    const onended = node.getAttribute("onended")
      ? `${node.getAttribute("onended")}`
      : "";
    // when element ends playing, enable input on the page
    // concat ";" to existing onended attribute
    node.setAttribute(
      "onended",
      `${onended}document.querySelector("body").style.pointerEvents = "auto";`
    );
  },
};

const RichTextBox = (props) => {
  const {
    handleChange,
    handleFileUpload,
    handleFileChange,
    title,
    uniqueId,
    handleEmbed,
  } = props;

  const { quill, quillRef, Quill } = useQuill({
    modules: {
      toolbar: `#toolbar-${uniqueId}`,
    },
    formats: formats, // Important
  });

  if (Quill && !quill) {
    // For execute this line only once.
    const BlockEmbed = Quill.import("blots/block/embed");
    class AudioBlot extends BlockEmbed {
      static create({ url, elementSettings }) {
        let node = super.create();
        node.setAttribute("src", url);
        node.setAttribute("style", "display: block");
        node.setAttribute("controls", "true");
        var settingsArray = [];
        if (elementSettings) {
          Object.entries(elementSettings).forEach(([key, value]) => {
            const settingKey = value.title;
            if (value.value) {
              // push to array
              settingsArray = [
                ...settingsArray,
                { title: settingKey, value: value.value },
              ];
              elementSettingsMap[settingKey](node);
            }
          });
          // set data attribute to store settings
          node.setAttribute("data-settings", JSON.stringify(settingsArray));
        }

        return node;
      }

      static value(node) {
        // These are the settings that are stored in the data-settings attribute
        // Allows quill to read the settings from the node in between state updates
        const url = node.getAttribute("src");
        const settings = node.getAttribute("data-settings");
        const elementSettings = JSON.parse(settings);

        //
        return { url, elementSettings };
      }
    }

    AudioBlot.blotName = "audio";
    AudioBlot.tagName = "audio";
    Quill.debug(false);
    // suppress warnings
    Quill.register(AudioBlot);

    class AudioChartBlot extends BlockEmbed {
      static create({ url }) {
        let node = super.create();
        node.setAttribute("src", url);
        node.setAttribute("class", "ui segment");
        node.setAttribute("style", "width: 100%; height: auto");

        // set the attributes of the node

        return node;
      }

      static value(node) {
        const url = node.getAttribute("src");
        return { url };
      }
    }

    AudioChartBlot.blotName = "chart";
    AudioChartBlot.tagName = "img";
    Quill.debug(false);
    Quill.register(AudioChartBlot);
  }

  const getQuillFromProps = (quill) => {
    quill.clipboard.dangerouslyPasteHTML(title ?? "");
  };

  const insertToEditor = (res, filetype, settings) => {
    quill.focus();
    const range = quill.getSelection();
    quill.insertEmbed(range.index, filetype, {
      url: res.url,
      elementSettings: settings,
    });

    if (res.fileId) {
      handleFileChange && handleFileChange(res.fileId);
      handleChange(quill.root.innerHTML);
    } else {
      handleEmbed({ embed: res.url, instructions: quill.root.innerHTML });
    }
  };

  React.useEffect(() => {
    if (quill) {
      if (title !== undefined) {
        getQuillFromProps(quill);
      }
      quill.on("text-change", (delta, oldDelta, source) => {
        handleChange(quill.root.innerHTML);
      });
    }
  }, [quill]);

  return (
    <Form.Field>
      <div id={`toolbar-${uniqueId}`}>
        <select className="ql-header">
          <option value="1" />
          <option />
          <option value="2" />
          <option value="3" />
          <option value="4" selected />
        </select>
        <span class="ql-formats">
          <Button className="ql-bold" />
          <Button className="ql-italic" />
          <Button className="ql-underline" />
          <Button className="ql-script" value="sub" />
          <Button className="ql-script" value="super" />
        </span>
        <select class="ql-align">
          <option selected />
          <option value="right" />
          <option value="center" />
          <option value="justify" />
        </select>
        <span class="ql-formats">
          <button type="button" className="ql-link">
            <svg viewBox="0 0 18 18">
              {" "}
              <line class="ql-stroke" x1="7" x2="11" y1="7" y2="11"></line>{" "}
              <path
                class="ql-even ql-stroke"
                d="M8.9,4.577a3.476,3.476,0,0,1,.36,4.679A3.476,3.476,0,0,1,4.577,8.9C3.185,7.5,2.035,6.4,4.217,4.217S7.5,3.185,8.9,4.577Z"
              ></path>{" "}
              <path
                class="ql-even ql-stroke"
                d="M13.423,9.1a3.476,3.476,0,0,0-4.679-.36,3.476,3.476,0,0,0,.36,4.679c1.392,1.392,2.5,2.542,4.679.36S14.815,10.5,13.423,9.1Z"
              ></path>{" "}
            </svg>
          </button>
          <button type="button" className="ql-image">
            <svg viewBox="0 0 18 18">
              {" "}
              <rect class="ql-stroke" height="10" width="12"></rect>{" "}
              <circle class="ql-fill" cx="6" cy="6" r="3"></circle>{" "}
            </svg>
          </button>
          <button type="button" class="ql-video">
            <svg viewBox="0 0 18 18">
              {" "}
              <rect
                class="ql-stroke"
                height="12"
                width="12"
                x="3"
                y="3"
              ></rect>{" "}
              <rect class="ql-fill" height="12" width="1" x="5" y="3"></rect>{" "}
              <rect class="ql-fill" height="12" width="1" x="12" y="3"></rect>{" "}
              <rect class="ql-fill" height="2" width="8" x="5" y="8"></rect>{" "}
              <rect class="ql-fill" height="1" width="3" x="3" y="5"></rect>{" "}
              <rect class="ql-fill" height="1" width="3" x="3" y="7"></rect>{" "}
              <rect class="ql-fill" height="1" width="3" x="3" y="10"></rect>{" "}
              <rect class="ql-fill" height="1" width="3" x="3" y="12"></rect>{" "}
              <rect class="ql-fill" height="1" width="3" x="12" y="5"></rect>{" "}
              <rect class="ql-fill" height="1" width="3" x="12" y="7"></rect>{" "}
              <rect class="ql-fill" height="1" width="3" x="12" y="10"></rect>{" "}
              <rect class="ql-fill" height="1" width="3" x="12" y="12"></rect>{" "}
            </svg>
          </button>
        </span>
        <span class="ql-formats">
          {quill && (
            <AudioModal
              callback={insertToEditor}
              handleFileUpload={handleFileUpload}
              handleEmbed={handleEmbed}
            />
          )}
        </span>
      </div>
      <div ref={quillRef} />
    </Form.Field>
  );
};

export default RichTextBox;
