import { DecimalPipe, PercentPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Alignment } from '../alignment';
import { BooleanPipe } from '../boolean.pipe';
import { Cell } from '../cell';
import { Installation } from '../installation';
import { InstallationService } from '../installation.service';
import { Instruction } from '../instruction';
import { Location } from '../location';
import { LocationService } from '../location.service';
import { MeasurePipe } from '../measure.pipe';
import { TableView } from '../table-view';
import { TableViewService } from '../table-view.service';

@Component({
  selector: 'app-installations-tables',
  templateUrl: './installations-tables.component.html',
  styleUrls: ['./installations-tables.component.css']
})
export class InstallationsTablesComponent implements OnInit {

  installations: Installation[];

  tableViews: TableView[];

  locationMap:{[key: number]: Location} = {};

  constructor(
    private installationService: InstallationService,
    private tableViewService: TableViewService,
    private locationService: LocationService
  ) { }

  ngOnInit(): void {
    this.getInstallations();
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

      if (locs && locs.length>0)
      {

        locs.forEach(l => {
          this.locationMap[l.id] = l;
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

  sendCommand(iTable: number, iRow: number, iColumn: number): void
  {
    if (this.tableViews && this.tableViews[iTable])
    {
      let cell: Cell = this.tableViews[iTable].rows[iRow].cells[iColumn];
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
