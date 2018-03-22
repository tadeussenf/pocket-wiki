import {AfterViewInit, Component, ElementRef, Inject, OnDestroy, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatChipInputEvent, MatChipList, MatDialogRef} from "@angular/material";
import {PocketService} from "../pocket.service";
import {AddTagModalData, Tag} from "../../common/interfaces";
import {FormControl} from "@angular/forms";
import * as _ from 'lodash';
import {Subscription} from "rxjs/Subscription";
import "rxjs/add/operator/map";
import "rxjs/add/operator/throttleTime";
import "rxjs/add/operator/debounce";
import "rxjs/add/operator/debounceTime";

const COMMA = 188;

@Component({
  selector: 'app-add-tags-modal',
  templateUrl: './add-tags-modal.component.html',
  styleUrls: ['./add-tags-modal.component.scss']
})
export class AddTagsModalComponent implements AfterViewInit, OnDestroy {

  @ViewChild('input') input: ElementRef;
  @ViewChild('chipList') chipList: MatChipList;
  tagInput: FormControl = new FormControl();
  selectable: boolean = true;
  removable: boolean = true;
  addOnBlur: boolean = true;
  separatorKeysCodes = [COMMA];
  private oldTags: string[];
  private tags: Tag[];
  filteredTags: Tag[];
  private tagInputSub: Subscription;

  // we need to do some ugly stuff in order to get both chips and autocomplete working
  // todo use https://github.com/Gbuomprisco/ngx-chips

  constructor(public dialogRef: MatDialogRef<AddTagsModalComponent>,
              @Inject(MAT_DIALOG_DATA) public data: AddTagModalData,
              public pocket: PocketService) {
    this.tags = this.data.allTags;
    this.filteredTags = [];
    this.oldTags = this.data.tags;
  }

  ngAfterViewInit() {
    this.tagInputSub = this.tagInput.valueChanges
      .debounceTime(300)
      .subscribe(val => {
        this.filteredTags = val ? _.filter(this.tags, (item: Tag) => item.name.startsWith(val)) : [];
      });
    setTimeout(() => {
      this.chipList._focusInput();
    }, 1000);
    console.log("view init");
  }

  add(event: MatChipInputEvent): void {
    console.log("add", event.value);
    if (event.value.length > 0 && this.data.tags.indexOf(event.value) < 0) { // does not exist
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
    this.data.tags = this.oldTags;
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.tagInputSub.unsubscribe();
  }
}
