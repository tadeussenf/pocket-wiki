import {NgModule} from "@angular/core";
import {AppComponent} from "./app.component";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatChipsModule } from "@angular/material/chips";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatMenuModule } from "@angular/material/menu";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";
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
import { ItemComponent } from './item/item.component';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    ItemListComponent,
    SearchBarComponent,
    SearchResultListComponent,
    TagInputComponent,
    ItemComponent
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
