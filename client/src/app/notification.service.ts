import { Injectable } from '@angular/core';
import {Observable, ReplaySubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  msg$ = new ReplaySubject<string>(1);

  constructor() { }

  send(msg: string){
    this.msg$.next(msg);
  }

  getSubject(): Observable<string> {
    return this.msg$.asObservable()
  }
}
