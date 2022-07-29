var webpack = require('webpack');
const path = require('path')
var ExtractTextPlugin = require("extract-text-webpack-plugin");

//默认插件集合
var getDefaultPlugins = function(){
    var plugins = [];

    plugins.push(new webpack.DefinePlugin({'process.env.NODE_ENV':'"production"'}));
    plugins.push(new webpack.DefinePlugin({'process.env': {
        YYLIB_ENV: JSON.stringify(process.env.NODE_ENV)
    }}));

    //打包成一个style样式
    plugins.push(new ExtractTextPlugin("/build/[name].css"));

    plugins.push(new webpack.optimize.DedupePlugin());

    return plugins;
};
//默认加载器集合
var getDefaultLoaders = function(){
    var imageFileName = '/build/[name].[ext]';
    var fontFileName = '/build/[name].[ext]?[hash]';
    var loaders = [
        // 在这里添加 react-hot，注意这里使用的是loaders，所以不能用 query，应该把presets参数写在 babel 的后面
        {test: /\.(js|jsx)?$/,exclude:/node_modules/,loaders: ['react-hot-loader/webpack','babel?compact=false,presets[]=react,presets[]=es2015,presets[]=stage-0']},
        {test: /\.css$/,loader: ExtractTextPlugin.extract("style-loader","css-loader")}, //"style-loader!css-loader"
        {test: /\.less$/, loader: ExtractTextPlugin.extract("style-loader","css-loader!less-loader")},
        {test: /\.json$/,loader:'json-loader'},
        // {test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'}, // inline base64 URLs for <=8k images, direct URLs for the rest
        {test: /\.(png|jpg|gif)$/,loader: 'file-loader?name='+imageFileName},
        {test: /\.(ttf\??|eot\??|svg\??|woff\??|woff2\??)/, loader: "file-loader?name="+fontFileName}
    ];
    return loaders;
};
//默认的外部依赖不需要打包进bundle，直接在html页面通过script标签引入,key：npm模块名，value：window全局变量名
var getDefaultExternals = function() {
    var _default = {
        "jquery": "jQuery",//var $ = require('jquery');编译后为：var $ = window.jQuery;
        "echarts":"echarts"
    };
    return _default;
}
module.exports = {
  mode: 'production',
  entry: './index.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'index.js',
    libraryTarget: 'commonjs2',
    publicPath: '/apps/',//服务端的路径
    chunkFilename: "/dist/[name]_[hash].chunk.js"
  },
  externals: getDefaultExternals(),
  module: {
    loaders: getDefaultLoaders()
  },
  plugins: getDefaultPlugins()
}