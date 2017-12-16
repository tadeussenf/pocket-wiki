import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {
  @Output() onSearchSubmit = new EventEmitter<string>();
  searchForm: FormGroup;
  searchTerm: string;

  constructor() {
  }

  ngOnInit() {
    this.searchForm = new FormGroup({
      searchTerm: new FormControl('')
    });
  }

  onSubmit(searchTerm: string) {
    if (searchTerm && searchTerm.length > 0) {
      this.onSearchSubmit.emit(searchTerm)
    }
  }

}
