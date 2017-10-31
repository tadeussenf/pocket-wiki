import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {DndModule} from "ng2-dnd";
import {
  MatButtonModule, MatCardModule, MatCheckboxModule, MatChipsModule, MatDialog, MatDialogModule, MatFormFieldModule,
  MatIconModule,
  MatListModule,
  MatMenuModule,
  MatProgressBarModule, MatProgressSpinnerModule,
  MatSidenavModule,
  MatToolbarModule
} from "@angular/material";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {HttpModule} from "@angular/http";
import {BrowserModule} from "@angular/platform-browser";
import {PocketService} from "./pocket.service";
import {AddTagsModalComponent} from './add-tags-modal/add-tags-modal.component';
import {FormsModule} from "@angular/forms";

@NgModule({
  declarations: [
    AppComponent,
    AddTagsModalComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    BrowserAnimationsModule,
    MatMenuModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatIconModule,
    MatChipsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    FormsModule,
    DndModule.forRoot()
  ],
  providers: [
    PocketService
  ],
  entryComponents: [
    AddTagsModalComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
