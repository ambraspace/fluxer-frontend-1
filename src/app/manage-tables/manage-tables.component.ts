import { Component, OnInit } from '@angular/core';
import { Installation } from '../installation';
import { InstallationService } from '../installation.service';
import { TableView } from '../table-view';
import { TableViewService } from '../table-view.service';
import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Device } from '../device';
import { Location } from '../location';
import { LocationService } from '../location.service';
import { DeviceService } from '../device.service';
import { DeviceType } from '../device-type';
import { Row } from '../row';
import { Cell } from '../cell';
import { Column } from '../column';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Pipe } from '../pipe-enum';

@Component({
  selector: 'app-manage-tables',
  templateUrl: './manage-tables.component.html',
  styleUrls: ['./manage-tables.component.css']
})
export class ManageTablesComponent implements OnInit {

  iconDelete = faTrash;
  iconEdit = faEdit;

  installations: Installation[];

  locations: Location[];

  devices: Device[];

  locationDeviceMap: {[key: number]: Device[]} = {};

  tableViews: TableView[] = [];

  selectedTableView: TableView;

  editingTableIndex: number = -1;

  deviceTypes: DeviceType[];

  tableForm: FormGroup = this.fb.group({
    id: [''],
    name: [''],
    description: [''],
    displayOrder: [''],
    columns: this.fb.array([]),
    rows: this.fb.array([])
  });
    
  constructor
  (
    private installationService: InstallationService,
    private locationService: LocationService,
    private deviceService: DeviceService,
    private tableViewService: TableViewService,
    private fb: FormBuilder,
    private modal: NgbModal
  ) { }

  ngOnInit(): void {
    this.getDeviceTypes();
    this.getInstallations();
  }

  get formRows(): FormArray
  {
    return this.tableForm.get("rows") as FormArray;
  }

  get formColumns(): FormArray
  {
    return this.tableForm.get("columns") as FormArray;
  }

  formCells(iRow: number): FormArray
  {
    return this.formRows.controls[iRow].get('cells') as FormArray;
  }
  
  private getDeviceTypes()
  {
    this.deviceService.getDeviceTypes().subscribe(
      dts => this.deviceTypes = dts
    );
  }


  selectedInstallationId(): number
  {
    return this.installationService.selectedInstallationId;
  }

  private getInstallations()
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

  changeInstallation(id: number)
  {
    this.installationService.selectedInstallationId = id;
    this.getLocations();
    this.getDevices();
    this.getTableViews();
  }

  private getLocations()
  {
    this.locationService.getLocations(this.selectedInstallationId()).subscribe(locs => {
      this.locations = locs;
    });
  }

  private getDevices()
  {
    this.deviceService.getInstallationDevices(this.selectedInstallationId()).subscribe(devs=>{
      this.devices = devs;
      this.locationDeviceMap = {};
      this.locations.forEach(loc=>
        this.locationDeviceMap[loc.id]=this.devices.filter(d=>
          d.locationId == loc.id));
    });
  }

  private getTableViews()
  {
    this.tableViewService.getTableViews(this.selectedInstallationId()).subscribe(
      tvs => {
        this.tableViews = tvs;
        this.selectedTableView = null;
      }
    );
  }

  selectTableView(index: number)
  {

    if (this.selectedTableView && (this.tableViews[index].id == this.selectedTableView.id)) return;

    if (this.editingTableIndex>-1)
    {
      if (confirm("You are currently editing a table?\nIf you continue, you will loose changes!"))
      {
        if (this.tableViews[this.editingTableIndex].id==0)
        {
          this.tableViews.splice(this.tableViews.length-1, 1);
          this.editingTableIndex = -1;
          this.selectedTableView = this.tableViews[index];
          this.displayTable();
        } else {
          this.tableViewService.getTableView(this.selectedInstallationId(),
            this.tableViews[this.editingTableIndex].id).subscribe(tv => {
              this.tableViews.splice(this.editingTableIndex, 1, tv);
              this.editingTableIndex = -1;
              this.selectedTableView = this.tableViews[index];
              this.displayTable();
            });
        }
      }
    } else {
      this.selectedTableView = this.tableViews[index];
      this.displayTable();
    }

  }

  private displayTable()
  {
    this.tableForm.get('id').setValue(this.selectedTableView.id);
    this.tableForm.get('name').setValue(this.selectedTableView.name);
    this.tableForm.get('description').setValue(this.selectedTableView.description);
    this.tableForm.get('displayOrder').setValue(this.selectedTableView.displayOrder);
    this.formColumns.clear();
    this.formRows.clear();
    this.selectedTableView.columns.forEach(col => {
      let formCol = this.fb.group({
        type: [col.type],
        title: [col.title],
        description: [col.description],
        alignment: [col.alignment],
        pipe: [col.pipe],
        pipeArg: [col.pipeArg]
      });
      this.formColumns.push(formCol);
    });
    this.selectedTableView.rows.forEach(row=>{
      let formRow = this.fb.group({
        locationId: [row.locationId],
        cells: this.fb.array([])
      });
      row.cells.forEach(cell=>{
        (formRow.get("cells") as FormArray).push(this.fb.group({
          deviceId: [cell.deviceId],
          parameterName: [cell.parameterName],
          methodName: [cell.methodName],
          arguments: [cell.arguments]
        }));
      });
      this.formRows.push(formRow);
    });

  }

  getParameters(deviceId: number): string[]
  {
    let device = this.devices.find(d=>
      d.id == deviceId
    );
    if (device)
    {
      let dt = this.deviceTypes.find(d=>
        d.className == device.className
      );
      return dt.readableParameters;
    }
    return [];
  }

  getCommands(deviceId: number): string[]
  {
    let device = this.devices.find(d=>
      d.id == deviceId
    );
    if (device)
    {
      let dt = this.deviceTypes.find(d=>
        d.className == device.className
      );
      return dt.commandProducers;
    }
    return [];
  }

  changeLoc(iRow: number)
  {
    this.formCells(iRow).controls.forEach(c=>{
      c.get('deviceId').setValue(0);
      c.get('parameterName').setValue("");
      c.get('methodName').setValue("");
      c.get('arguments').setValue("");
    });

    let locationId = this.formRows.controls[iRow].get('locationId').value;

    if (locationId == 0 || locationId != this.locations[iRow].id) return;

    for (let j=iRow+1; j<Math.min(this.locations.length, this.formRows.controls.length); j++)
    {
      let row = this.formRows.controls[j];
      if (row.get('locationId').value == 0)
      {
        row.get('locationId').setValue(this.locations[j].id);
      } else {
        break;
      }
    }


  }

  changeDev(iRow: number, iCol: number)
  {
  
    let formCell: FormGroup = this.formCells(iRow).controls[iCol] as FormGroup;
    formCell.get("parameterName").setValue("");
    formCell.get("methodName").setValue("");
    formCell.get("arguments").setValue("");

    let selectedDeviceId = formCell.get('deviceId').value;

    if (selectedDeviceId == 0) return;
  
    let devType = this.devices.find(d => d.id == selectedDeviceId).className;
  
    for (let i=iRow+1; i<this.formRows.length; i++)
    {

      let devId = this.formCells(i).controls[iCol].get("deviceId");
      let locationId = this.formRows.controls[i].get("locationId");

      if (devId.value > 0 || locationId.value == 0) break;

      let locDevs = this.locationDeviceMap[locationId.value];

      for (let j=0; j<locDevs.length; j++)
      {
        if (locDevs[j].className == devType)
        {
          this.formCells(i).controls[iCol].get('deviceId').setValue(locDevs[j].id);
          break;
        }
      }

    }
  }

  changeParam(iRow: number, iCol: number)
  {

    let selectedParam: string = this.formCells(iRow).controls[iCol].get('parameterName').value;
    if (selectedParam == "") return;

    let devType = this.devices.find(d =>
      d.id == this.formCells(iRow).controls[iCol].get('deviceId').value).className;

    for (let i=iRow+1; i<this.formRows.length; i++)
    {

      let locationId = this.formRows.controls[i].get("locationId");

      if (locationId.value == 0) break;

      let currDev = this.locationDeviceMap[locationId.value].find(d =>
        d.id == this.formCells(i).controls[iCol].get("deviceId").value);
      
      if (!currDev || (currDev.className != devType)) break;

      this.formCells(i).controls[iCol].get('parameterName').setValue(selectedParam);

    }
  
  }


  changeMethod(iRow: number, iCol: number): void
  {

    let formCell: FormGroup = this.formCells(iRow).controls[iCol] as FormGroup;
    formCell.get("arguments").setValue(""); 

    let selectedMethod: string = formCell.get('methodName').value;
    if (selectedMethod == "") return;

    let devType = this.devices.find(d =>
      d.id == this.formCells(iRow).controls[iCol].get('deviceId').value).className;

    for (let i=iRow+1; i<this.formRows.length; i++)
    {

      let locationId = this.formRows.controls[i].get("locationId");

      if (locationId.value == 0) break;

      let currDev = this.locationDeviceMap[locationId.value].find(d =>
        d.id == this.formCells(i).controls[iCol].get("deviceId").value);
      
      if (!currDev || (currDev.className != devType)) break;

      this.formCells(i).controls[iCol].get('methodName').setValue(selectedMethod);

    }

  }

  changeArguments(iRow: number, iCol: number): void
  {

    let formCell: FormGroup = this.formCells(iRow).controls[iCol] as FormGroup;
    let args: string = formCell.get('arguments').value;

    let devType = this.devices.find(d =>
      d.id == this.formCells(iRow).controls[iCol].get('deviceId').value).className;

    for (let i=iRow+1; i<this.formRows.length; i++)
    {

      let locationId = this.formRows.controls[i].get("locationId");

      if (locationId.value == 0) break;

      let currDev = this.locationDeviceMap[locationId.value].find(d =>
        d.id == this.formCells(i).controls[iCol].get("deviceId").value);
      
      if (!currDev || (currDev.className != devType)) break;

      this.formCells(i).controls[iCol].get('arguments').setValue(args);

    }

  }

  addRow()
  {
    this.modifyTable();
    let formRow = this.fb.group({
      locationId: [0],
      cells: this.fb.array([])
    });
    this.formColumns.controls.forEach(cell=>{
      (formRow.get("cells") as FormArray).push(this.fb.group({
        deviceId: [0],
        parameterName: [""],
        methodName: [""],
        arguments: [""]
      }));
    });
    this.formRows.push(formRow);
  }

  addDataColumn()
  {
    this.modifyTable();
    this.formColumns.controls.push(this.fb.group({
      type: ['DATA'],
      title: [""],
      description: [""],
      alignment: ["LEFT"],
      pipe: [""],
      pipeArg: ['']
    }));
    this.formRows.controls.forEach(r=>{
      (r.get('cells') as FormArray).push(this.fb.group({
        deviceId: [0],
        parameterName: [''],
        methodName: [''],
        arguments: ['']
      }))
    })
  }

  addCommandColumn(): void
  {
    this.modifyTable();
    this.formColumns.controls.push(this.fb.group({
      type: ['COMMAND'],
      title: [""],
      description: [""],
      alignment: ["CENTER"],
      pipe: [''],
      pipeArg: ['']
    }));
    this.formRows.controls.forEach(r=>{
      (r.get('cells') as FormArray).push(this.fb.group({
        deviceId: [0],
        parameterName: [''],
        methodName: [''],
        arguments: ['']
      }))
    })
  }

  addTable(content: any)
  {
    let newTableView = {
      id: 0,
      name: "",
      description: "",
      displayOrder: this.tableViews.length,
      columns: [],
      rows: []
    } as TableView;

    this.tableViews.push(newTableView);

    this.selectTableView(this.tableViews.length-1);

    this.editingTableIndex = this.tableViews.length-1;

    this.modal.open(content);
  }

  editTable(content: any, i: number)
  {
    this.selectTableView(i);
    this.modal.open(content);
  }

  updateArray()
  {
    
    this.modifyTable();

    if (this.editingTableIndex<0) return;

    let tv = this.tableViews[this.editingTableIndex];
    tv.name = this.tableForm.get('name').value;
    tv.description = this.tableForm.get('description').value;
    tv.displayOrder = this.tableForm.get('displayOrder').value;

  }

  modifyTable()
  {
    this.editingTableIndex = this.tableViews.findIndex(tv=>tv.id==this.selectedTableView.id);
  }

  saveTable()
  {

    // TODO: Validation should be in the form!
    // If it's in the form, there should be a button to remove a row/column
    let validRows = [];
    let validColumns = [];

    this.formRows.controls.forEach((fr, i)=>{
      if (fr.get('locationId').value != 0)
      {
        validRows.push(i);
      }
    });

    this.formColumns.controls.forEach((fc, i)=>{
      if ((fc.get('title').value as string).trim() != "")
      {
        let cellsAreOk = true;
        for (let j=0; j<validRows.length; j++)
        {
          if (this.formCells(validRows[j]).controls[i].get('deviceId').value == 0 ||
              (this.formCells(validRows[j]).controls[i].get('parameterName').value == "" && 
              this.formColumns.controls[i].get('type').value == 'DATA') || 
              (this.formCells(validRows[j]).controls[i].get('methodName').value == "" && 
              this.formColumns.controls[i].get('type').value == 'COMMAND'))
          {
            cellsAreOk = false;
            break;
          }
        }
        if (cellsAreOk)
        {
          validColumns.push(i);
        }
      }
    });

    if (validRows.length < 1 || validColumns.length < 1) {
      alert("There are no valid rows or columns!\nThe table can not be saved!");
      return;
    }

    let table = {} as TableView;
    table.id = 0;
    table.name = this.tableForm.get('name').value;
    table.description = this.tableForm.get('description').value;
    table.displayOrder = this.tableForm.get('displayOrder').value;
    table.columns = [];
    
    validColumns.forEach(ic=>{
      table.columns.push({
        type: this.formColumns.controls[ic].get('type').value,
        title: this.formColumns.controls[ic].get('title').value,
        description: this.formColumns.controls[ic].get('description').value,
        alignment: this.formColumns.controls[ic].get('alignment').value,
        pipe: this.formColumns.controls[ic].get('pipe').value,
        pipeArg: this.formColumns.controls[ic].get('pipeArg').value
      } as Column);
    });
    
    table.rows = [];
    validRows.forEach(ir => {
      let row = {} as Row;
      row.locationId = this.formRows.controls[ir].get('locationId').value;
      row.cells = [];
      validColumns.forEach(ic => {

        let args: object[] =  [];
        try 
        {
          args = JSON.parse(`[${this.formCells(ir).controls[ic].get('arguments').value}]`);
        } catch (err) {}

        row.cells.push({
          deviceId: this.formCells(ir).controls[ic].get('deviceId').value,
          parameterName: this.formCells(ir).controls[ic].get('parameterName').value,
          methodName: this.formCells(ir).controls[ic].get('methodName').value,
          arguments: args
        } as Cell)
      });
      table.rows.push(row);
    });

    if (this.tableForm.get('id').value == 0)
    {
      this.tableViewService.addTableView(this.selectedInstallationId(), table).subscribe(tv=>{
        this.tableViews.splice(this.tableViews.length-1, 1, tv);
        this.editingTableIndex = -1;
      })
    } else {
      this.tableViewService.updateTableView(this.selectedInstallationId(),  this.tableForm.get('id').value, table).subscribe(tv=>{
        this.getTableViews();
        this.editingTableIndex = -1;
      })
    }
  }

  deleteTable(id: number)
  {
    if (confirm("Are you sure?"))
    {
      if (id == 0)
      {
        this.tableViews.splice(this.tableViews.length-1, 1);
        this.editingTableIndex = -1;
        this.selectedTableView = null;
      } else {
        this.tableViewService.deleteTableView(this.selectedInstallationId(), id).subscribe(() => {
          this.getTableViews();
          this.editingTableIndex = -1;
          this.selectedTableView = null;
        })
      }
    }
  }

  getPipeKeys(): string[]
  {
    let values: string[] = [];
    Object.keys(Pipe).forEach(s=>{
      values.push(s);
    })
    return values;
  }

  getPipeArg(key: string)
  {
    return Pipe[key];
  }

}