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
  private allItems: Item[];
  private tags: Tag[];
  private filteredItems: Item[];

  allItems$ = new ReplaySubject<Item[]>(1);
  filteredItems$ = new ReplaySubject<Item[]>(1);
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
        this.allItems = items;
        this.tags = tags;

        this.allItems$.next(this.allItems);
        this.filteredItems$.next(this.allItems);
        this.tag$.next(this.tags);
        this.filteredItems = this.allItems;
      }
    );
  }

  addTags(itemId: string, tags: string[]) {
    this.pocket.addTags(itemId, tags);
  }

  deleteItem(itemId: string) {
    if (!window.confirm('Are you sure?'))
      return;
    
    this.pocket.deleteItem(itemId)
  }

  archiveItem(itemId: string) {
    this.pocket.archiveItem(itemId)
  }

  showItemsForTag(tag: string) {
    console.log("showItemsForTag", tag);
    this.filteredItems = _.filter(this.allItems, (item: Item) => {
      return item.customTags.includes(tag);
    });

    console.log("emit filteredList", this.filteredItems);
    this.filteredItems$.next(this.filteredItems);
  }

  filterByDate(days: number) {
    console.log("filterByDate", days);
    if (days === 0) {
      this.filteredItems = this.allItems;
    } else {
      const range = (Date.now() / 1000) - (days * 24 * 60 * 60);
      this.filteredItems = _.filter(this.allItems, (item: Item) => {
        return parseInt(item.time_added) > range;
      })
    }

    console.log("emit filteredList", this.filteredItems);
    this.filteredItems$.next(this.filteredItems);
  }

  filterNoTags() {
    console.log("filterNoTags");
    this.filteredItems = _.filter(this.allItems, (item: Item) => {
      return item.customTags.length === 0;
    });

    console.log("emit filteredList", this.filteredItems);
    this.filteredItems$.next(this.filteredItems);
  }

  simpleDrop($event: Event) {
    console.log($event);
  }

  resetFilter() {
    this.filteredItems = this.allItems;
    this.filteredItems$.next(this.allItems);
  }

  loadAllItems(forceUpdate: boolean) {
    this.pocket.loadAllItems(forceUpdate);
  }
}
