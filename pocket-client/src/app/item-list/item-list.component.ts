import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Item} from "../../common/Item";
import {AddTagModalData, Tag} from "../../common/interfaces";
import {AddTagsModalComponent} from "../add-tags-modal/add-tags-modal.component";
import {MatDialog} from "@angular/material";

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss']
})
export class ItemListComponent implements OnInit {
  @Input() filteredList: Item[];
  @Input() tags: Tag[];
  @Output() tagsAdded = new EventEmitter<AddTagModalData>();
  pageIndex: number = 0;
  pageSize: number = 25;

  constructor(public dialog: MatDialog) { }

  ngOnInit() {
  }

  updatePage($event: any) {
    this.pageIndex = $event.pageIndex;
    this.pageSize = $event.pageSize;
  }

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
        this.tagsAdded.emit(result);
      }
    });
  }


}
