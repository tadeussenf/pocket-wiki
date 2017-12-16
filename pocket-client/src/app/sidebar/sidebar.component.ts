import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {PocketItem, Tag} from "../../common/interfaces";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SidebarComponent implements OnInit {
  @Input() username: string;
  @Input() tags: Tag[];
  @Input() items: PocketItem[];
  @Output() filterByTag = new EventEmitter<string>();
  @Output() resetFilter = new EventEmitter();
  @Output() filterByDate = new EventEmitter<number>();
  @Output() filterNotTagged = new EventEmitter();

  constructor() {
  }

  ngOnInit() {
  }

  onFilterByTag(tag: string) {
    this.filterByTag.emit(tag)
  }

  onResetFilter() {
    this.resetFilter.emit();
  }

  onFilterByDate(days: number) {
    this.filterByDate.emit(days);
  }

  onFilterNoTags() {
    this.filterNotTagged.emit();
  }

}
