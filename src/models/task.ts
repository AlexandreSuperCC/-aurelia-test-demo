export interface Task {
  /**
   * the task's unique id
   */
  id: number;

  /**
   * the description of the task
   */
  description: string;

  /**
   * if the task is done
   */
  done: boolean;
}
