import { Table, Button, Icon } from "semantic-ui-react";
import React, { useState } from "react";
import { configInputReducer } from "./tableReducers";

const ConfigTable = (props) => {
  const { config, initial, callback } = props;

  const renderCell = ({ input, name, options }) =>
    configInputReducer({
      input: input,
      callback: callback,
      initial: initial[name] ?? null,
      name: name,
      options: options,
    });

  const renderBodyRow = (
    { text, name, description, input, options, disabled },
    i
  ) => ({
    key: name,
    disabled: disabled,
    cells: [
      text || "No name specified",
      description || "Unknown",
      { content: renderCell({ input, name, options }) },
    ],
  });

  return (
    <Table
      selectable
      headerRow={["Name", "Description", "Value"]}
      renderBodyRow={renderBodyRow}
      tableData={config}
    />
  );
};

export default ConfigTable;
