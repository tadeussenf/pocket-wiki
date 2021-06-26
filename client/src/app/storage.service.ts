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
    this.list = JSON.parse(localStorage.getItem("pocket-list")) || [];
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
    console.log("set list");
    this.setList(value);
  }

  setList(list: Item[]) {
    console.log("setList()");
    this._list = list;
    this.item$.next(this._list);
    localStorage.setItem("pocket-list", JSON.stringify(this._list));
  }

  get tags(): Tag[] {
    return this._tags;
  }

  set tags(value: Tag[]) {
    this.setTags(value);
  }

  setTags(tags: Tag[]) {
    this._tags = tags;
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

  importData(forceUpdate: boolean, list: Item[], tags: string[]) {
    // get item per tag count
    const tagsWithCount: Tag[] = tags.map(tag => ({
      name: tag,
      count: list.filter(item => item.customTags.includes(tag)).length
    }));

    let tagsToSort: Tag[];
    let listToSort: Item[];
    if (!forceUpdate) {
      console.log("merging partial data");
      this.mergePartialData(list, tagsWithCount);
      tagsToSort = this.tags;
      listToSort = this.list;
    } else {
      tagsToSort = tagsWithCount;
      listToSort = list;
    }

    this.tags = tagsToSort.sort((a, b) => b.count - a.count);
    this.list = listToSort.sort((a, b) => parseInt(b.time_added) - parseInt(a.time_added));
    this.filteredList = this.list;
  }

  private mergePartialData(inputList: Item[], inputTags: Tag[]) {
    console.log("merging items", inputList);
    inputList.forEach((item) => {
      const index = this.list.findIndex(existing => existing.item_id === item.item_id);

      if (parseInt(item.status) === 2) {
        if (this.list[index] && this.list[index].item_id === item.item_id) {
          this.deleteItemFromLocalDataCopy(item.item_id);
        } else {
          console.warn("unknown error case when deleting item with index", index, this.list[index]);
        }
      } else if (index >= 0) {
        this.list[index] = item;
      } else {
        this.list.push(item)
      }
    });

    inputTags.forEach((tag) => {
      const index = this.tags.findIndex(existing => existing.name === tag.name);
      if (index >= 0) {
        this.tags[index] = {
          name: tag.name,
          count: this.list.filter(item => item.customTags.includes(tag.name)).length
        }
      } else {
        this.tags.push({
          name: tag.name,
          count: this.list.filter(item => item.customTags.includes(tag.name)).length
        });
      }
    });
  }

  deleteItemFromLocalDataCopy(itemId: string) {
    const index = this.list.findIndex(existing => existing.item_id === itemId);
    console.log("deleting item with index", index, this.list[index]);

    this.list[index].customTags.forEach((tagName) => {
      const tag = this.tags.find(tag => tag.name === tagName);
      const index = this.tags.findIndex(tag => tag.name === tagName);
      if (tag.count === 1) {
        this.tags.splice(index, 1);
      } else {
        this.tags[index].count = tag.count - 1;
      }
    });

    this.list.splice(index, 1);
    this.setList(this.list);
  }
}
