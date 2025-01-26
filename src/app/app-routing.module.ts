import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManageInstallationsComponent } from './manage-installations/manage-installations.component';
import { HomeComponent } from './home/home.component';
import { InstallationEditorComponent } from './installation-editor/installation-editor.component';
import { InstallationsComponent } from './installations/installations.component';
import { DeviceDetailsComponent } from './device-details/device-details.component';
import { LoginComponent } from './login/login.component';
import { ManageUsersComponent } from './manage-users/manage-users.component';
import { ManageDevicesComponent } from './manage-devices/manage-devices.component';
import { ManageTablesComponent } from './manage-tables/manage-tables.component';
import { ManageTriggersComponent } from './manage-triggers/manage-triggers.component';

const routes: Routes = [
  {path: "", component: HomeComponent},
  {path: "login", component: LoginComponent},
  {path: "installations", component: InstallationsComponent},
  {path: "installations/:installationId/locations/:locationId", component: DeviceDetailsComponent},
  {path: "manage/installations/:id", component: InstallationEditorComponent},
  {path: "manage/installations", component: ManageInstallationsComponent},
  {path: "manage/users", component: ManageUsersComponent},
  {path: "manage/devices", component: ManageDevicesComponent},
  {path: "manage/tables", component: ManageTablesComponent},
  {path: "manage/triggers", component: ManageTriggersComponent},
  {path: "manage", redirectTo: "manage/installations", pathMatch: "full"}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
