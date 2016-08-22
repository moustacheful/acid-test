import React from 'react';
import { observer } from 'mobx-react';
import ChartJS from 'chart.js';

@observer
class Chart extends React.Component {
	constructor(){
		super()
		this.chartConfig = {
			type: 'line',
			data: {
				labels: [],
				datasets: [
					{
						label: 'Change over time',
						data: []
					}
				]
			},
			height: 150,
		};
	}

	componentDidMount(){
		this.chart = new ChartJS(this.canvas, this.chartConfig);
	}

	componentWillUnmount(){
		if(this.chart) this.chart.destroy();
	}

	render(){
		const data = this.props.data
		const chartData = this.chartConfig.data;
		chartData.labels =  _.map(data,'label')
		chartData.datasets[0].data = _.map(data,'value')
		if(this.chart) this.chart.update()
		
		return (
			<div className="chart">
				<canvas ref={ (r) => this.canvas = r } ></canvas>
			</div>
		)
	}
}

export default Chart;
