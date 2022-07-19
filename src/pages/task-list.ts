import { Task } from './../models/task';
import { Router } from "aurelia-router";
import { inject } from "aurelia-framework";

@inject(Router)
export abstract class TaskList {
  heading = "Todos";
  tasks: Task[] = [];
  todoDescription = '';
  router:Router
  user = ''
  readonly route: string;

  protected constructor(route: string,router: Router){
    this.route = route;
    this.router = router
  }

  abstract showMessage(): void

  addTodo(){
    // console.log(this.tasks); 
    if (this.todoDescription){
      this.tasks.push({
        id:getRandomInt(1,100),
        description: this.todoDescription,
        done: false
      })
      this.todoDescription = '';
      this.showMessage()
    }
  }

  removeTodo(todo:Task){
    let index = this.tasks.indexOf(todo);
    if(index !== -1){
      this.tasks.splice(index,1);
    }
  }
  
  /**
   * 
   * @param params 
   * @returns 
   */
  canActivate(): boolean {
    const username = sessionStorage.getItem('username')
    if(username){
      return true
    }else{
      this.router.navigateToRoute("userLogin");
      return false
    }
  }
  
  async activate(): Promise<void> {

    let username = sessionStorage.getItem('username')
    if(username!==null){
      this.user = username
    }

  
  }


}

/**
* Gets random int
* @param min 
* @param max 
* @returns random int - min & max inclusive
*/
function getRandomInt(min : number, max : number) : number{
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min; 
}
