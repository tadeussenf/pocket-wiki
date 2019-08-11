import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AddTagModalData, PocketItem, Tag} from "../../common/interfaces";
import {AddTagsModalComponent} from "../add-tags-modal/add-tags-modal.component";
import {MatDialog} from "@angular/material";
import {PocketService} from "../pocket.service";

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss']
})
export class ItemListComponent implements OnInit {
  @Input() filteredList: PocketItem[];
  @Input() tags: Tag[];
  @Output() tagsAdded = new EventEmitter<{itemId: string, tags: string[]}>();

  tagList: string[];

  pageIndex: number = 0;
  pageSize: number = 25;

  constructor(
    public dialog: MatDialog,
    public pocket: PocketService
  ) {
  }

  ngOnInit() {
    this.tagList = this.tags.map(tag => tag.name);
  }

  updatePage($event: any) {
    this.pageIndex = $event.pageIndex;
    this.pageSize = $event.pageSize;
  }

  showAddTagsModal(itemId: string, title: string, tags: string[]): void {
    let dialogRef = this.dialog.open(AddTagsModalComponent, {
      width: '500px',
      data: {
        itemId: itemId,
        title: title,
        tags: tags,
        allTags: this.tags.map(tag => tag.name)
      }
    });

    dialogRef.afterClosed().subscribe((result: AddTagModalData) => {
      console.log(result);
      if (result) {
        this.tagsAdded.emit(result);
      }
    });
  }

  filterByTag(tag: string) {
    this.pocket.showItemsForTag(tag);
  }

  addTags(item_id: string, tags: string[]) {
    this.tagsAdded.emit({itemId: item_id, tags: tags})
  }
}
