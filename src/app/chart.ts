import embed, {Mode, VisualizationSpec} from 'vega-embed';
import { flatten } from 'lodash';

export interface Point2D {
  x: number;
  y: number;
}

export interface VisOptions {
  width?: number;
  height?: number;
  xLabel?: string;
  yLabel?: string;
  xType?: 'quantitative'|'ordinal'|'nominal';
  yType?: 'quantitative'|'ordinal'|'nominal';
  fontSize?: number;
  xAxisDomain?: [number, number];
  yAxisDomain?: [number, number];
  zoomToFit?: boolean;
}

export async function lineChart(
  container: HTMLElement,
  data: { values: Point2D[][], series: string[] },
  opts: VisOptions = {},
): Promise<void> {

  const values = flatten(data.values.map(
    (vals) => vals.map((v, idx) => ({ ...v, series: data.series[idx] }))
  ));

  const options: VisOptions = {
    xLabel: 'x',
    yLabel: 'y',
    xType: 'quantitative',
    yType: 'quantitative',
    zoomToFit: false,
    fontSize: 11,
    ...opts,
  };

  const encodings: any = {
    x: {
      field: 'x',
      type: options.xType,
      title: options.xLabel,
    },
    y: {
      field: 'y',
      type: options.yType,
      title: options.yLabel,
      // scale: { zero: false },
    },
    color: {
      field: 'series',
      type: 'nominal',
      legend: { values: data.series, orient: 'bottom', offset: 0 }
    },
  };

  const spec: VisualizationSpec = {

    width: options.width || container.clientWidth,
    height: options.height || container.clientHeight,
    padding: 0,
    autosize: {
      type: 'fit',
      contains: 'padding',
      resize: true,
    },
    config: {
      axis: {
        labelFontSize: options.fontSize,
        // titleFontSize: options.fontSize,
      },
      text: { fontSize: options.fontSize },
      legend: {
        labelFontSize: options.fontSize,
        titleFontSize: options.fontSize,
      }
    },
    data: { values },
    layer: [
      {
        // Render the main line chart
        mark: {
          type: 'line',
          clip: true,
        },
        encoding: encodings,
      },
      {
        // Render invisible points for all the the data to make selections
        // easier
        mark: { type: 'point' },
        // encoding: encodings,
        // If a custom domain is set, filter out the values that will not
        // fit we do this on the points and not the line so that the line
        // still appears clipped for values outside the domain but we can
        // still operate on an unclipped set of points.
        transform: undefined,
        selection: {
          nearestPoint: {
            type: 'single',
            on: 'mouseover',
            nearest: true,
            empty: 'none',
            encodings: ['x'],
          },
        },
        encoding: {
          ...encodings,
          opacity: {
            value: 0,
            condition: {
              selection: 'nearestPoint',
              value: 1,
            },
          },
        },
      },
      {
        // Render a tooltip where the selection is
        transform: [ { filter: { selection: 'nearestPoint' } } ],
        mark: {
          type: 'text',
          align: 'left',
          dx: 5,
          dy: -5,
          color: 'black',
        },
        encoding: {
          ...encodings,
          text: {
            type: options.xType,
            field: 'y',
            format: '.6f',
          },
          // Unset text color to improve readability
          color: undefined,
        },
      },
      {
        // Draw a vertical line where the selection is
        transform: [ { filter: { selection: 'nearestPoint' } } ],
        mark: { type: 'rule', color: 'gray' },
        encoding: {
          x: {
            type: options.xType,
            field: 'x',
          }
        }
      },
    ],
  };

  const embedOpts = {
    actions: false,
    mode: 'vega-lite' as Mode,
    defaultStyle: false,
  };

  await embed(container, spec, embedOpts);
}
