import React from 'react';
import { observer } from 'mobx-react';

@observer
class Stock extends React.Component {
	render(){
		const stock = this.props.data;
		return (
			<div onClick={this.viewDetail} className={"stock " + (stock.change > 0 ? 'stock-up':'stock-down')}>
				<div className="inner">
					<div className="content">
						<h2>{stock.symbol}</h2>
						<h3>{stock.current}</h3> 
						<h4>
							<i className={ 'fa ' + (stock.change > 0 ? 'fa-angle-up' : 'fa-angle-down') }></i>
							{stock.change} / {stock.changePercentage}%
						</h4>
					</div>
				</div>
			</div>
		)
	}

	viewDetail = () => {
		const stock = this.props.data;
		const handler = this.props.clickHandler;
		handler(stock.symbol);
	}
}

export default Stock;

