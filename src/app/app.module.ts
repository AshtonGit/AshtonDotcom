import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SplashComponent } from './splash/splash.component';
import { AboutMeComponent } from './about-me/about-me.component';
import { ContactMeComponent } from './contact-me/contact-me.component';
import { CloudAnimatedBgComponent } from './cloud-animated-bg/cloud-animated-bg.component';

@NgModule({
  declarations: [
    AppComponent,
    SplashComponent,
    AboutMeComponent,
    ContactMeComponent,
    CloudAnimatedBgComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
