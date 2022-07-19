import { TaskList } from "./task-list";
import { useView } from 'aurelia-framework';
import { Router } from "aurelia-router";

@useView('./task-list.html')
export class PersonalTaskList extends TaskList {
  showMessage(): void {
    alert('A personal task is added')
  }
  constructor(router:Router){
    super('All My Tasks',router);
  }
}
