import { TaskList } from "./task-list";
import { useView } from 'aurelia-framework';
import { Router } from "aurelia-router";

@useView('./task-list.html')
export class DiapasonTaskList extends TaskList {
  showMessage(): void {
    alert('A task of diapason is added')
  }
  constructor(router:Router){
    super('All Tasks of Diapason',router);
  }
}
