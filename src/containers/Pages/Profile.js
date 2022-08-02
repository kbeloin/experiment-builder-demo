import React, { useEffect, useCallback, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { Table, Dimmer, Icon, Accordion, Tab, Loader } from "semantic-ui-react";
import { getCompletedMDLS } from "../../store/actions/completedModules";
import { getCompletedEXPS } from "../../store/actions/completedExperiments";
import { accordionPanelRow } from "../../components/utility";

import Hoc from "../../hoc/hoc";

const groupedExperiments = (experiments) => {
  const grouped = {};
  experiments.forEach(
    ({ id, experiment, completed, experiment_name, participant }) => {
      if (!grouped[experiment]) {
        grouped[experiment] = {
          id: experiment,
          name: experiment_name,
          attempts: [],
        };
      }
      grouped[experiment].attempts.push({
        id,
        completed,
        participant,
      });
    }
  );
  return grouped;
};
//  by participant takes in the already grouped experiments and returns a new object with the participants as keys and the experiments as values
const byParticipant = (experiments) => {
  const grouped = {};
  experiments.forEach(({ id, completed, participant }) => {
    if (!grouped[participant]) {
      grouped[participant] = {
        id: participant,
        attempts: [],
      };
    }
    grouped[participant].attempts.push({
      id,
      completed,
    });
  });
  return grouped;
};

const useUserProfile = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const username = useSelector((state) => state.auth.username);
  const is_moderator = useSelector((state) => state.auth.is_moderator);
  const completedModules = useSelector(
    (state) => state.completedModules.modules
  );
  const completedExperimentsLoading = useSelector(
    (state) => state.completedExperiments.loading
  );

  const completedExperiments = useSelector(
    (state) => state.completedExperiments.experiments
  );

  const getCompletedModules = useCallback(
    (expId, callback) => {
      if (token !== undefined && token !== null) {
        dispatch(getCompletedMDLS(username, token, expId ?? "", callback));
      }
    },
    [completedModules]
  );

  useEffect(() => {
    if (token !== undefined && token !== null) {
      console.log("getting completed exps");
      dispatch(getCompletedEXPS(token, null, null, true));
    }
  }, [dispatch]);

  return {
    token,
    username,
    completedModules,
    completedExperiments,
    completedExperimentsLoading,
    is_moderator,
  };
};

const CompletedExperimentTable = ({ tableData, headerRow, i }) => {
  const [expanded, setExpanded] = useState(false);
  const [modulesVisible, setModulesVisible] = useState({});
  const [modules, setModules] = useState({});
  const token = useSelector((state) => state.auth.token);
  const username = useSelector((state) => state.auth.username);
  const is_moderator = useSelector((state) => state.auth.is_moderator);
  const dispatch = useDispatch();

  const callback = (newModules, i, name, id) => {
    let newModule = {
      ...modules,
      [name]: {
        ...modules[name],
        [id]: { ...modules[name]?.[id], [i]: newModules },
      },
    };
    setModules(newModule);
  };

  const handleClick = (id, e, i, name) => {
    if (modulesVisible?.[name]?.[id]?.[i]) {
      console.log("closing");
      setModulesVisible({
        ...modulesVisible,
        [name]: {
          [id]: {
            [i]: false,
          },
        },
      });
      setModules({
        ...modules,
        [name]: { ...modules[name], [id]: { [i]: [] } },
      });
    } else {
      dispatch(
        getCompletedMDLS(
          username,
          token,
          id ?? "",
          (modules) => callback(modules, i, name, id),
          is_moderator ? true : false
        )
      );
      setModulesVisible({
        ...modulesVisible,
        [name]: {
          [id]: {
            [i]: true,
          },
        },
      });
    }
  };

  //  toggle visible when modules are loaded

  return (
    // For each participant
    <Table
      key={`exp-sub-${i}`}
      structured
      selectable
      tableData={byParticipant(tableData)}
      renderBodyRow={({ id, attempts }, i) => ({
        key: `attempt-${id}`,
        cells: [
          () => {
            const name = id;
            return [
              <>
                {expanded && (
                  <Table.Cell key={`${name}-modules`} width={13}>
                    <Table celled structured>
                      <Table.Header>
                        <Table.Row link>
                          <Table.HeaderCell>{name}</Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {attempts.map(({ id, completed }, i) => {
                          return (
                            <Table celled structured style={{ margin: "0" }}>
                              <Table.Header
                                onClick={(e) => handleClick(id, e, i, name)}
                                class={"p-0"}
                              >
                                <Table.Row>
                                  <Table.HeaderCell>
                                    Experiment Attempt {i + 1}
                                  </Table.HeaderCell>
                                  <Table.HeaderCell>
                                    {completed ? "Completed" : "Incomplete"}
                                  </Table.HeaderCell>
                                </Table.Row>
                              </Table.Header>
                              {modulesVisible[name] && modules[name]?.[id] && (
                                <Table.Body>
                                  {modulesVisible[name][id] &&
                                    modules[name][id][i] && (
                                      <>
                                        {modules[name][id][i].map((module) => (
                                          <Table.Row key={`${id}-${module.id}`}>
                                            <Table.Cell>
                                              {id} {module.id}
                                            </Table.Cell>
                                            <Table.Cell>
                                              {module.progress.is_completed
                                                ? "Completed"
                                                : "Incomplete"}
                                            </Table.Cell>
                                          </Table.Row>
                                        ))}
                                      </>
                                    )}
                                </Table.Body>
                              )}
                            </Table>
                          );
                        })}
                      </Table.Body>
                    </Table>
                  </Table.Cell>
                )}
              </>,
              ,
            ];
          },
          ,
        ],
      })}
      headerRow={{
        key: `header-${i}`,
        cells: headerRow,
        onClick: () => setExpanded(!expanded),
      }}
    />
  );
};

const renderBodyRow = ({ id, name, attempts }, i) => {
  // get total number of attempts
  const totalAttempts = attempts.length;
  const completedAttempts = attempts.filter((item) => item.completed);

  // header row includes a download button for all participant attempts
  const headerRow = [
    {
      content: (
        <Table.Header>
          <Table.Cell>{`${name} ${completedAttempts.length}/${totalAttempts}`}</Table.Cell>
          <Table.Cell>
            <Icon link name="download"></Icon>
          </Table.Cell>
        </Table.Header>
      ),
      width: "13",
    },
  ];

  return {
    key: `experiment-row-${i}-${id}` || `row-${i}`,
    class: `experiment-row-${i}-${id}` || `row-${i}`,
    cells: [
      <CompletedExperimentTable
        key={`exp-${id}`}
        tableData={attempts}
        headerRow={headerRow}
        i={i}
      />,
    ],
    cellAs: Table.Row,
  };
};

const Profile = () => {
  const {
    token,
    username,
    completedModules,
    completedExperiments,
    getCompletedModules,
    completedExperimentsLoading,
    is_moderator,
  } = useUserProfile();

  return (
    <Hoc>
      {completedExperimentsLoading ? (
        <Dimmer active>
          <Loader>Loading Attempts...</Loader>
        </Dimmer>
      ) : (
        <Hoc>
          <Tab
            key="profile"
            panes={[
              {
                menuItem: "Your Profile",
                render: () => (
                  <Tab.Pane>
                    <h1>Hi {username}</h1>
                    <Accordion
                      key={`accordion-experiments`}
                      structured
                      as={Table}
                      defaultActiveIndex={[0]}
                      panels={[
                        accordionPanelRow({
                          key: "experiments",
                          title: "Completed Experiments",
                          content: (
                            <Table
                              key={`exp-table`}
                              structured
                              tableData={groupedExperiments(
                                completedExperiments
                              )}
                              renderBodyRow={renderBodyRow}
                              columns={1}
                            />
                          ),
                        }),
                      ]}
                      exclusive={false}
                    />
                  </Tab.Pane>
                ),
              },
            ]}
          />
        </Hoc>
      )}
    </Hoc>
  );
};

export default Profile;
