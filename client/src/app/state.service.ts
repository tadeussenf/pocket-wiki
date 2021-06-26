import {Injectable} from "@angular/core";
import {Item} from "../common/Item";
import {PocketService} from "./pocket.service";
import {ReplaySubject, zip} from "rxjs";
import {StorageService} from "./storage.service";
import {Tag} from "../common/interfaces";

@Injectable()
export class StateService {
  private list: Item[];
  private tags: Tag[];
  private filteredItems: Item[];

  allItems$ = new ReplaySubject<Item[]>(1);
  filteredItems$ = new ReplaySubject<Item[]>(1);
  tag$ = new ReplaySubject<Tag[]>(1);
  private isFirstRun = true;

  constructor(
    private pocket: PocketService,
    private storage: StorageService,
  ) {
    console.log("init");
    zip(
      this.storage.getItem$(),
      this.storage.getTag$()
    ).subscribe(async ([items, tags]) => {
        this.list = items;
        this.tags = tags;

        if (this.isFirstRun) {
          this.isFirstRun = false;
          await this.loadAllItems(!this.list || this.list.length === 0)
        } else {
          this.allItems$.next(this.list);
          this.tag$.next(this.tags);
          this.filterNotArchived(); // default
        }
      }
    );
  }

  addTags(itemId: string, tags: string[]) {
    this.pocket.addTags(itemId, tags);
  }

  async deleteItem(itemId: string) {
    if (!window.confirm('Are you sure?')) {
      return;
    }

    await this.pocket.deleteItem(itemId)
  }

  async archiveItem(itemId: string) {
    await this.pocket.archiveItem(itemId)
  }

  showItemsForTag(tag: string) {
    console.log("showItemsForTag", tag);
    this.filteredItems = this.list.filter(item => item.customTags.includes(tag));

    console.log("filteredList", this.filteredItems);
    this.filteredItems$.next(this.filteredItems);
  }

  filterByDate(days: number) {
    console.log("filterByDate", days);
    if (days === 0) {
      this.filteredItems = this.list;
    } else {
      const range = (Date.now() / 1000) - (days * 24 * 60 * 60);
      this.filteredItems = this.list.filter(item => parseInt(item.time_added) > range)
    }

    console.log("filteredList", this.filteredItems);
    this.filteredItems$.next(this.filteredItems);
  }

  filterNotArchived() {
    console.log("filterNotArchived");
    this.filteredItems = this.list.filter(e => e.status === "0");
    console.log("filteredList", this.filteredItems);
    this.filteredItems$.next(this.filteredItems);
  }

  filterArchived() {
    console.log("filterArchived");
    this.filteredItems = this.list.filter(e => e.status === "1");
    console.log("filteredList", this.filteredItems);
    this.filteredItems$.next(this.filteredItems);
  }

  filterNoTags() {
    console.log("filterNoTags");
    this.filteredItems = this.list.filter(item => item.customTags.length === 0);

    console.log("filteredList", this.filteredItems);
    this.filteredItems$.next(this.filteredItems);
  }

  resetFilter() {
    this.filteredItems = this.list;
    this.filteredItems$.next(this.list);
  }

  async loadAllItems(forceUpdate: boolean) {
    await this.pocket.loadAllItems(forceUpdate);
  }

  async checkIsAuthenticated() {
    if (!this.pocket.isAuthenticated()) {
      await this.pocket.authenticateWithPocket();
    }
  }
}
