import * as React from 'react';
import { FunctionComponent, Fragment } from 'react';
import * as Case from 'case';

import { IPrediction } from '../../type';

import './PredictionLegend.scss';

interface IPredictionLegendProps {
  predictions: IPrediction[];
  colours: string[];
}

export const PredictionLegend: FunctionComponent<IPredictionLegendProps> = (props) => (
  <div className="prediction-legend">
    {
      props.predictions.map((prediction, index) => (
        <PredictionLegendRow
          key={prediction.class}
          class={prediction.class}
          score={prediction.score}
          colour={props.colours[index]}
        />
      ))
    }
  </div>
)

interface IPredictionLegendRowProps {
  class: string;
  score: string;
  colour: string;
}

const PredictionLegendRow: FunctionComponent<IPredictionLegendRowProps> = (props) => {
  return (
    <Fragment>
      <div
        className="prediction-legend-colour"
        style={{
          backgroundColor: props.colour
        }}
      />
      <span className="prediction-legend-class">{Case.title(props.class)}</span>
      <span className="prediction-legend-score">{props.score}%</span>
    </Fragment>
  );
};
