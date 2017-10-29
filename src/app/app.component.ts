///<reference path="../../node_modules/@angular/core/src/metadata/lifecycle_hooks.d.ts"/>
import {Component, OnInit} from '@angular/core';
import {Http, RequestOptionsArgs, Headers} from "@angular/http";
import * as _ from 'lodash';
import {Item} from "common/interfaces";
import {PocketService} from "./pocket.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  username: any;
  accessToken: any;
  title = 'app';
  consumerKey = "71520-12304220fa8fcbd039b9be34";
  headers: Headers = new Headers({
    'Content-Type': 'application/json',
    'X-Accept': 'application/json'
  });
  list: Item[] = [];
  filteredList: Item[];
  options: RequestOptionsArgs = {'headers': this.headers};
  private requestToken: string;
  tags: { name: any; count: number }[];

  constructor(private http: Http, private pocket: PocketService) {

  }

  ngOnInit(): void {
    this.loadData()
  }

  public loadAllItems() {
    this.pocket.loadAllItems();
    this.loadData()

  }

  filterByTag(tag: string) {
    this.pocket.showItemsForTag(tag);
    this.loadData();
  }

  resetFilter() {
    this.pocket.resetFilter();
    this.loadData();
  }

  addTags(itemId: number, tags: string[]) {
    this.pocket.addTags(itemId, tags);
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

}
