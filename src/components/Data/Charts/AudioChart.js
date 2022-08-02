import React, { useState, useEffect, useRef, useCallback } from "react";
import { Chart, registerables } from "chart.js";

const getPitchScatterData = (processedData) => {
  let data = processedData?.x_y ?? [];
  for (let i = 0; i < data.length; i++) {
    if (data[i]["x"] === 0) {
      data[i]["x"] = NaN;
    }
    if (data[i]["y"] === 0) {
      data[i]["y"] = NaN;
    }
  }

  return data;
};

export const PitchChart = (props) => {
  Chart.register(...registerables);
  const chartRef = useRef();
  const { callback, reset } = props;
  const [data, setData] = useState(getPitchScatterData(JSON.parse(props.data)));
  const [chart, setChart] = useState(null);
  // state for current chart

  const createChart = () => {
    const ctx = chartRef.current.getContext("2d");

    const myChart = new Chart(ctx, {
      type: "scatter",
      data: {
        datasets: [
          {
            label: "Pitch Frequency",
            data: data,
            borderWidth: 1,
            backgroundColor: "rgb(255, 99, 132)",
          },
        ],
      },
      options: {
        bezierCurve: false,
        animation: {
          onComplete: callback ?? console.info("No call back for chart"),
        },
        scales: {
          y: {},
          x: {},
        },
      },
    });
    setChart(myChart);
  };

  useEffect(() => {
    console.log("PitchChart create useEffect");
    if (!chart) {
      createChart();
    }
  }, [data]);

  useEffect(() => {
    if (chart) {
      chart.destroy();
      console.log("re-rendering chart");
      setChart(null);
      setData(getPitchScatterData(JSON.parse(props.data)));
    }
  }, [props.data]);

  return (
    <canvas
      id="question-data"
      ref={chartRef}
      width="470px"
      height="350px"
      maxWidth="470px"
      maxHeight="350px"
    ></canvas>
  );
};

export default PitchChart;
