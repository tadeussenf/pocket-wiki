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
  filteredTags: Tag[];
  loadingMessage: string = "Loading";
  searchTerm: string;

  constructor(public pocket: PocketService) {
    console.log("constructor done");
  }

  ngOnInit(): void {
    Observable.combineLatest(this.pocket.getItemsSub(), this.pocket.getTagSub())
      .debounceTime(50)
      .subscribe((values: any) => {
        let [items, tags] = values;
        this.list = items;
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

  onSearchSubmit(searchTerm: string) {
    this.filteredTags = this.tags.filter(tag => tag.name.toLowerCase() === searchTerm.toLowerCase());
    this.filteredList = this.list.filter(item => {

      if (item.resolved_title) {
        return item.resolved_title.toLowerCase().includes(searchTerm.toLowerCase());
      } else {
        return item.given_title.toLowerCase().includes(searchTerm.toLowerCase());
      }
    });
    this.searchTerm = searchTerm;
  }

  onSearchReset() {
    delete this.searchTerm;
    this.filteredTags = this.tags;
    this.filteredList = this.list
  }
}
