import { Component, OnInit } from '@angular/core';
import { Installation } from '../installation';
import { InstallationEditorComponent } from '../installation-editor/installation-editor.component';
import { InstallationService } from '../installation.service';

@Component({
  selector: 'app-manage-installations',
  templateUrl: './manage-installations.component.html',
  styleUrls: ['./manage-installations.component.css']
})
export class ManageInstallationsComponent implements OnInit {

  installations: Installation[];

  newInstallation: Installation = {} as Installation;

  constructor(private installationService: InstallationService) { }

  ngOnInit(): void {
    this.getInstallations();
  }

  getInstallations()
  {
    this.installationService.getInstallations().subscribe(ins => this.installations = ins);
  }

  addNewInstallation()
  {
    if (this.newInstallation.name && this.newInstallation.description)
    {
      this.installationService.addInstallation(
        {
          id: 0,
          name: this.newInstallation.name,
          description: this.newInstallation.description
        }
      ).subscribe(ins => {
        this.newInstallation.name = "";
        this.newInstallation.description = "";
        this.installations.push(ins);
      });
    }
  }

  delete(id: number)
  {
    if(confirm("Are you sure?"))
    {
      this.installationService.deleteInstallation(id)
      .subscribe(()=>{
        this.getInstallations();
      });
    }
  }

}
