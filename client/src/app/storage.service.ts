import {Injectable} from "@angular/core";
import {Item} from "../common/Item";
import {PocketItem, Tag} from "../common/interfaces";
import {Observable, ReplaySubject} from "rxjs";
import {NotificationService} from "./notification.service";

@Injectable({
  providedIn: "root"
})
export class StorageService {
  private _list: Item[] = [];
  filteredList: Item[];
  private _tags: Tag[] = [];

  // observable stuff
  item$ = new ReplaySubject<Item[]>(1);
  tag$ = new ReplaySubject<Tag[]>(1);

  constructor(
    private msg: NotificationService
  ) {
    this.tags = JSON.parse(localStorage.getItem("pocket-tags"));
    this.list = JSON.parse(localStorage.getItem("pocket-list")).filter(function (e) {
      return e.status !== '1';
    });
  }

  getItem$(): Observable<Item[]> {
    return this.item$.asObservable();
  }

  getTag$(): Observable<Tag[]> {
    return this.tag$.asObservable()
  }

  get list(): Item[] {
    return this._list;
  }

  set list(value: Item[]) {
    this._list = value;
    this.item$.next(this._list);
    localStorage.setItem("pocket-list", JSON.stringify(this._list));
  }

  get tags(): Tag[] {
    return this._tags;
  }

  set tags(value: Tag[]) {
    this._tags = value;
    this.tag$.next(this._tags);
    localStorage.setItem("pocket-tags", JSON.stringify(this._tags));
  }
}
