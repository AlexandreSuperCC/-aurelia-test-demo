import {Aurelia} from 'aurelia-framework';
import environment from '../config/environment.json';
import {PLATFORM} from 'aurelia-pal';

/* kendo-aurelia add by ycao 20220725*/
//load all Kendo controls.
import '@progress/kendo-ui/js/kendo.all';
//Load css
import '@progress/kendo-ui/css/web/kendo.common.min.css';
import '@progress/kendo-ui/css/web/kendo.bootstrap.min.css';
// import '@progress/kendo-ui/css/web/kendo.default.min.css';
// import '@progress/kendo-ui/css/web/kendo.common.core.min.css';
/* kendo-aurelia */


export function configure(aurelia: Aurelia): void {
  aurelia.use
    .standardConfiguration()
    .feature(PLATFORM.moduleName('resources/index'))
    // add by ycao 20220725 kendo-aurelia 
    .plugin(PLATFORM.moduleName('aurelia-kendoui-bridge'));



  aurelia.use.developmentLogging(environment.debug ? 'debug' : 'warn');

  if (environment.testing) {
    aurelia.use.plugin(PLATFORM.moduleName('aurelia-testing'));
  }

  aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName('app')));
}
