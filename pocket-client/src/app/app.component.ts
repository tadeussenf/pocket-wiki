import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {AddTagModalData, PocketItem, Tag} from "common/interfaces";
import {PocketService} from "./pocket.service";
import "rxjs/add/operator/debounceTime";
import "rxjs/add/observable/combineLatest";
import {Observable} from "rxjs/Observable";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  showSpinner: boolean = true;
  username: any;
  list: PocketItem[] = [];
  filteredList: PocketItem[] = [];
  tags: Tag[] = [];
  loadingMessage: string = "Loading";

  constructor(public pocket: PocketService) {
    console.log("constructor done");
  }

  ngOnInit(): void {
    Observable.combineLatest(this.pocket.getItemsSub(), this.pocket.getTagSub())
      .debounceTime(50)
      .subscribe((values: any) => {
        let [items, tags] = values;
        this.filteredList = items;
        this.tags = tags;
        console.log("recieved items", items);
        console.log("recieved tags", tags);
        this.showSpinner = false;
      });
  }

  public refreshData(forceUpdate: boolean) {
    this.filteredList = [];
    this.tags = [];
    this.showSpinner = true;
    this.pocket.loadAllItems(forceUpdate);

  }

  filterByTag(tag: string) {
    this.pocket.showItemsForTag(tag);
  }

  resetFilter() {
    this.pocket.resetFilter();
  }

  filterByDate(days: number) {
    this.pocket.filterByDate(days);
  }

  filterNoTags() {
    this.pocket.filterNoTags();
  }

  onTagsAdded(data: AddTagModalData) {
    this.pocket.addTags(data.itemId, data.tags);
  }

  // simpleDrop($event: Event) {
  //   console.log($event);
  // }

  onSearchSubmit(searchTermin: string) {
    console.log("search for", searchTermin);
    // TODO implement me
  }
}
