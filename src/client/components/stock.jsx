import React from 'react';
import { observer } from 'mobx-react';

@observer
class Stock extends React.Component {
	componentDidMount(){
		setTimeout( () => this.assignAnimationClass())
	}
	componentDidUpdate(){
		setTimeout( () => this.assignAnimationClass())
	}
	render(){
		const stock = this.props.data;
		return (
			<div ref={ (r) => this.el = r } onClick={this.viewDetail} className={"stock " + (stock.change > 0 ? 'stock-up' : 'stock-down')}>
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

	assignAnimationClass(){
		if(this.el){
			this.el.className = this.el.className.replace(' animate','')
			setTimeout( () => {
				this.el.className += ' animate' 
			}, 10)
		}
	}

	viewDetail = () => {
		const stock = this.props.data;
		const handler = this.props.clickHandler;
		handler(stock.symbol);
	}
}

export default Stock;

