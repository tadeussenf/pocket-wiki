import {NgModule} from "@angular/core";
import {AppComponent} from "./app.component";
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
import {BrowserModule} from "@angular/platform-browser";
import {StateService} from "./state.service";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SidebarComponent} from "./sidebar/sidebar.component";
import {ItemListComponent} from "./item-list/item-list.component";
import {SearchBarComponent} from "./search-bar/search-bar.component";
import {SearchResultListComponent} from "./search-result-list/search-result-list.component";
import {HttpClientModule} from "@angular/common/http";
import {TagInputComponent} from "./tag-input/tag-input.component";
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    ItemListComponent,
    SearchBarComponent,
    SearchResultListComponent,
    TagInputComponent
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
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    StateService
  ],
  entryComponents: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
