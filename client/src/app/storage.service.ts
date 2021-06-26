import {Injectable} from "@angular/core";
import {Item} from "../common/Item";
import {PocketConfig, Tag} from "../common/interfaces";
import {Observable, ReplaySubject} from "rxjs";
import {NotificationService} from "./notification.service";
import {environment} from "../environments/environment";

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
    this.tags = JSON.parse(localStorage.getItem("pocket-tags")) || [];
    const rawList = JSON.parse(localStorage.getItem("pocket-list")) || [];
    if (rawList) {
      this.list = rawList.filter(e => e.status === "0");
    }
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

  getPocketAuthData(): PocketConfig {
    return {
      ...JSON.parse(localStorage.getItem("pocket-config")),
      ...{
        consumerKey: environment.pocketConsumerKey,
        apiUrl: environment.pocketApiUrl,
        redirectUrl: environment.redirectUrl,
        headers: {
          "Content-Type": "application/json",
          "X-Accept": "application/json"
        }
      }
    }
  }

  setPocketConfig(config: PocketConfig) {
    localStorage.setItem("pocket-config", JSON.stringify(config));
  }

  removePocketConfig() {
    localStorage.removeItem("pocket-config");
  }
}
