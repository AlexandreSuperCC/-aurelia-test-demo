import { bindable,customElement } from 'aurelia-framework';
import {NavModel} from 'aurelia-router'
import '../style/layout/nav-bar.css'


@customElement('cy-nav-bar')
export class NavBar {
  @bindable navigation: NavModel[] = [];

}

