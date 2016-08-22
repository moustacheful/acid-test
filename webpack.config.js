const webpack = require('webpack')
const path = require('path')

console.log(__dirname)
module.exports = {
	entry: './src/client/index.jsx',
	output: { path: __dirname + '/dist/client/', filename: 'bundle.js' },
	plugins: [
		new webpack.optimize.UglifyJsPlugin({
			minimize: true,
			compress: true
		})
	],
	module: {
		loaders: [,
			{
				test: /.js?$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				query: {
					presets: ['es2015'],
					plugins: ["transform-decorators-legacy","transform-object-rest-spread", "transform-class-properties"]
				}
			},
			{
				test: /.jsx?$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				query: {
					presets: ['es2015', 'react'],
					plugins: ["transform-decorators-legacy","transform-object-rest-spread", "transform-class-properties"]
				}
			},
			{
				test: /\.styl$/,
				loader: 'style-loader!css-loader!stylus-loader'
			}
		]
	}
}