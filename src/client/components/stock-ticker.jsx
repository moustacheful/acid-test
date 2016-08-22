import React from 'react';
import { observer } from 'mobx-react';
import Stock from './stock.jsx'

@observer
class StockTicker extends React.Component {
	render(){
		const latest = this.props.store.latest
		const appState = this.props.store.appState
		return (
			<div className="stock-ticker">
				{ latest.map( (stock,i) => 
					<Stock clickHandler={this.viewDetail} data={stock} key={i} />
				) }
			</div>
		)
	}

	viewDetail = (symbol) =>{
		var appState = this.props.store.appState
		appState.viewDetail = symbol
	}
}

export default StockTicker;
