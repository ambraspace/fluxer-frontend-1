import { DecimalPipe, PercentPipe } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import { AlarmData } from '../alarm_data';
import { Alignment } from '../alignment';
import { BooleanPipe } from '../boolean.pipe';
import { Installation } from '../installation';
import { InstallationService } from '../installation.service';
import { Location } from '../location';
import { LocationService } from '../location.service';
import { MeasurePipe } from '../measure.pipe';
import { Row } from '../row';
import { TableView } from '../table-view';
import { TableViewService } from '../table-view.service';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { Subscription } from 'rxjs';
import { Cell } from '../cell';
import { Instruction } from '../instruction';

const iconOk = L.icon({
  iconUrl: 'assets/marker-ok.png',
  iconSize: [16, 16]
});
const iconAlarm = L.icon({
  iconUrl: 'assets/marker-alarm.png',
  iconSize: [16, 16]
});

const iconHuman = L.icon({
  iconUrl: 'assets/person-solid.png',
  iconSize: [32, 32]
});

@Component({
  selector: 'app-installations-maps',
  templateUrl: './installations-maps.component.html',
  styleUrls: ['./installations-maps.component.css']
})
export class InstallationsMapsComponent implements OnInit {

  installations: Installation[];

  tableViews: TableView[];

  alarms: AlarmData[];

  selectedLocation: Location = undefined;

  positionMarker = L.marker([0, 0], {icon: iconHuman, riseOnHover: true, zIndexOffset: 0, opacity: 0.0});

  locationSubscription: Subscription;

  private map;

  locationMap:{[key: number]: Location} = {};
  markerMap: {[key: number]: any} = {};

  constructor(
    private installationService: InstallationService,
    private tableViewService: TableViewService,
    private locationService: LocationService,
    private geolocation$: GeolocationService
  ) { }

  ngOnInit(): void {
    this.getInstallations();
    this.locationSubscription = this.geolocation$.subscribe(position => {
      this.positionMarker.setLatLng([position['coords']['latitude'], position['coords']['longitude']]);
      this.positionMarker.setOpacity(1.0);
    });
  }

  ngOnDestroy(): void
  {
    this.locationSubscription.unsubscribe();
  }

  private showMap(): void
  {
      if (this.map)
      {
        this.map.off();
        this.map.remove();
      }
      this.map = L.map('map', {
        center: [ 0, 0 ],
        zoom: 2
      });
      const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(this.map);;
      const scale = L.control.scale({imperial: false}).addTo(this.map);
      this.map.on("zoom", () => {
        if (this.map.getZoom()>12)
        {
          Object.keys(this.markerMap).forEach(k => {
            if (this.locationMap[k])
            {
              this.markerMap[k].unbindTooltip();
              this.markerMap[k].bindTooltip(this.locationMap[k].name, {permanent: true});
            }
          });
        } else {
          Object.keys(this.markerMap).forEach(k => {
            if (this.locationMap[k])
            {
              this.markerMap[k].unbindTooltip();
              this.markerMap[k].bindTooltip(this.locationMap[k].name, {permanent: false});
            }
          });
        }
      })
      this.positionMarker.addTo(this.map);
  }


  selectedInstallationId(): number
  {
    return this.installationService.selectedInstallationId;
  }

  private getInstallations()
  {
    this.installationService.getInstallations().subscribe(ins => {
      this.installations = ins;
      if (this.installations && this.installations.length > 0)
      {
        let index: number = this.installations.findIndex(i => i.id == this.selectedInstallationId());
        if (index > -1)
        {
          this.selectInstallation(index);
        } else {
          this.selectInstallation(0);
        }
      }
    });
  }

  selectInstallation(i: number)
  {
    if (this.installations && this.installations.length>0)
    {
      this.installationService.selectedInstallationId = this.installations[i].id;
      this.loadTables();    
      this.loadLocations();  
    }
  }

  loadTables()
  {
    this.tableViewService.getTableViews(this.selectedInstallationId()).subscribe(tbls => {
      this.tableViews = tbls;
    })
  }

  loadLocations()
  {
    this.locationService.getLocations(this.selectedInstallationId()).subscribe(locs => {

      this.locationMap = {};

      this.selectedLocation = null;

      if (locs && locs.length>0)
      {

        this.showMap();

        let lonMin: number = 180;
        let lonMax: number = -180;
        let latMin: number = 90;
        let latMax: number = -90;

        locs.forEach(l => {
          this.locationMap[l.id] = l;

          if (l.latitude < latMin) latMin = l.latitude;
          if (l.latitude > latMax) latMax = l.latitude;
          if (l.longitude < lonMin) lonMin = l.longitude;
          if (l.longitude > lonMax) lonMax = l.longitude;

          let m = L.marker([l.latitude, l.longitude], {icon: iconOk, riseOnHover: true, zIndexOffset: 1000});
          m.bindTooltip(l.name, {permanent: false});
          m.on("click", () => this.showLocationData(l.id));
          m.addTo(this.map);
          this.markerMap[l.id] = m;
        });
        this.map.fitBounds([
          [latMin, lonMin],
          [latMax, lonMax]
        ]);
        this.loadAlarms(this.selectedInstallationId());
      }
    });
  }

  showLocationData(locationId: number): void
  {
    this.selectedLocation = this.locationMap[locationId];
  }


  getLocationRow(iTableView: number, locationId: number): Row
  {
    return this.tableViews[iTableView].rows.find(r => r.locationId == locationId);
  }


  locationAlarms(locationId: number): AlarmData[]
  {
    return this.alarms.filter(ad => ad.locationId == locationId);
  }


  loadAlarms(installationId: number)
  {
    this.installationService.getAlarms(this.selectedInstallationId()).subscribe(alarms => {
      this.alarms = alarms;
      if (this.alarms && this.alarms.length>0)
      {
        this.alarms.forEach(a => {
          let m = this.markerMap[a.locationId];
          m.setIcon(iconAlarm);
          m.setZIndexOffset(2000);
        });
      }
    });
  }


  getLocation(locationId: number): Location
  {
    let retVal: Location = undefined;
    if (this.locationMap && Object.keys(this.locationMap).length > 0)
    {
      retVal = this.locationMap[locationId];
    }

    if (retVal)
    {
      return retVal;
    } else {
      return {} as Location;
    }
  }

  formatValue(value: undefined, iTable: number, iCol: number)
  {
    let formatedValue: string;

    let pipe: string;
    let pipeArg: string;

    pipe = this.tableViews[iTable].columns[iCol].pipe;
    pipeArg = this.tableViews[iTable].columns[iCol].pipeArg;

    switch (pipe)
    {
      case "boolean":
        formatedValue = BooleanPipe.prototype.transform(value, pipeArg);
        break;
      case "measure":
        formatedValue = MeasurePipe.prototype.transform(value, pipeArg, "en-US");
        break;
      case "number":
        formatedValue = DecimalPipe.prototype.transform(value, pipeArg, "en-US");
        break;
      case "percent":
        formatedValue = PercentPipe.prototype.transform(value, pipeArg, "en-US");
        break;
      default:
        formatedValue = "" + value;
    }
    return formatedValue;
  }

  getClass(iTable: number, iColumn: number): string
  {

    let alignment = this.tableViews[iTable].columns[iColumn].alignment;
    
    switch (alignment)
    {
      case Alignment.LEFT:
        return "text-start";
      case Alignment.CENTER:
        return "text-center";
      case Alignment.RIGHT:
        return "text-end";
      default:
        return "text-start";
    }

  }


  sendCommand(iTable: number, locId: number, iColumn: number): void
  {
    if (this.tableViews && this.tableViews[iTable])
    {
      let index: number = Object.keys(this.locationMap).findIndex(key => this.locationMap[key].id == locId);
      let cell: Cell = this.tableViews[iTable].rows[index].cells[iColumn];
      let instruction: Instruction = {} as Instruction;
      instruction.id = 0;
      instruction.deviceId = cell.deviceId;
      instruction.methodName = cell.methodName;
      instruction.arguments = cell.arguments;
      this.installationService.sendCommand(this.selectedInstallationId(), instruction).subscribe(() => {
        console.log("Sent:" + instruction);
      });
    }
  }

}
