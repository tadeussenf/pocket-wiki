import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDialogModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatSidenavModule,
  MatToolbarModule,
} from "@angular/material";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {HttpClientModule} from '@angular/common/http';
import {BrowserModule} from "@angular/platform-browser";
import {PocketService} from "./pocket.service";
import {AddTagsModalComponent} from './add-tags-modal/add-tags-modal.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SidebarComponent} from './sidebar/sidebar.component';
import {ItemListComponent} from './item-list/item-list.component';
import {SearchBarComponent} from './search-bar/search-bar.component';
import {SearchResultListComponent} from './search-result-list/search-result-list.component';

@NgModule({
  declarations: [
    AppComponent,
    AddTagsModalComponent,
    SidebarComponent,
    ItemListComponent,
    SearchBarComponent,
    SearchResultListComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatMenuModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatInputModule,
    MatIconModule,
    MatChipsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatDialogModule,
    MatPaginatorModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    // DndModule.forRoot()
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
