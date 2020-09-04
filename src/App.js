import React from "react";
import "./styles.css";
import {
  CssBaseline,
  Container,
  Slider,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@material-ui/core";

import { scaleBand, scaleLinear } from "d3-scale";
import { interpolateWarm } from "d3-scale-chromatic";
import { extent, min, max, mean } from "d3-array";
import { TEMP_DATA } from "./mocks.js";

const TEMP_MIN = 16; // degree celsius
const TEMP_MAX = 40; // degree celsius

export default function App() {
  const [temperature, setTemperature] = React.useState(22);

  function handleSliderChange(event, value) {
    setTemperature(value);
  }

  return (
    <>
      <CssBaseline />
      <Container fluid="sm">
        <Typography variant="h4" style={{ paddingTop: 16 }}>
          Termostato ({temperature}°)
        </Typography>

        <Slider
          valueLabelDisplay="auto"
          onChange={handleSliderChange}
          value={temperature}
          min={TEMP_MIN}
          max={TEMP_MAX}
        />

        <Typography variant="h5" gutterBottom>
          Consumi previsti
        </Typography>

        <TemperatureChart />

        <div style={{ height: 16 }} />

        <TemperatureTable temperature={temperature} />
      </Container>
    </>
  );
}

function TemperatureTable({ temperature }) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Range temperature</TableCell>
            <TableCell align="right">Minimo</TableCell>
            <TableCell align="right">Massimo</TableCell>
            <TableCell align="right">Media</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TemperatureTableRow temperature={temperature} delta={1} />
          <TemperatureTableRow temperature={temperature} delta={2} />
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function TemperatureTableRow({ temperature, delta }) {
  const rangeMin = temperature - delta;
  const rangeMax = temperature + delta;

  const leftIndex =
    ((rangeMin - TEMP_MIN) / (TEMP_MAX - TEMP_MIN)) * TEMP_DATA.length;
  const rightIndex =
    ((rangeMax - TEMP_MIN) / (TEMP_MAX - TEMP_MIN)) * TEMP_DATA.length;

  const data = TEMP_DATA.slice(
    Math.max(0, Math.floor(leftIndex)),
    Math.min(TEMP_DATA.length, Math.ceil(rightIndex))
  );

  return (
    <TableRow>
      <TableCell>
        {rangeMin}–{rangeMax}°
      </TableCell>
      <TableCell align="right">{min(data)}kW</TableCell>
      <TableCell align="right">{max(data)}kW</TableCell>
      <TableCell align="right">{mean(data).toFixed(2)}kW</TableCell>
    </TableRow>
  );
}

const TemperatureChart = React.memo(function TemperatureChart() {
  const ref = React.useRef();

  const width = useOffsetWidth(ref);

  return (
    <div style={{ overflow: "hidden" }} ref={ref}>
      {width && <TemperatureChartBars width={width} height={120} />}
    </div>
  );
});
//const TemperatureChartBarsMemo= React.memo(TemperatureChartBars);

function TemperatureChartBars({ width, height }) {
  const xDomain = React.useMemo(() => {
    const indices = new Array(TEMP_DATA.length);
    for (let i = 0, l = indices.length; i < l; ++i) {
      indices[i] = i;
    }
    return indices;
  }, []);

  const yDomain = extent(TEMP_DATA);

  console.log(yDomain);

  const xScale = scaleBand()
    .paddingInner(0)
    .domain(xDomain)
    .range([0, width - 0]);

  const yScale = scaleLinear()
    .domain(yDomain)
    .range([0, height - 0]);

  return (
    <svg
      style={{
        display: "block",
        background: "#333",
        boxSizing: "border-box",
        borderRadius: 4,
        overflow: "hidden"
      }}
      width={width}
      height={height}
    >
      {TEMP_DATA.map((value, index) => {
        const h = yScale(value);
        return (
          <rect
            key={index}
            width={xScale.bandwidth()}
            x={xScale(index)}
            height={h}
            y={height - 0 - h}
            shapeRendering="crispEdges"
            fill={interpolateWarm(
              (value - yDomain[0]) / (yDomain[1] - yDomain[0])
            )}
          />
        );
      })}
    </svg>
  );
}

function useOffsetWidth(ref) {
  const [width, setWidth] = React.useState(null);

  React.useLayoutEffect(() => {
    const node = ref.current;
    let ignore = false;
    let rafId = null;

    tick();

    function tick() {
      if (!ignore) {
        rafId = requestAnimationFrame(tick);
        setWidth(Math.round(node.offsetWidth));
      }
    }

    return () => {
      ignore = true;
      if (rafId != null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [ref]);

  return width;
}
