import { PLATFORM } from 'aurelia-pal';
import {RouterConfiguration, Router} from 'aurelia-router';
  
  export class App {
    router: Router;
  
    configureRouter(config: RouterConfiguration, router: Router): void {
      this.router = router;
      config.title = 'Diapason';
      config.options.pushState = true;
      config.options.root = '/';
      config.map([
        { 
          route: 'diapason',        
          title: 'Task of Diapason',      
          nav: true,
          moduleId: PLATFORM.moduleName('./pages/diapason','task') 
        },
        { 
          route: ['', 'personal'],        
          title: 'My Task',     
          name: 'myTask',     
          nav: true,
          moduleId: PLATFORM.moduleName('./pages/person','task') 
        },
        { 
          route: ['login'],        
          title: 'User Login',     
          name: 'userLogin',     
          nav: true,
          moduleId: PLATFORM.moduleName('./pages/login','task') 
        },
        { 
          route: ['requestTest'],        
          title: 'Test HTTP',     
          name: 'requestTest',     
          nav: true,
          moduleId: PLATFORM.moduleName('./pages/request/request-view','request') 
        },
        { 
          route: ['plat'],        
          title: 'Plat Info',     
          name: 'platInfo',     
          nav: true,
          moduleId: PLATFORM.moduleName('./pages/plat/plat','json') 
        },
        { 
          route: ['ace'],        
          title: 'Ace-Editor',     
          name: 'aceEditor',     
          nav: true,
          moduleId: PLATFORM.moduleName('./pages/ace/ace-input','ace') 
        },
        { 
          route: 'unknown',        
          redirect:''
        },
      ]);
    }
  }
  