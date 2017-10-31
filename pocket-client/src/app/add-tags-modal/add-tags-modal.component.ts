import {AfterViewInit, Component, ElementRef, HostListener, Inject, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatChipInputEvent, MatDialogRef} from "@angular/material";
import {PocketService} from "../pocket.service";
import {ENTER} from '@angular/cdk/keycodes';
import {AddTagModalData} from "../../common/interfaces";

const COMMA = 188;

@Component({
  selector: 'app-add-tags-modal',
  templateUrl: './add-tags-modal.component.html',
  styleUrls: ['./add-tags-modal.component.scss']
})
export class AddTagsModalComponent implements AfterViewInit {
  @ViewChild('input') input: ElementRef;
  selectable: boolean = true;
  removable: boolean = true;
  addOnBlur: boolean = true;
  separatorKeysCodes = [COMMA, ENTER];

  // todo save data on ENTER

  constructor(public dialogRef: MatDialogRef<AddTagsModalComponent>,
              @Inject(MAT_DIALOG_DATA) public data: AddTagModalData,
              public pocket: PocketService) {
  }

  ngAfterViewInit() {
    this.input.nativeElement.focus();
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDownHandler(event: KeyboardEvent) {
    console.log(event);
    if (event.keyCode === ENTER) {
      console.log("true");
      console.log(this.data);
      this.dialogRef.close(this.data)
    }
  }

  add(event: MatChipInputEvent): void {
    console.log("add", event);
    if (event.value.length > 0 && !this.data.tags.includes(event.value)) {
      this.data.tags.push(event.value);
      event.input.value = "";
    } else {
      event.input.value = "";
    }
  }

  remove(tag: any): void {
    console.log("remove");
    let index = this.data.tags.indexOf(tag);

    if (index >= 0) {
      this.data.tags.splice(index, 1);
    }
  }

  onNoClick(): void {
    // todo will also add tag on cancel
    this.dialogRef.close();
  }

}
