import React from 'react';
import { observer } from 'mobx-react';
import Stock from './stock.jsx'
import StatusDisplay from './status-display.jsx';
import StockTicker from './stock-ticker.jsx';
import StockDetail from './stock-detail.jsx';

@observer
class StocksApp extends React.Component {
	render(){
		const store = this.props.store;

		return (
			<div className="stocks-app">
				<StatusDisplay data={store.status} />
				<StockTicker store={store} />
				{store.appState.viewDetail ?  <StockDetail store={store} />: ''}
			</div>
		)
	}
}

export default StocksApp;
