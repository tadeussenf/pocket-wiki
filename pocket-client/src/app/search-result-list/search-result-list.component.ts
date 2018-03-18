import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Tag} from "../../common/interfaces";

@Component({
  selector: 'app-search-result-list',
  templateUrl: './search-result-list.component.html',
  styleUrls: ['./search-result-list.component.scss']
})
export class SearchResultListComponent implements OnInit {
  @Input() tags: Tag[];
  @Output() onTagSelected = new EventEmitter<string>();

  constructor() {
  }

  ngOnInit() {
  }

  tagSelected(tag: string) {
    this.onTagSelected.emit(tag)
  }
}
