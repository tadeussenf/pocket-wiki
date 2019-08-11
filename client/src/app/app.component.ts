import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {PocketItem, Tag} from "common/interfaces";
import {StateService} from "./state.service";
import "rxjs/add/operator/debounceTime";
import "rxjs/add/observable/combineLatest";
import {Observable} from "rxjs";
import {NotificationService} from "./notification.service";
import {Item} from "../common/Item";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  showSpinner: boolean = true;
  username: any;
  list: Item[] = [];
  filteredList: Item[] = [];
  tags: Tag[] = [];
  filteredTags: Tag[];
  loadingMessage: string = "Loading";
  searchTerm: string;
  screenWidth: number;
  showSidebar: boolean = true;

  constructor(
    public state: StateService,
    public msg: NotificationService
  ) {
    this.registerResponsiveHandlers()
  }

  ngOnInit(): void {
    Observable.combineLatest(this.state.filteredList$, this.state.tag$)
      .debounceTime(50)
      .subscribe(([items, tags]) => {
        this.list = items;
        this.filteredList = items;
        this.tags = tags;
        console.log("displaying items", items);
        console.log("displaying tags", tags);
        if (this.list && this.list.length > 0) {
          this.showSpinner = false;
        }
      });
  }

  public refreshData(forceUpdate: boolean) {
    this.filteredList = [];
    this.tags = [];
    this.showSpinner = true;
    this.state.loadAllItems(forceUpdate);

  }

  filterByTag(tag: string) {
    this.state.showItemsForTag(tag);
  }

  resetFilter() {
    this.state.resetFilter();
  }

  filterByDate(days: number) {
    this.state.filterByDate(days);
  }

  filterNoTags() {
    this.state.filterNoTags();
  }

  onSearchSubmit(searchTerm: string) {
    if (!searchTerm || searchTerm.length === 0) {
      this.searchTerm = searchTerm;
      this.filteredList = this.list;
      return;
    }

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

  private registerResponsiveHandlers() {
    this.screenWidth = window.innerWidth;
    this.showSidebar = this.screenWidth > 840;
    window.onresize = () => {
      this.screenWidth = window.innerWidth;
      this.showSidebar = this.screenWidth > 840;
    };
  }
}
