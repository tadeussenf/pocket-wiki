import {Component, Input, OnInit} from "@angular/core";
import {PocketItem, Tag} from "../../common/interfaces";
import {StateService} from "../state.service";

@Component({
  selector: "app-item-list",
  templateUrl: "./item-list.component.html",
  styleUrls: ["./item-list.component.scss"]
})
export class ItemListComponent implements OnInit {
  @Input() filteredList: PocketItem[];
  @Input() tags: Tag[];

  tagList: string[];

  pageIndex = 0;
  pageSize = 25;

  constructor(
    public state: StateService
  ) {
  }

  ngOnInit() {
  }

  updatePage($event: { pageSize: number, pageIndex: number }) {
    this.pageIndex = $event.pageIndex;
    this.pageSize = $event.pageSize;
  }

  filterByTag(tag: string) {
    this.state.filterByTag(tag);
  }
}
