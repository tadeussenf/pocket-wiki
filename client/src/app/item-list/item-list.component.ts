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
    public pocket: StateService
  ) {
  }

  ngOnInit() {
    this.tagList = this.tags.map(tag => tag.name);
  }

  updatePage($event: { pageSize: number, pageIndex: number }) {
    this.pageIndex = $event.pageIndex;
    this.pageSize = $event.pageSize;
  }

  filterByTag(tag: string) {
    this.pocket.showItemsForTag(tag);
  }

  addTags(item_id: string, tags: string[]) {
    this.pocket.addTags(item_id, tags);
  }
}
