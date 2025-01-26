import { Component, OnInit } from '@angular/core';
import { Installation } from '../installation';
import { InstallationService } from '../installation.service';
import { Location } from '../location';
import { LocationService } from '../location.service';
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Device } from '../device';
import { DeviceService } from '../device.service';
import { AlarmEditorComponent } from '../alarm-editor/alarm-editor.component';
import { DeviceEditorComponent } from '../device-editor/device-editor.component';
import { LocationEditorComponent } from '../location-editor/location-editor.component';

@Component({
  selector: 'app-manage-devices',
  templateUrl: './manage-devices.component.html',
  styleUrls: ['./manage-devices.component.css']
})
export class ManageDevicesComponent implements OnInit {

  iconDelete = faTrash;
  iconEdit = faEdit;

  installations: Installation[];

  locations: Location[];

  selectedLocationId: number;

  devices: Device[];

  selectedDevice: Device;

  constructor(
    private installationService: InstallationService,
    private locationService: LocationService,
    private deviceService: DeviceService,
    private modalService: NgbModal) {}

  ngOnInit(): void {
    this.getInstallations();
  }

  getInstallations()
  {
    this.installationService.getInstallations().subscribe(
      installations => {
        this.installations = installations;
        if (this.installations && this.installations.length>0)
        {
          if (this.selectedInstallationId())
          {
            this.changeInstallation(this.selectedInstallationId());
          } else {
            this.changeInstallation(this.installations[0].id);
          }
        }
      }
    );
  }

  selectedInstallationId(): number
  {
    return this.installationService.selectedInstallationId;  
  }


  changeInstallation(id: number)
  {
    this.installationService.selectedInstallationId = id;
    this.getLocations();
  }

  getLocations()
  {
    this.locationService.getLocations(this.selectedInstallationId()).subscribe(
      locs => {
        this.locations = locs;
        this.selectedLocationId = null;
        this.devices = [];
        this.selectedDevice = null;
      }
    );
  }

  selectLocation(locationId: number)
  {
    this.selectedLocationId = locationId;
    this.getDevices();
  }

  openAddLocation()
  {

    let modalRef: NgbModalRef;
    modalRef = this.modalService.open(LocationEditorComponent);
    modalRef.componentInstance.installationId = this.selectedInstallationId();
    modalRef.dismissed.subscribe(() => {
      this.getLocations();
    });
    
  }

  openEditLocation(locationId: number)
  {

    this.selectLocation(locationId);

    let modalRef: NgbModalRef;
    modalRef = this.modalService.open(LocationEditorComponent);
    modalRef.componentInstance.installationId = this.selectedInstallationId();
    let location: Location = this.locations.find(loc => loc.id == this.selectedLocationId);
    modalRef.componentInstance.location = location;
    modalRef.dismissed.subscribe(() => {
      let index: number = this.locations.findIndex(loc => loc.id == locationId);
      this.locationService.getLocation(this.selectedInstallationId(), locationId).subscribe(loc => {
        this.locations.splice(index, 1, loc);
        this.selectLocation(locationId);
      });
      
    });

  }

  deleteLocation(id: number)
  {
    if (confirm("Are you sure?"))
    {
      this.locationService.deleteLocation(this.selectedInstallationId(), id).subscribe(
        ()=>{
          this.getLocations();
        }
      )
    }
  }

  getDevices()
  {
    this.deviceService.getDevices(this.selectedInstallationId(), this.selectedLocationId).subscribe(
      devs => {
        this.devices = devs;
        this.selectedDevice = null;
      }
    );
  }

  showDeviceDetails(id: number)
  {
    this.selectedDevice = this.devices.find(d => d.id == id);
  }

  openAddDevice(content: any)
  {
    let modal: NgbModalRef;
    modal = this.modalService.open(DeviceEditorComponent, {scrollable: true});
    modal.componentInstance.installationId = this.selectedInstallationId();
    modal.componentInstance.locationId = this.selectedLocationId;
    modal.componentInstance.device = undefined;
    modal.dismissed.subscribe(() => this.getDevices());
  }



  openDeviceEditor(id: number)
  {
    this.selectedDevice = this.devices.find(d => d.id == id);
    let modal: NgbModalRef;
    modal = this.modalService.open(DeviceEditorComponent, {scrollable: true});
    modal.componentInstance.installationId = this.selectedInstallationId();
    modal.componentInstance.locationId = this.selectedLocationId;
    modal.componentInstance.device = this.selectedDevice;
    modal.dismissed.subscribe(() => {
      this.getDevices();
    });
  }

  deleteDevice(id: number)
  {
    if (confirm("Are you sure?"))
    {
      this.deviceService.deleteDevice(this.selectedInstallationId(), this.selectedLocationId, id).subscribe(
        () => {
          this.getDevices();
        }
      )
    }
  }

  openAlarmEditor()
  {
    let modal: NgbModalRef;
    modal = this.modalService.open(AlarmEditorComponent, {size: "xl", scrollable: true});
    modal.componentInstance.installationId = this.selectedInstallationId();
    modal.componentInstance.locationId = this.selectedLocationId;
    modal.componentInstance.device = this.selectedDevice;
  }

  objectKeys(o: object): string[]
  {
    if (o)
    {
      return Object.keys(o);
    } else {
      return [];
    }
  }

}
