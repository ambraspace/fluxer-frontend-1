import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyModule } from 'angular-plotly.js';
PlotlyModule.plotlyjs = PlotlyJS;

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { InstallationsComponent } from './installations/installations.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ManageInstallationsComponent } from './manage-installations/manage-installations.component';
import { InstallationEditorComponent } from './installation-editor/installation-editor.component';
import { ManageUsersComponent } from './manage-users/manage-users.component';
import { ManageDevicesComponent } from './manage-devices/manage-devices.component';
import { ManageTablesComponent } from './manage-tables/manage-tables.component';
import { ManageTriggersComponent } from './manage-triggers/manage-triggers.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BooleanPipe } from './boolean.pipe';
import { MeasurePipe } from './measure.pipe';
import { DeviceDetailsComponent } from './device-details/device-details.component';
import { DecamelPipe } from './decamel.pipe';
import { AlarmEditorComponent } from './alarm-editor/alarm-editor.component';
import { CommandSenderComponent } from './command-sender/command-sender.component';
import { DeviceEditorComponent } from './device-editor/device-editor.component';
import { LocationEditorComponent } from './location-editor/location-editor.component';
import { InstallationsTablesComponent } from './installations-tables/installations-tables.component';
import { InstallationsMapsComponent } from './installations-maps/installations-maps.component';
import { POSITION_OPTIONS } from '@ng-web-apis/geolocation';

@NgModule({
  declarations: [
    AppComponent,
    InstallationsComponent,
    HomeComponent,
    LoginComponent,
    ManageInstallationsComponent,
    InstallationEditorComponent,
    ManageUsersComponent,
    ManageDevicesComponent,
    ManageTablesComponent,
    ManageTriggersComponent,
    BooleanPipe,
    MeasurePipe,
    DeviceDetailsComponent,
    DecamelPipe,
    AlarmEditorComponent,
    CommandSenderComponent,
    DeviceEditorComponent,
    LocationEditorComponent,
    InstallationsTablesComponent,
    InstallationsMapsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    FontAwesomeModule,
    PlotlyModule
  ],
  providers: [        {
    provide: POSITION_OPTIONS,
    useValue: {enableHighAccuracy: true, timeout: 3000, maximumAge: 1000},
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
