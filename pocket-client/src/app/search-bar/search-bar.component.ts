import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {
  @Output() onSearchSubmit = new EventEmitter<string>();
  searchTerm: string;

  constructor() { }

  ngOnInit() {
  }

  onSubmit(searchTerm: string) {
    console.log(searchTerm);
    this.onSearchSubmit.emit(searchTerm)
  }

}
