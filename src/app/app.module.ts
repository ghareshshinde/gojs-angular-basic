import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { GojsAngularModule } from 'gojs-angular';
import { AppComponent } from './app.component';

import { InspectorComponent } from './inspector/inspector.component';
import { EmailExtractorComponent } from './email-extractor/email-extractor.component';


@NgModule({
  declarations: [
    AppComponent,
    InspectorComponent,
    EmailExtractorComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    GojsAngularModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
