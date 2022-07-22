import { Plat } from 'models/plat'
import staticJson from '../../sources/plat-info.json'
// import * as staticJson from '../../sources/plat-info.json'
export class PlatInfo{

    plats: Plat[] = []

    constructor(){
        this.plats = staticJson.data
    }


}