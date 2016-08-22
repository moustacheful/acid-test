import React from 'react';
import { observer } from 'mobx-react';
import moment from 'moment';

@observer
class StatusDisplay extends React.Component{
	render(){
		const status = this.props.data;
		var errorMessage = '';

		if(status.error){
			errorMessage = <div className="status-bar status-error">
				{status.error}
			</div>
		}

		var marketStatus = <div className="status-market">
			<i className="fa fa-info-circle"></i>
			<strong>Market is OPEN!</strong>
		</div>; 

		if( status.isClosed ){
			marketStatus = <div className="status-market">
				<i className="fa fa-info-circle"></i>
				<strong className="closed">Market is CLOSED | </strong> Last data received: {moment(status.lastDataTime).format('DD/MM h:mm a')}
			</div>
		}

		return (
			<div id="status-display">
				<div className="status-bar status-health">
					<i className={status.health=='ok'?'fa fa-check-circle':'fa fa-warning'}></i> 
					<span className="status-last-fetch"><strong>Last fetch at</strong>: { moment(status.lastFetch).format('DD/MM h:mm a') } (local time)</span>
					{ marketStatus }
				</div>
				{errorMessage}

			</div>
		)
	}
}

export default StatusDisplay;