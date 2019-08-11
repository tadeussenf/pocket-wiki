import {Injectable} from "@angular/core";
import * as _ from "lodash";
import {Item} from "../common/Item";
import {PocketService} from "./pocket.service";
import {combineLatest, ReplaySubject} from "rxjs";
import {NotificationService} from "./notification.service";
import {StorageService} from "./storage.service";
import {Tag} from "../common/interfaces";

@Injectable()
export class StateService {
  private list: Item[];
  private tags: Tag[];
  private filteredList: Item[];
  filteredList$ = new ReplaySubject<Item[]>(1);
  tag$ = new ReplaySubject<Tag[]>(1);

  constructor(
    private pocket: PocketService,
    private storage: StorageService,
    private msg: NotificationService
  ) {

    combineLatest(
      this.storage.getItem$(),
      this.storage.getTag$()
    ).subscribe(([items, tags]) => {
        this.list = items;
        this.tags = tags;

        this.filteredList$.next(this.list);
        this.tag$.next(this.tags);
        this.filteredList = this.list;
      }
    );
  }

  addTags(itemId: string, tags: string[]) {
    this.pocket.addTags(itemId, tags);
  }

  deleteItem(itemId) {
    this.pocket.deleteItem(itemId)
  }

  showItemsForTag(tag: string) {
    console.log("showItemsForTag", tag);
    this.filteredList = _.filter(this.list, (item: Item) => {
      return item.customTags.includes(tag);
    });

    console.log("emit filteredList", this.filteredList);
    this.filteredList$.next(this.filteredList);
  }

  filterByDate(days: number) {
    console.log("filterByDate", days);
    if (days === 0) {
      this.filteredList = this.list;
    } else {
      const range = (Date.now() / 1000) - (days * 24 * 60 * 60);
      this.filteredList = _.filter(this.list, (item: Item) => {
        return parseInt(item.time_added) > range;
      })
    }

    console.log("emit filteredList", this.filteredList);
    this.filteredList$.next(this.filteredList);
  }

  filterNoTags() {
    console.log("filterNoTags");
    this.filteredList = _.filter(this.list, (item: Item) => {
      return item.customTags.length === 0;
    });

    console.log("emit filteredList", this.filteredList);
    this.filteredList$.next(this.filteredList);
  }

  simpleDrop($event: Event) {
    console.log($event);
  }

  resetFilter() {
    this.filteredList = this.list;
    this.filteredList$.next(this.list);
  }

  loadAllItems(forceUpdate: boolean) {
    this.pocket.loadAllItems(forceUpdate);
  }
}
