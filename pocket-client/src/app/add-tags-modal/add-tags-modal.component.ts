import {AfterViewInit, Component, ElementRef, HostListener, Inject, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatChipInputEvent, MatDialogRef, MatInput} from "@angular/material";
import {PocketService} from "../pocket.service";
import {ENTER} from '@angular/cdk/keycodes';
import {AddTagModalData, Tag} from "../../common/interfaces";
import {FormControl} from "@angular/forms";
import * as _ from 'lodash';
import "rxjs/add/operator/map";

const COMMA = 188;

@Component({
  selector: 'app-add-tags-modal',
  templateUrl: './add-tags-modal.component.html',
  styleUrls: ['./add-tags-modal.component.scss']
})
export class AddTagsModalComponent implements AfterViewInit {
  @ViewChild('input') input: ElementRef;
  tagInput: FormControl = new FormControl();
  selectable: boolean = true;
  removable: boolean = true;
  addOnBlur: boolean = true;
  separatorKeysCodes = [COMMA];
  private tags: Tag[];
  filteredTags: Tag[];

  // todo save data on ENTER
  // we need to do some ugly stuff in order to get both chips and autocomplete working

  constructor(public dialogRef: MatDialogRef<AddTagsModalComponent>,
              @Inject(MAT_DIALOG_DATA) public data: AddTagModalData,
              public pocket: PocketService) {
    this.tags = this.data.allTags;
    this.filteredTags = this.tags;
  }

  ngAfterViewInit() {
    this.tagInput.valueChanges
      .subscribe(val => {
        console.log(val);
        this.filteredTags = val ? _.filter(this.tags, item => item.name.startsWith(val)) : this.tags;
      });
  }

  add(event: MatChipInputEvent): void {
    console.log("add", event.value);
    console.log(event.value.length);
    console.log(this.data.tags.includes(event.value));
    if (event.value.length > 0 && !this.data.tags.includes(event.value)) {
      console.log("add value", event.value);
      this.data.tags.push(event.value);
      event.input.value = "";
    } else {
      console.log("remove input");
      event.input.value = "";
    }
  }

  addFromAutocomplete($event) {
    console.log("auto", $event.option.value);
    this.input.nativeElement.value = "";
    this.add({value: $event.option.value, input: {value: ''}} as MatChipInputEvent);
  }

  remove(tag: any): void {
    console.log("remove");
    let index = this.data.tags.indexOf(tag);

    if (index >= 0) {
      this.data.tags.splice(index, 1);
    }
  }

  doSubmit() {
    console.log("doSubmit");
    this.dialogRef.close(this.data);
  }

  onNoClick(): void {
    // todo will also add tag on cancel
    this.dialogRef.close();
  }
}
