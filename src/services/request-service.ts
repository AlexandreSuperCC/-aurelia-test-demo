import { rejects } from 'assert';
import {HttpClient} from 'aurelia-fetch-client';
import { resolve } from 'path';

export class RequestService{
    httpClient: HttpClient

    constructor(){
        this.httpClient = new HttpClient().configure(x=>{
            // x.withBaseUrl('http://127.0.0.1:8085/')//use proxy so this can be omitted
        })
      }

      public async getFetch(url:string): Promise<any> {
        return new Promise((resolve,rejects)=>{
            this.httpClient.fetch(url, {
                method: "GET",
            }).then(res => {
                resolve(res.json())
            }).catch(err => {
                rejects(err)
            })
        })
      }
}