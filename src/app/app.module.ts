import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {GameComponent} from "./gameComponent/game.component";
import {AppService} from "./app.service";

@NgModule({
    declarations: [
        GameComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule
    ],
    providers: [AppService],
    bootstrap: [GameComponent]
})
export class AppModule {
}
