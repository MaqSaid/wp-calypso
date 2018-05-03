/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { range, random } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import LineChart from 'components/line-chart';

const NUM_DATA_SERIES = 3;

class LineChartExample extends Component {
	static displayName = 'LineChart';

	static createData( dataMin, dataMax, seriesLength ) {
		return range( NUM_DATA_SERIES ).map( () => {
			return range( seriesLength ).map( e => {
				const date = new Date();
				date.setDate( date.getDate() - ( seriesLength - e ) );
				return {
					date: date.getTime(),
					value: random( dataMin, dataMax ),
				};
			} );
		} );
	}

	state = {
		dataMin: 1,
		dataMax: 50,
		seriesLength: 10,
		showDataControls: false,
		data: LineChartExample.createData( 1, 50, 10 ),
		yAxisMode: 'absolute',
		fillArea: false,
	};

	handleDataMinChange = event => {
		const newMin = event.target.value;
		this.setState( {
			dataMin: newMin,
			data: LineChartExample.createData( newMin, this.state.dataMax, this.state.seriesLength ),
		} );
	};

	handleDataMaxChange = event => {
		const newMax = event.target.value;
		this.setState( {
			dataMax: event.target.value,
			data: LineChartExample.createData( this.state.dataMin, newMax, this.state.seriesLength ),
		} );
	};

	handleSeriesLengthChange = event => {
		const newSeriesLength = event.target.value;
		this.setState( {
			seriesLength: newSeriesLength,
			data: LineChartExample.createData( this.state.dataMin, this.state.dataMax, newSeriesLength ),
		} );
	};

	handleShowDataControlsToggle = () => {
		this.setState( {
			showDataControls: ! this.state.showDataControls,
		} );
	};

	handleFillAreaToggle = () => {
		this.setState( {
			fillArea: ! this.state.fillArea,
		} );
	};

	handleYAxisModeToggle = () => {
		this.setState( {
			yAxisMode: this.state.yAxisMode === 'absolute' ? 'relative' : 'absolute',
		} );
	};

	render() {
		return (
			<div>
				<a className="docs__design-toggle button" onClick={ this.handleShowDataControlsToggle }>
					{ this.state.showDataControls ? 'Hide Data Controls' : 'Show Data Controls' }
				</a>
				<Card>
					<LineChart
						data={ this.state.data }
						yAxisMode={ this.state.yAxisMode }
						fillArea={ this.state.fillArea }
					/>
				</Card>
				{ this.state.showDataControls && (
					<div>
						<label>Data Min</label>
						<input
							type="number"
							value={ this.state.dataMin }
							min={ 0 }
							onChange={ this.handleDataMinChange }
						/>
						<label>Data Max</label>
						<input
							type="number"
							value={ this.state.dataMax }
							min={ 0 }
							onChange={ this.handleDataMaxChange }
						/>
						<label>Series Length</label>
						<input
							type="number"
							value={ this.state.seriesLength }
							min={ 3 }
							onChange={ this.handleSeriesLengthChange }
						/>
						<div>
							<label>Fill Area</label>
							<input
								type="checkbox"
								checked={ this.state.fillArea }
								onChange={ this.handleFillAreaToggle }
							/>
						</div>
						<div>
							<label>Absolute Y Axis</label>
							<input
								type="checkbox"
								checked={ this.state.yAxisMode === 'absolute' }
								onChange={ this.handleYAxisModeToggle }
							/>
						</div>
					</div>
				) }
			</div>
		);
	}
}

export default LineChartExample;
