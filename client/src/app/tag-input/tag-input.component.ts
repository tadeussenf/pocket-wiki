import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from "@angular/core";
import {MatChipInputEvent, MatChipList} from "@angular/material";
import {FormControl} from "@angular/forms";
import {COMMA, SPACE} from "@angular/cdk/keycodes";
import {AddTagModalData, Tag} from "../../common/interfaces";
import {Subscription} from "rxjs";
import {PocketService} from "../pocket.service";
import * as _ from "lodash";

@Component({
  selector: "app-tag-input",
  templateUrl: "./tag-input.component.html",
  styleUrls: ["./tag-input.component.scss"]
})
export class TagInputComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() data: AddTagModalData;
  @Output() updatedData = new EventEmitter<AddTagModalData>();
  @ViewChild("input", {static: false}) input: ElementRef;
  @ViewChild("chipList", {static: false}) chipList: MatChipList;

  tagInput: FormControl = new FormControl();
  separatorKeysCodes = [COMMA, SPACE];
  private oldTags: string[];
  private tags: Tag[];
  filteredTags: Tag[];
  private tagInputSub: Subscription;

  // we need to do some ugly stuff in order to get both chips and autocomplete working
  // todo use https://github.com/Gbuomprisco/ngx-chips

  constructor(
    public pocket: PocketService
  ) {
  }

  ngOnInit(): void {
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
    this.add({value: $event.option.value, input: {value: ""}} as MatChipInputEvent);
  }

  remove(tag: any): void {
    console.log("remove");
    const index = this.data.tags.indexOf(tag);

    if (index >= 0) {
      this.data.tags.splice(index, 1);
    }
    console.log(this.data.tags);
  }

  doSubmit() {
    console.log("doSubmit");
    this.updatedData.emit(this.data);
  }

  onNoClick(): void {
    this.data.tags = this.oldTags;
  }

  ngOnDestroy(): void {
    this.tagInputSub.unsubscribe();
  }
}
