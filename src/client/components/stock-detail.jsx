import React from 'react';
import { observer } from 'mobx-react';
import moment from 'moment';
import Chart from './chart.jsx'

@observer
class StockDetail extends React.Component {
	render(){
		const store = this.props.store;

		return (
			<div id="stock-detail" className={ store.appState.viewDetail ? 'stock-detail-visible' : 'stock-detail-hidden' }>
				
				<div onClick={this.close} className="close">
					<i className="fa fa-times"></i>
				</div>

				<div className="inner">				
					<h1>{ store.appState.viewDetail }</h1>
					<section>
						<Chart data={ this.getChartData(store.history) } />
					</section>
					<section>
						<table>
							<thead>
								<tr>
									<th>Time</th>
									<th>Change</th>
									<th>Change %</th>
									<th>Value</th>
								</tr>
							</thead>
							<tbody>
								{ store.history.reverse().map( (row,i) => 
									<tr className={row.change > 0 ? 'stock-up':'stock-down'} key={i}>
										<td>{moment.utc(row.date).format('DD/MM h:mm a')}</td>
										<td className="colorize">{row.change}</td>
										<td className="colorize">{row.changePercentage}%</td>
										<td>{row.current}</td>
									</tr>
								) }
							</tbody>
						</table>
					</section>
				</div>
			</div>
		)
	}

	getChartData(data){
		return _.map(data,(row) => {
			return {
				label:moment.utc(row.date).format('h:mm a'),
				value:row.current
			}
		})
	}

	close = () => {
		const store = this.props.store;
		store.appState.viewDetail = false
	}
}

export default StockDetail;
