import { Component, OnInit } from '@angular/core';
import { InstallationService } from '../installation.service';

@Component({
  selector: 'app-installations',
  templateUrl: './installations.component.html',
  styleUrls: ['./installations.component.css']
})
export class InstallationsComponent implements OnInit {

  constructor (private installationService: InstallationService) { }

  ngOnInit(): void {
  }

  get showMaps(): boolean
  {
    return this.installationService.showMaps;
  }

  set showMaps(value: boolean)
  {
    this.installationService.showMaps = value;
  }

}
