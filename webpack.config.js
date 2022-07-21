const path = require('path');
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
      "aurelia-animator-css",
      "aurelia-bootstrapper",
      "aurelia-fetch-client",
      "aurelia-http-client",
      "bootstrap",
      // "glob",
      "jquery",
    ],
    //business modules are added here:
    login: './src/pages/login.ts',
    task: [
      './src/pages/task-list.ts',
      './src/pages/diapason.ts',
      './src/pages/person.ts',
      './src/models/task.ts',
    ],
    'components': glob.sync('./src/components/*.ts'),
    'services/request-service': './src/services/request-service.ts'
  },
  mode: production ? 'production' : 'development',
  output: {
    path: outDir,
    publicPath: baseUrl,
    filename: production ? '[name].js' : '[name].js',
    chunkFilename: production ? '[name].[chunkhash].chunk.js' : '[name].[fullhash].chunk.js'
  },
  // add by ycao 20220720
  optimization:{
    //take out the necessary files
    splitChunks:{
      cacheGroups: {
        //issue!!! adding a directory before 'name' makes the production in browser not working, but it works when adding in entry
        
        //framework modules can also be splitted here:
        // framework: {
        //   name: 'framework',
        //   test: /[\\/]node_modules[\\/]/,
        //   priority: -10,//A larger value indicates that this scheme is preferred when extracting modules. Default value is 0
        //   chunks:"all",//The value 'initial' indicates how many times xxx is loaded asynchronously or synchronously in the project, then how many times the module xxx will be extracted and packaged into different files. The core-js library is loaded into every file in the project, so it will be extracted multiple times.
        //   enforce: true
        // },
        // services: {
        //   name: 'services',
        //   test: /[\\/]src[\\/]services[\\/]/,
        //   priority: 0,
        //   chunks:"all",
        //   enforce: true
        // },
        // bootstrap: {
        //   name: 'bootstrap',
        //   test: /[\\/]node_modules[\\/]bootstrap[\\/]/,
        //   priority: 0,
        //   chunks:"all",
        //   enforce: true
        // },
        // jquery: {
        //   name: 'jquery',
        //   test: /[\\/]node_modules[\\/]jquery[\\/]/,
        //   priority: 0,
        //   chunks:"all",
        //   enforce: true
        // },
        // aureliaFetchClient: {
        //   name: 'aurelia-fetch-client',
        //   test: /[\\/]node_modules[\\/]aurelia-fetch-client[\\/]/,
        //   priority: 0,
        //   chunks:"all",
        //   enforce: true
        // },
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
  devtool: production ? undefined : 'cheap-module-source-map',
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
      { test: /\.html$/i, loader: 'html-loader', options: { minimize: false } },
      { test: /\.ts$/, loader: "ts-loader" },
      // embed small images and fonts as Data Urls and larger ones as files:
      { test: /\.(png|svg|jpg|jpeg|gif)$/i, type: 'asset' },
      { test: /\.(woff|woff2|ttf|eot|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/i, type: 'asset' },
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
      chunkFilename: production ? '[name].[contenthash].chunk.css' : '[name].[fullhash].chunk.css'
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
  ]
});
