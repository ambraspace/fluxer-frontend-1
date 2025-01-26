import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Device } from '../device';
import { DeviceType } from '../device-type';
import { DeviceService } from '../device.service';

@Component({
  selector: 'app-device-editor',
  templateUrl: './device-editor.component.html',
  styleUrls: ['./device-editor.component.css']
})
export class DeviceEditorComponent implements OnInit {

  @Input()
  installationId: number;

  @Input()
  locationId: number;

  @Input()
  device: Device;

  deviceTypeMap: {[key: string]: DeviceType} = {};

  selectedDeviceType: DeviceType = {} as DeviceType;

  constructor(
    private activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private deviceService: DeviceService
  ) { }

  deviceForm: FormGroup = this.fb.group({
    id: [0],
    deviceType: [''],
    initiationParameters: this.fb.array([]),
    submitType: ['']
  });

  get objectParameters(): FormArray
  {
    return this.deviceForm.get('initiationParameters') as FormArray;
  }

  ngOnInit(): void {
    this.loadDeviceTypes();
  }

  private loadDeviceTypes()
  {
    this.deviceService.getDeviceTypes().subscribe(dts => {
      dts.forEach(dt => this.deviceTypeMap[dt.className] = dt);
      if (this.device)
      {
        this.deviceForm.reset({
          id: this.device.id,
          deviceType: this.device.className,
          initiationParameters: [],
          submitType: "Update"
        });
        this.selectDeviceType(this.device.className);
        this.deviceForm.get("deviceType").disable();
      } else {
        this.deviceForm.reset({
          id: 0,
          deviceType: this.objectKeys(this.deviceTypeMap)[0],
          initiationParameters: [],
          submitType: "Add"
        });
        this.selectDeviceType(this.objectKeys(this.deviceTypeMap)[0]);
        this.deviceForm.get("deviceType").enable();
      }
    });
  }

  selectDeviceType(dtClass: string)
  {
    this.selectedDeviceType = this.deviceTypeMap[dtClass];
    this.addDeviceFormControls();
  }

  private addDeviceFormControls()
  {
    this.objectParameters.clear();
    if (this.device)
    {
      this.objectKeys(this.selectedDeviceType.initiationParameters).forEach(key => {
        this.objectParameters.push(this.fb.control(this.device[key]));
      });
    } else {
      this.objectKeys(this.selectedDeviceType.initiationParameters).forEach(key => {
        this.objectParameters.push(this.fb.control(this.selectedDeviceType.initiationParameters[key]));
      });
    }
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

  addDevice()
  {
    let dt: DeviceType = {} as DeviceType;
    dt.className = this.deviceForm.get('deviceType').value;
    dt.initiationParameters = {};
    this.objectKeys(this.selectedDeviceType.initiationParameters).forEach((key, i) => {
      dt.initiationParameters[key]=this.objectParameters.controls[i].value;
    });
    this.deviceService.addDevice(this.installationId, this.locationId, dt).subscribe(d => {
      this.close();
    });
  }

  updateDevice()
  {
    let dt: DeviceType = {} as DeviceType;
    dt.className = this.deviceForm.get('deviceType').value;
    dt.initiationParameters = {};
    this.objectKeys(this.selectedDeviceType.initiationParameters).forEach((key, i) => {
      dt.initiationParameters[key]=this.objectParameters.controls[i].value;
    });
    this.deviceService.updateDevice(this.installationId, this.locationId, this.deviceForm.get('id').value, dt).subscribe(d => {
      this.close();
    });
  }

  close()
  {
    this.activeModal.dismiss();
  }

}
