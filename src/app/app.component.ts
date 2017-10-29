///<reference path="../../node_modules/@angular/core/src/metadata/lifecycle_hooks.d.ts"/>
import {Component, OnInit} from '@angular/core';
import {Http, RequestOptionsArgs, Headers} from "@angular/http";
import * as _ from 'lodash';
import {AddTagModalData, Item} from "common/interfaces";
import {PocketService} from "./pocket.service";
import {MatDialog} from "@angular/material";
import {AddTagsModalComponent} from "./add-tags-modal/add-tags-modal.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  showSpinner: boolean = false;
  username: any;
  list: Item[] = [];
  filteredList: Item[];
  tags: { name: any; count: number }[];

  constructor(private pocket: PocketService, public dialog: MatDialog) {

  }

  ngOnInit(): void {
    this.loadData()
  }

  public refresh() {
    this.filteredList = [];
    this.tags = [];
    this.showSpinner = true;
    this.pocket.loadAllItems();
    this.loadData();
    this.showSpinner = false;

  }

  filterByTag(tag: string) {
    this.pocket.showItemsForTag(tag);
    this.loadData();
  }

  resetFilter() {
    this.pocket.resetFilter();
    this.loadData();
  }

  filterByDate(days: number) {
    this.pocket.filterByDate(days);
    this.loadData();
  }

  filterNoTags() {
    this.pocket.filterNoTags();
    this.loadData()
  }

  simpleDrop($event: Event) {
    console.log($event);
  }

  private loadData() {
    this.filteredList = this.pocket.getItems();
    this.tags = this.pocket.getTags();
  }

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
