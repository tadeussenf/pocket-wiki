import {Component, Inject} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {AddTagModalData} from "../../common/interfaces";
import "rxjs/add/operator/map";
import "rxjs/add/operator/throttleTime";
import "rxjs/add/operator/debounce";
import "rxjs/add/operator/debounceTime";

@Component({
  selector: "app-add-tags-modal",
  templateUrl: "./add-tags-modal.component.html",
  styleUrls: ["./add-tags-modal.component.scss"]
})
export class AddTagsModalComponent {

  // we need to do some ugly stuff in order to get both chips and autocomplete working
  // todo use https://github.com/Gbuomprisco/ngx-chips

  constructor(
    public dialogRef: MatDialogRef<AddTagsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddTagModalData
  ) {
  }

  doSubmit() {
    this.dialogRef.close(this.data);
  }
}
