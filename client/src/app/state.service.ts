import {Injectable} from "@angular/core";
import {Item} from "../common/Item";
import {PocketService} from "./pocket.service";
import {combineLatest, ReplaySubject} from "rxjs";
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
  private isFirstRun = true;

  constructor(
    private pocket: PocketService,
    private storage: StorageService,
  ) {
    combineLatest([
      this.storage.getItem$(),
      this.storage.getTag$()
    ]).subscribe(async ([items, tags]) => {
        this.allItems = items;
        this.tags = tags;

        if (this.isFirstRun) {
          this.isFirstRun = false;
          await this.loadAllItems(!this.allItems || this.allItems.length === 0)
        } else {
          this.allItems$.next(this.allItems);
          this.filteredItems$.next(this.allItems);
          this.tag$.next(this.tags);
          this.filteredItems = this.allItems;
        }
      }
    );
  }

  addTags(itemId: string, tags: string[]) {
    this.pocket.addTags(itemId, tags);
  }

  deleteItem(itemId: string) {
    if (!window.confirm('Are you sure?')) {
      return;
    }

    this.pocket.deleteItem(itemId)
  }

  archiveItem(itemId: string) {
    this.pocket.archiveItem(itemId)
  }

  showItemsForTag(tag: string) {
    console.log("showItemsForTag", tag);
    this.filteredItems = this.allItems.filter(item => item.customTags.includes(tag));

    console.log("filteredList", this.filteredItems);
    this.filteredItems$.next(this.filteredItems);
  }

  filterByDate(days: number) {
    console.log("filterByDate", days);
    if (days === 0) {
      this.filteredItems = this.allItems;
    } else {
      const range = (Date.now() / 1000) - (days * 24 * 60 * 60);
      this.filteredItems = this.allItems.filter(item => parseInt(item.time_added) > range)
    }

    console.log("filteredList", this.filteredItems);
    this.filteredItems$.next(this.filteredItems);
  }

  filterNoTags() {
    console.log("filterNoTags");
    this.filteredItems = this.allItems.filter(item => item.customTags.length === 0);

    console.log("filteredList", this.filteredItems);
    this.filteredItems$.next(this.filteredItems);
  }

  resetFilter() {
    this.filteredItems = this.allItems;
    this.filteredItems$.next(this.allItems);
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
