import React from 'react';
import { render } from 'react-dom';
import store from './store';
import StocksApp from './components/stocks-app.jsx';
import './styles/main.styl'
import ChartJS from 'chart.js';

ChartJS.defaults.global.defaultFontFamily = "'Roboto Condensed','Arial'"
ChartJS.defaults.global.defaultFontSize = 11;
ChartJS.defaults.global.maintainAspectRatio = false;
render(
	<div id="app">
		<StocksApp store={store} />
	</div>,
	document.getElementById('root')
);