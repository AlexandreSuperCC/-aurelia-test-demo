const path = require('path');
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const project = require('./aurelia_project/aurelia.json');
const { AureliaPlugin } = require('aurelia-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
//add by ycao 20220721 put files into entry 
const glob = require('glob')

// config helpers:
const ensureArray = (config) => config && (Array.isArray(config) ? config : [config]) || [];
const when = (condition, config, negativeConfig) =>
  condition ? ensureArray(config) : ensureArray(negativeConfig);

// primary config:
const outDir = path.resolve(__dirname, project.platform.output);
const srcDir = path.resolve(__dirname, 'src');
const baseUrl = '/';

const cssRules = [
  {
    loader: 'css-loader'
  }
];


module.exports = ({ production }, { analyze, hmr, port, host }) => ({
  //add by ycao 20220720
  // watch:true,
  resolve: {
    //add by ycao 20220721
    extensions: ['.ts', '.js','.jsx','.tsx'],
    modules: [srcDir, 'node_modules'],

    alias: {
      // https://github.com/aurelia/dialog/issues/387
      // Uncomment next line if you had trouble to run aurelia-dialog on IE11
      // 'aurelia-dialog': path.resolve(__dirname, 'node_modules/aurelia-dialog/dist/umd/aurelia-dialog.js'),

      // https://github.com/aurelia/binding/issues/702
      // Enforce single aurelia-binding, to avoid v1/v2 duplication due to
      // out-of-date dependencies on 3rd party aurelia plugins
      'aurelia-binding': path.resolve(__dirname, 'node_modules/aurelia-binding')
    }
  },
  entry: {
    //add by ycao 20220716 app.ts will only contain business modules, this part doesn't change very often so client-side caching can be effectively used
    //suiv: webpack is not recommended entire folder, the entry value should resolve to a specific file, or a list of specific files.
    framwork: [
      "aurelia-bootstrapper",
      "ace-builds",  
      // attention! The following four dependences are not included in the "ace-builds" 
      'ace-builds/src-noconflict/theme-monokai',
      'ace-builds/src-noconflict/mode-javascript',
      'ace-builds/src-noconflict/ext-language_tools',
      'ace-builds/src-noconflict/ace.js',
    ],
    // login: './src/pages/login.ts',
    //no dependence modules are added here: 
    //pay attention, the file will exist again in the chunk made with app.ts, unless we change postion to split it in cachegroups
    // sources: glob.sync('./src/sources/*.json'),

  },
  mode: production ? 'production' : 'development',
  output: {
    path: outDir,
    publicPath: baseUrl,
    filename: production ? '[name].js' : '[name].js',
    chunkFilename: production ? '[name].chunk.js' : '[name].chunk.js',
    // add by ycao 20220726 change path for output asset
    assetModuleFilename: 'assets/[name][ext]'

  },
  // add by ycao 20220720
  optimization:{
    //take out the necessary files
    splitChunks:{
      // chunks: 'all',
      cacheGroups: {
        //issue!!! adding a directory before 'name' makes the production in browser not working, but it works when adding in entry
        jsonFile: {
          name: 'assets/json/jsonFile',
          test: /[\\/]src[\\/]sources[\\/]/,
          priority: 0,
          chunks:"all",
          enforce: true
        },
        'kendo-aurelia': {
          name: 'kendo-aurelia',
          test: /[\\/]node_modules[\\/]aurelia-kendoui-bridge[\\/]|[\\/]node_modules[\\/]@progress[\\/]kendo-ui[\\/]/,
          priority: 0,
          chunks:"all",
          enforce: true
        }
      }
    },
  },
  performance: { hints: false },
  devServer: {
    // serve index.html for all 404 (required for push-state)
    historyApiFallback: true,
    open: project.platform.open,
    hot: hmr || project.platform.hmr,
    port: port || project.platform.port,
    host: host,
    //add by ycao 20220721 solve cross-domain which is browser-intercepted action
    proxy: {
      '/api': {
           target: 'http://localhost:8080',
           router: () => 'http://localhost:8085',
           logLevel: 'debug' /*optional*/
      }
   }
  },
  //add by ycao 20220727 get map to debug
  // devtool: production ? undefined : 'cheap-module-source-map',
  devtool: production ? 'cheap-module-source-map' : 'cheap-module-source-map',
  module: {
    rules: [
      // CSS required in JS/TS files should use the style-loader that auto-injects it into the website
      // only when the issuer is a .js/.ts file, so the loaders are not applied inside html templates
      {
        test: /\.css$/i,
        issuer: { not: [/\.html$/i] },
        use: [{ loader: MiniCssExtractPlugin.loader }, ...cssRules]
      },
      {
        test: /\.css$/i,
        issuer: /\.html$/i,
        // CSS required in templates cannot be extracted safely
        // because Aurelia would try to require it again in runtime
        use: cssRules
      },
      // Skip minimize in production build to avoid complain on unescaped < such as
      // <span>${ c < 5 ? c : 'many' }</span>
      { test: /\.html$/i, loader: 'html-loader', options: { minimize: false } },//This is true by default in production mode.
      { test: /\.ts$/, loader: "ts-loader" },
      // embed small images and fonts as Data Urls and larger ones as files:
      { test: /\.(png|svg|jpg|jpeg|gif)$/i, type: 'asset' },
      { 
        test: /\.(woff|woff2|ttf|eot|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/i, 
        type: 'asset',
        // add by ycao 20220726 change path for output asset
        generator:{
          filename: 'assets/fonts/[hash][ext]'
        }
       },
      {
        test: /environment\.json$/i, use: [
          { loader: "app-settings-loader", options: { env: production ? 'production' : 'development' } },
        ]
      }
    ]
  },
  plugins: [
    new DuplicatePackageCheckerPlugin(),
    new AureliaPlugin(),
    //generate html files after webpack builds, and import the built entry js files into the generated html files
    new HtmlWebpackPlugin({
      template: 'index.ejs',
      metadata: {
        // available in index.ejs //
        baseUrl
      }
    }),
    // ref: https://webpack.js.org/plugins/mini-css-extract-plugin/
    new MiniCssExtractPlugin({ // updated to match the naming conventions for the js files
      //change by ycao 20220720 
      filename: production ? '[name].css' : '[name].css',
      chunkFilename: production ? '[name].chunk.css' : '[name].chunk.css'
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'static', to: outDir, globOptions: { ignore: ['.*'] } }
      ]
    }), // ignore dot (hidden) files
    ...when(analyze, new BundleAnalyzerPlugin()),
    /**
     * Note that the usage of following plugin cleans the webpack output directory before build.
     * In case you want to generate any file in the output path as a part of pre-build step, this plugin will likely
     * remove those before the webpack build. In that case consider disabling the plugin, and instead use something like
     * `del` (https://www.npmjs.com/package/del), or `rimraf` (https://www.npmjs.com/package/rimraf).
     */
    //add by ycao 20220721 remove licence
     new CleanWebpackPlugin({
      protectWebpackAssets: false,
      cleanAfterEveryBuildPatterns: ['*.LICENSE.txt'],
    }),
    //add by ycao 20220725 optimize webpack ace pollution in production
    // new webpack.NormalModuleReplacementPlugin(/^file-loader\?esModule=false!(.*)/, (res) => {
    //   res.request = res.request.replace(/^file-loader\?esModule=false!/, 'file-loader?esModule=false&outputPath=assets/js/ace-editor-modes!')
    // }),
  ]
});
