import _ from 'lodash';
import { observable, computed, default as mobx } from 'mobx';

class StockStore {
	@observable stockData = [];
	@observable status = {};
	@observable appState = {
		viewDetail: false
	};

	@computed get latest(){
		return _.map(_.groupBy(this.stockData,'symbol'), (group) => group[0] )
	}

	@computed get history(){
		return _.filter(this.stockData,{symbol:this.appState.viewDetail})
	}

	addData(data){
		this.stockData = [...this.stockData,...data]
	}

	setStatus(status){
		status.isClosed = (status.isClosed == true)
		this.status = status
	}
}

const store = new StockStore();
const socket = io.connect('/')
socket.on('status',function(data){
	store.setStatus(data)
})
socket.on('stocks:data',function(data){
	store.addData(data)
})
socket.on('message',function(data){
	console.log('Server says:',data)
})
export default store