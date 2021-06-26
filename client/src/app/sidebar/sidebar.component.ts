import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {PocketItem, Tag} from "../../common/interfaces";
import {StateService} from "../state.service";

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

  constructor(
    private state: StateService
  ) {
  }

  ngOnInit() {
  }

  onFilterByTag(tag: string) {
    this.state.filterByTag(tag);
  }

  onResetFilter() {
    this.state.resetFilter();
  }

  onFilterByDate(days: number) {
    this.state.filterByDate(days);
  }

  onFilterNoTags() {
    this.state.filterNoTags();
  }

  onFilterArchived() {
    this.state.filterArchived()
  }
}
