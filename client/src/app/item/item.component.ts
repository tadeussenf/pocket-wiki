import {Component, Input, OnInit} from '@angular/core';
import {Item} from "../../common/Item";
import {StateService} from "../state.service";

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {
  @Input() item: Item;
  @Input() tagList: string[];
  @Input() isOdd: boolean;
  @Input() isEven: boolean;

  constructor(
    public state: StateService
  ) {
  }

  ngOnInit(): void {
  }

  async addTags(item_id: string, tags: string[]) {
    await this.state.addTags(item_id, tags);
  }

}
