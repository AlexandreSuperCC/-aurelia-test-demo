import {
    bindable,
    customElement
} from 'aurelia-framework';
import { Plat } from 'models/plat';
import '../style/component/plat.css'

@customElement('cy-plat-item')
export class PlatItem{
    @bindable plat: Plat
}