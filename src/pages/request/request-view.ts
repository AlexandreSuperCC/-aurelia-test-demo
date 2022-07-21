import { useView,autoinject } from 'aurelia-framework';
import { Router } from "aurelia-router";
import { RequestService } from 'services/request-service';

@useView('./request-view.html')
@autoinject()
export class RequestView {
  private readonly requestService : RequestService;

  router: Router

  constructor(router:Router,requestService:RequestService){
    this.router = router
    this.requestService = requestService
  }

  message = ''

  getMessageFromServer(){
    this.requestService.getFetch("api/test/msg").then(data=>{
      this.message = data.msg
    })
  }

}
