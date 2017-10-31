///<reference path="../../node_modules/@angular/core/src/metadata/lifecycle_hooks.d.ts"/>
import {Component, OnInit} from '@angular/core';
import {Http, RequestOptionsArgs, Headers} from "@angular/http";
import * as _ from 'lodash';
import {AddTagModalData, Item, Tag} from "common/interfaces";
import {PocketService} from "./pocket.service";
import {MatDialog} from "@angular/material";
import {AddTagsModalComponent} from "./add-tags-modal/add-tags-modal.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  showSpinner: boolean = true;
  username: any;
  list: Item[] = [];
  filteredList: Item[] = [];
  tags: Tag[] = [];

  constructor(private pocket: PocketService, public dialog: MatDialog) {

  }

  ngOnInit(): void {
    this.pocket.getItemsSub().subscribe((items: Item[]) => {
      console.log("recieved items", items);
      this.filteredList = items;

      // todo use combineLatest
      this.pocket.getTagSub().subscribe((tags: Tag[]) => {
        console.log("recieved tags", tags);
        this.tags = tags;
        this.showSpinner = false;
      })
    });
  }

  public refreshData() {
    this.filteredList = [];
    this.tags = [];
    this.showSpinner = true;
    this.pocket.loadAllItems();

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
        tags: tags
      }
    });

    dialogRef.afterClosed().subscribe((result: AddTagModalData) => {
      if (result) {
        this.pocket.addTags(result.itemId, result.tags);
      }
    });
  }
}
