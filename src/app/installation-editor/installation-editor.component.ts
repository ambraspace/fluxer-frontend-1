import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Installation } from '../installation';
import { InstallationService } from '../installation.service';

@Component({
  selector: 'app-installation-editor',
  templateUrl: './installation-editor.component.html',
  styleUrls: ['./installation-editor.component.css']
})
export class InstallationEditorComponent implements OnInit {

  installation: Installation;

  constructor(
    private route: ActivatedRoute,
    private installationService: InstallationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getInstallation();
  }

  getInstallation(): void {
    const id = +this.route.snapshot.paramMap.get('id');
    this.installationService.getInstallation(id)
      .subscribe(i => {
        this.installation = i;
      });
  }

  saveInstallation()
  {
    this.installationService.updateInstallation(this.installation)
      .subscribe(i => {
        this.installation = i;
        this.router.navigateByUrl("/manage/installations");
      });
  }

}
