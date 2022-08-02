import { Table, Button, Icon } from "semantic-ui-react";
import React, { useState } from "react";

const UserTable = (props) => {
  const { users, callback, label, btnColor, btns, extra } = props;
  const [rowsSelected, selectRow] = useState(users.map((user) => false));

  const selectAll = (e) => {
    e.preventDefault();

    rowsSelected.every((row) => row)
      ? selectRow(users.map((user) => false))
      : selectRow(users.map((user) => true));
  };

  const headerRow = () => (
    <Table.Row>
      <Table.HeaderCell colSpan="2">
        {btns &&
          btns.map((btn, b) => (
            <Button
              key={`button-${b}`}
              {...btn.props}
              onClick={(e) => {
                btn.props.onClick(users.filter((e, i) => rowsSelected[i]));
              }}
              disabled={!callback || rowsSelected.length === 0}
            />
          ))}
        {!btns && (
          <Button
            disabled={!users.length}
            floated="right"
            color={btnColor ?? ""}
            onClick={(e) => {
              e.preventDefault();
              callback(users.filter((e, i) => rowsSelected[i]));
            }}
          >
            {label ?? "Handle Data"}
          </Button>
        )}

        <Button role="button" floated="left" onClick={selectAll}>
          Select All
        </Button>
        {extra && extra}
      </Table.HeaderCell>
    </Table.Row>
  );

  const handleSelection = (e, i) => {
    e.preventDefault();
    const oldRows = [...rowsSelected];
    oldRows.splice(i, 1, !rowsSelected[i]);

    selectRow(oldRows);
  };

  const renderBodyRow = ({ id, username }, i) => ({
    link: true,
    key: id,
    onClick: (e) => handleSelection(e, i),
    cells: [id || "No name specified", username || "Unknown"],
    active: rowsSelected[i],
    style: { cursor: "pointer" },
  });

  return (
    <Table
      selectable
      unstackable
      headerRow={callback && headerRow}
      renderBodyRow={renderBodyRow}
      tableData={users}
    />
  );
};

export default UserTable;
