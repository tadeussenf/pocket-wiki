import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {AddTagModalData, PocketItem, Tag} from "common/interfaces";
import {PocketService} from "./pocket.service";
import {MatDialog, MatPaginator} from "@angular/material";
import {AddTagsModalComponent} from "./add-tags-modal/add-tags-modal.component";
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
  pageIndex: number = 0;
  pageSize: number = 25;

  // todo search items

  constructor(public pocket: PocketService, public dialog: MatDialog) {
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

  // simpleDrop($event: Event) {
  //   console.log($event);
  // }

  showAddTagsModal(itemId: number, title: string, tags: string[]): void {
    let dialogRef = this.dialog.open(AddTagsModalComponent, {
      width: '500px',
      data: {
        itemId: itemId,
        title: title,
        tags: tags,
        allTags: this.tags
      }
    });

    dialogRef.afterClosed().subscribe((result: AddTagModalData) => {
      console.log(result);
      if (result) {
        this.pocket.addTags(result.itemId, result.tags);
      }
    });
  }

  updatePage($event: any) {
    this.pageIndex = $event.pageIndex;
    this.pageSize = $event.pageSize;
  }
}
