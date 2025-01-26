import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Device } from '../device';
import { DeviceType } from '../device-type';
import { DeviceService } from '../device.service';
import { Location } from '../location';
import { LocationService } from '../location.service';
import { faSyncAlt, faPaperPlane, faBell, faEdit } from '@fortawesome/free-solid-svg-icons';
import * as L from 'leaflet';
import { InstallationService } from '../installation.service';
import { LogRequest } from '../log-request';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DecamelPipe } from '../decamel.pipe';
import { AlarmEditorComponent } from '../alarm-editor/alarm-editor.component';
import { CommandSenderComponent } from '../command-sender/command-sender.component';
import { DeviceEditorComponent } from '../device-editor/device-editor.component';
import { LocationEditorComponent } from '../location-editor/location-editor.component';

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-device-details',
  templateUrl: './device-details.component.html',
  styleUrls: ['./device-details.component.css']
})
export class DeviceDetailsComponent implements OnInit {

  iconRefresh = faSyncAlt;
  iconEdit = faEdit;
  iconAlarm = faBell;
  iconSend = faPaperPlane;

  constructor(
    private route: ActivatedRoute,
    private installationService: InstallationService,
    private locationService: LocationService,
    private deviceService: DeviceService,
    private fb: FormBuilder,
    private modal: NgbModal
  ) { }

  private installationId: number;
  private locationId: number;
  private map;
  private deviceTypeMap: {[key: string]: DeviceType} = {};

  location: Location = {} as Location;
  devices: Device[] = [];
  selectedDevice: Device = null;

  graphDataForm: FormGroup = this.fb.group({
    deviceId: [0],
    property: [''],
  });

  public graph = {
    data: [],
    layout: {
      margin: {t: 50, l: 50, b: 50, r: 50}
    },
    config: {
      toImageButtonOptions: {
        format: 'svg', // one of png, svg, jpeg, webp
        filename: 'history',
        scale: 1 // Multiply title/legend/axis/canvas sizes by this factor
      },
      modeBarButtonsToAdd: [
        {
          name: 'Clear all',
          icon: {
            width: 448,
            height:512,
            path: 'M32 464a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128H32zm272-256a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zM432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z'
          },
          click: () => this.clearData()
        }
      ],
      displayModeBar: true,
      displaylogo: false,
      responsive: true
    }
  };

  ngOnInit(): void {
    this.route.paramMap.subscribe(p => {
      this.installationId = + p.get('installationId');
      this.locationId = + p.get('locationId');
      this.loadDeviceTypes();
      this.loadLocation();
      this.loadDevices();
    });
  }

  loadDeviceTypes()
  {
    this.deviceService.getDeviceTypes().subscribe(dts => {
      this.deviceTypeMap = {};
      dts.forEach(dt => {
        this.deviceTypeMap[dt.className] = dt;
      });
    });
  }

  loadLocation()
  {
    this.locationService.getLocation(this.installationId, this.locationId).subscribe(loc => {
      this.location = loc;
      this.showMap();
    });
  }

  loadDevices()
  {
    this.deviceService.getDevices(this.installationId, this.locationId).subscribe(devs => {
      this.devices = devs;
      if (this.devices && this.devices.length > 0)
      {
        this.selectDevice(this.devices[0].id);
      }
    });
  }

  getDeviceType(name: string): DeviceType
  {

    let retVal: DeviceType = undefined;

    if (this.deviceTypeMap && Object.keys(this.deviceTypeMap).length > 0)
    {
      retVal = this.deviceTypeMap[name];
    }
    
    if (retVal)
    {
      return retVal;
    } else {
      return {} as DeviceType;
    }

  }



  private showMap(): void
  {
    if (this.location)
    {
      if (this.map)
      {
        this.map.off();
        this.map.remove();
      }
      this.map = L.map('map', {
        center: [ this.location.latitude, this.location.longitude ],
        zoom: 12
      });
      const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(this.map);;
      const marker = L.marker([this.location.latitude, this.location.longitude]).addTo(this.map);
      const scale = L.control.scale({imperial: false}).addTo(this.map);
    }
  }

  selectDevice(deviceId: number)
  {
    this.selectedDevice = this.getDevice(deviceId);
    this.graphDataForm.reset({
      deviceId: deviceId,
      property: this.getDeviceType(this.selectedDevice.className).readableParameters[0]
    });
  }


  getDevice(deviceId: number): Device
  {
    let d = this.devices.find(d => d.id == deviceId);
    if (d)
    {
      return d;
    } else {
      return {} as Device;
    }
  }

  addData()
  {
    let since: Date = new Date();
    let until: Date = new Date();
    since.setMonth(until.getMonth()-1);
    let request: LogRequest = {
      since: since,
      until: until,
      deviceId: this.graphDataForm.get('deviceId').value,
      parameterName: this.graphDataForm.get('property').value
    };
    
    this.installationService.getGraphData(this.installationId, request).subscribe(cps => {
      let x: Date[] = [];
      let y: (boolean|number)[] = [];
      cps.forEach(cp => {
        x.push(cp.time);
        if (typeof cp.value == "boolean")
        {
          y.push(cp.value ? 1 : 0);
        } else {
          y.push(cp.value);
        }
      });
      this.graph.data.push({
        x: x,
        y: y,
        type: 'scatter',
        name: DecamelPipe.prototype.transform(request.parameterName),
        mode: 'lines',
        line: {
          shape: 'hv'
        },
        fill: 'tozeroy'
      });
    })
    
  }

  clearData(): void
  {
    this.graph.data = [];
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

  syncDetails()
  {

    let index: number = this.devices.findIndex(d => d.id == this.selectedDevice.id);

    if (index == undefined) return;

    this.deviceService.getDevice(this.installationId, this.locationId, this.selectedDevice.id).subscribe(d => {
      this.devices.splice(index, 1, d);
      this.selectDevice(d.id);
    });

  }

  openLocationEditor()
  {
    let modalRef: NgbModalRef;
    modalRef = this.modal.open(LocationEditorComponent);
    modalRef.componentInstance.installationId = this.installationId;
    modalRef.componentInstance.location = this.location;
    modalRef.dismissed.subscribe(() => {
      this.locationService.getLocation(this.installationId, this.locationId).subscribe(loc => {
        this.location = loc;
        this.showMap();
      });
    })
  }

  openDeviceEditor()
  {
    let modalRef: NgbModalRef = this.modal.open(DeviceEditorComponent, {scrollable: true});
    modalRef.componentInstance.installationId = this.installationId;
    modalRef.componentInstance.locationId = this.locationId;
    modalRef.componentInstance.device = this.selectedDevice;
    modalRef.dismissed.subscribe(() => this.syncDetails());
  }

  openAlarmEditor()
  {
    let modalRef: NgbModalRef = this.modal.open(AlarmEditorComponent, {size: "xl", scrollable: true});
    modalRef.componentInstance.installationId = this.installationId;
    modalRef.componentInstance.locationId = this.locationId;
    modalRef.componentInstance.device = this.selectedDevice;
    modalRef.dismissed.subscribe(() => this.syncDetails());
  }

  openCommandSender()
  {
    let modalRef: NgbModalRef = this.modal.open(CommandSenderComponent, {size: "sm"});
    modalRef.componentInstance.installationId = this.installationId;
    modalRef.componentInstance.device = this.selectedDevice;
  }

}
