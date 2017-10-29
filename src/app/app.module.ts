import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {DndModule} from "ng2-dnd";
import {
  MatButtonModule, MatCardModule, MatCheckboxModule, MatChipsModule, MatIconModule, MatListModule, MatMenuModule,
  MatSidenavModule,
  MatToolbarModule
} from "@angular/material";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {HttpModule} from "@angular/http";
import {BrowserModule} from "@angular/platform-browser";
import {PocketService} from "./pocket.service";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    BrowserAnimationsModule,
    MatMenuModule,
    MatCheckboxModule,
    MatIconModule,
    MatChipsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    DndModule.forRoot()
  ],
  providers: [
    PocketService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
