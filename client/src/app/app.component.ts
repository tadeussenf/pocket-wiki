import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Tag} from "common/interfaces";
import {StateService} from "./state.service";
import {NotificationService} from "./notification.service";
import {Item} from "../common/Item";
import {debounceTime} from "rxjs/operators";
import {combineLatest} from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  showSpinner: boolean = true;
  username: string;
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

  async ngOnInit(): Promise<void> {
    await this.state.checkIsAuthenticated()

    combineLatest([this.state.allItems$, this.state.filteredItems$, this.state.tag$])
      .pipe(debounceTime(50))
      .subscribe(([allItems, filteredItems, tags]) => {
        this.list = allItems;
        this.filteredList = filteredItems;
        this.tags = tags;
        console.log("displaying items", filteredItems);
        console.log("displaying tags", tags);
        if (this.list && this.list.length > 0) {
          this.showSpinner = false;
        }
      });
  }

  async refreshData(forceUpdate: boolean) {
    this.filteredList = [];
    this.tags = [];
    this.showSpinner = true;
    await this.state.loadAllItems(forceUpdate);
  }

  filterByTag(tag: string) {
    this.state.filterByTag(tag);
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

      if (item.given_title) {
        return item.given_title.toLowerCase().includes(searchTerm.toLowerCase());
      } else if (item.resolved_title) {
        return item.resolved_title.toLowerCase().includes(searchTerm.toLowerCase());
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
