import { useView,inject } from 'aurelia-framework';
import { Router } from "aurelia-router";

@useView('./login.html')
@inject(Router)
export class Login {
  router: Router;
  constructor(router:Router){
    this.router = router;
  }

  private username = ''
  private password = ''

  login(){
    console.log(this.username+this.password)
    if(this.username==='ycao'&&this.password==='0423'){
      this.cacheUser(this.username)
      this.router.navigateToRoute("myTask");
    }
    else{
      alert('login fails')
    }
  }
  logout(){
    sessionStorage.removeItem('username')
  }
  get canLogin(): boolean{
    if(this.username&&this.password&&this.username!==''&&this.password!==''){
      return true
    }else{
      return false
    }
  }

  get isLogin(): boolean{
    return sessionStorage.getItem('username')!==null
  }

  cacheUser(data:string) {
    sessionStorage.setItem("username", data);
  }

}
