import _ from 'lodash';
import { observable, computed, default as mobx } from 'mobx';

class StockStore {
	@observable stockData = [];
	@observable status = {};
	@observable appState = {
		viewDetail: false
	};

	@computed get latest(){
		return _.map(_.groupBy(this.stockData,'symbol'), (group) => _.last(group) )
	}

	@computed get history(){
		return _.filter(this.stockData,{symbol:this.appState.viewDetail})
	}

	addData(data){
		this.stockData = [...this.stockData,...data]
	}

	setStatus(status){

		status.isClosed = (status.isClosed == "true")
		this.status = status
	}
}

const store = new StockStore();
const socket = io.connect('/')

socket.once('message', (data) => console.log('Server says:',data) )
socket.once('stocks:history', (data) => store.addData(data) )
socket.on('status', (data) => store.setStatus(data) )
socket.on('stocks:data', (data) => store.addData(data) )

export default store