import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { faEdit, faTrash, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Device } from '../device';
import { DeviceType } from '../device-type';
import { DeviceService } from '../device.service';
import { Installation } from '../installation';
import { InstallationService } from '../installation.service';
import { Instruction } from '../instruction';
import { Location } from '../location';
import { LocationService } from '../location.service';
import { Trigger } from '../trigger';
import { TriggerService } from '../trigger.service';

@Component({
  selector: 'app-manage-triggers',
  templateUrl: './manage-triggers.component.html',
  styleUrls: ['./manage-triggers.component.css']
})
export class ManageTriggersComponent implements OnInit {

  private EVERY_PATTERN = /^(\d+)(@(CIVIL_|NAUTICAL_|ASTRONOMICAL_)?(DAY|NIGHT)((-|\+)\d+))?$/;
  private AT_PATTERN = /^AT(\d{2}:\d{2})(@(CIVIL_|NAUTICAL_|ASTRONOMICAL_)?(DAY|NIGHT)((-|\+)\d+))?$/;
  private SUN_PATTERN = /^((SUNRISE|SUNSET|MIDNIGHT)(@(CIVIL|NAUTICAL|ASTRONOMICAL))?)((-|\+)\d+)$/;
  private WEEKLY_PATTERN = /^([Mm][Tt][Ww][Tt][Ff][Ss][Ss])-(\d{2}:\d{2})(@(CIVIL_|NAUTICAL_|ASTRONOMICAL_)?(DAY|NIGHT)((-|\+)\d+))?$/;
  private MONTHLY_PATTERN = /^ON(\d{1,2})AT(\d{2}:\d{2})(@(CIVIL_|NAUTICAL_|ASTRONOMICAL_)?(DAY|NIGHT)((-|\+)\d+))?$/;

  iconDelete = faTrash;
  iconEdit = faEdit;
  iconExternalLink = faExternalLinkAlt;

  private deviceTypeMap: {[key: string]: DeviceType} = {};

  installations: Installation[];

  triggers: Trigger[] = [];

  selectedTrigger: Trigger;

  editingTrigger: Trigger = null;

  private locationMap: {[key: number]: Location} = {};

  devices: Device[] = [];

  triggerForm: FormGroup = this.fb.group({
    name: [''],
    type: ['EVERY'],
    minutes: [5],
    time: ["06:00"],
    weekDays: this.fb.group({
      mon: true,
      tue: true,
      wed: true,
      thu: true,
      fri: true,
      sat: true,
      sun: true
    }),
    dayOfMonth: [1],
    limit: [''],
    margin: [0],
    sunPosition: ["SUNSET"],
    twilight: [''],
    offset: [0],
    instructions: this.fb.array([])
  });

  constructor(
    private installationService: InstallationService,
    private triggerService: TriggerService,
    private deviceService: DeviceService,
    private fb: FormBuilder,
    private locationService: LocationService,
    private modal: NgbModal
  ) { }

  ngOnInit(): void {
    this.loadDeviceTypes();
    this.loadInstallations();    
  }

  private loadDeviceTypes()
  {
    this.deviceTypeMap = {};
    this.deviceService.getDeviceTypes().subscribe(dts => {
      if (dts && dts.length > 0)
      {
        dts.forEach(dt => {
          this.deviceTypeMap[dt.className] = dt;
        });
      }
    })
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


  selectedInstallationId(): number
  {
    return this.installationService.selectedInstallationId;
  }


  private loadInstallations()
  {
    this.installationService.getInstallations().subscribe(ins => {
      this.installations = ins;
      if (this.installations && this.installations.length > 0)
      {
        if (this.selectedInstallationId())
        {
          let index: number;
          index = this.installations.findIndex(i => i.id = this.selectedInstallationId());
          if (index > -1)
          {
            this.selectInstallation(index);
          } else {
            this.selectInstallation(0);
          }
        } else {
          this.selectInstallation(0);
        }
      }
    });
  }

  selectInstallation(iIns: number)
  {
    if (this.installations && this.installations.length > iIns)
    {
      this.installationService.selectedInstallationId = this.installations[iIns].id;
      this.loadLocations();
      this.loadDevices();
      this.loadTriggers();
    }
  }

  private loadTriggers()
  {
    this.selectedTrigger = null;
    this.triggerService.getTriggers(this.selectedInstallationId()).subscribe(trgs => {
      this.triggers = trgs;
    });
  }

  selectTrigger(iTrigger: number)
  {

    if (this.editingTrigger)
    {
      if (this.editingTrigger.id != this.triggers[iTrigger].id)
      {
        if (confirm("You are currently editing a trigger?\nIf you continue, you will loose changes!"))
        {
          if (this.editingTrigger.id == 0)
          {
            this.editingTrigger = null;
            this.triggers.splice(this.triggers.length - 1, 1);
            this.selectedTrigger = this.triggers[iTrigger];
            this.prepareFormControls();
          } else {
            this.triggerService.getTrigger(this.selectedInstallationId(), this.editingTrigger.id).subscribe(tr => {
              this.editingTrigger = null;
              this.triggers.splice(this.triggers.findIndex(t => t.id == tr.id), 1, tr);
              this.selectedTrigger = this.triggers[iTrigger];
              this.prepareFormControls();
            });
          }
        }
      }
    } else {
      this.selectedTrigger = this.triggers[iTrigger];
      this.prepareFormControls();
    }

  }

  private prepareFormControls()
  {
    
    if (!this.selectTrigger) return;

    this.triggerForm.reset(this.triggerToForm(this.selectedTrigger));
    
    this.formInstructions.clear();
    this.selectedTrigger.instructions.forEach(ins => {
      let args: string = JSON.stringify(ins.arguments);
      args = args.substring(1, args.length-1);
      this.formInstructions.insert(this.formInstructions.length, this.fb.group({
        deviceId: [ins.deviceId],
        methodName: [ins.methodName],
        arguments: [args]
      }));
    });
    
  }

  private triggerToForm(trigger: Trigger): object
  {

    let type: string = "EVERY";
    let minutes: number = 5;
    let time: string = "06:00";
    let weekDays = {
      mon: true,
      tue: true,
      wed: true,
      thu: true,
      fri: true,
      sat: true,
      sun: true
    };
    let dayOfMonth: number = 1;
    let limit: string = "";
    let margin: number = 0;
    let sunPosition: string = "SUNSET";
    let twilight: string = "";
    let offset: number = 0;

    let everyMatcher = trigger.description.match(this.EVERY_PATTERN);
    let atMatcher = trigger.description.match(this.AT_PATTERN);
    let sunMatcher = trigger.description.match(this.SUN_PATTERN);
    let weeklyMatcher = trigger.description.match(this.WEEKLY_PATTERN);
    let monthlyMatcher = trigger.description.match(this.MONTHLY_PATTERN);

    if (everyMatcher)
    {
      type = "EVERY";
      minutes = + everyMatcher[1];
      if (everyMatcher[2])
      {
        limit = (everyMatcher[3] == undefined ? "" : everyMatcher[3]) + everyMatcher[4];
        margin = + everyMatcher[5];
      }
    }

    if (atMatcher)
    {
      type = "AT";
      time = atMatcher[1];
      if (atMatcher[2])
      {
        limit = (atMatcher[3] == undefined ? "" : atMatcher[3]) + atMatcher[4];
        margin = + atMatcher[5];
      }
    }

    if (sunMatcher)
    {
      type = "SUN";
      sunPosition = sunMatcher[2];
      twilight = (sunMatcher[4] == undefined ? "" : sunMatcher[4]);
      offset = + sunMatcher[5];
    }

    if (weeklyMatcher)
    {
      type = "WEEKLY";
      time = weeklyMatcher[2];
      
      weekDays.mon = (weeklyMatcher[1].charAt(0) == 'M');
      weekDays.tue = (weeklyMatcher[1].charAt(1) == 'T');
      weekDays.wed = (weeklyMatcher[1].charAt(2) == 'W');
      weekDays.thu = (weeklyMatcher[1].charAt(3) == 'T');
      weekDays.fri = (weeklyMatcher[1].charAt(4) == 'F');
      weekDays.sat = (weeklyMatcher[1].charAt(5) == 'S');
      weekDays.sun = (weeklyMatcher[1].charAt(6) == 'S');
      
      if (weeklyMatcher[3])
      {
        limit = (weeklyMatcher[4] == undefined ? "" : weeklyMatcher[4]) + weeklyMatcher[5];
        margin = + weeklyMatcher[6];
      }
    }

    if (monthlyMatcher)
    {
      type = "MONTHLY";
      dayOfMonth = + monthlyMatcher[1];
      time = monthlyMatcher[2];
      if (monthlyMatcher[3])
      {
        limit = (monthlyMatcher[4] == undefined ? "" : monthlyMatcher[4]) + monthlyMatcher[5];
        margin = + monthlyMatcher[6];
      }

    }

    return {
      name: trigger.name,
      type: type,
      minutes: minutes,
      time: time,
      weekDays: weekDays,
      dayOfMonth: dayOfMonth,
      limit: limit,
      margin: margin,
      sunPosition: sunPosition,
      twilight: twilight,
      offset: offset
    };

  }

  getDetailedDescription(description: string): string
  {

    let everyMatcher = description.match(this.EVERY_PATTERN);
    let atMatcher = description.match(this.AT_PATTERN);
    let sunMatcher = description.match(this.SUN_PATTERN);
    let weeklyMatcher = description.match(this.WEEKLY_PATTERN);
    let monthlyMatcher = description.match(this.MONTHLY_PATTERN);

    if (everyMatcher)
    {
      let retVal: string = "Every " + everyMatcher[1] + " minutes";
      if (everyMatcher[2])
      {
        retVal = retVal + " (" + everyMatcher[2] + ")";
      }
      return retVal;
    }
    
    if (atMatcher)
    {
      let retVal: string = "Every day at " + atMatcher[1];
      if (atMatcher[2])
      {
        retVal += " (" + atMatcher[2] + ")";
      }
      return retVal;
    }

    if (sunMatcher)
    {
      let pin = sunMatcher[2].toLowerCase();
      let twilight = (sunMatcher[4] == undefined ? "" : sunMatcher[4]);
      if (twilight != "")
      {
        pin = twilight.toLowerCase() + " " + pin;
      }
      let sign = sunMatcher[6];
      let minutes = Math.abs(+ sunMatcher[5]);
      return "" + minutes + " minutes " + (sign == '-' ? "before " : "after ") + pin;
    }

    if (weeklyMatcher)
    {
      let retVal: string = "On ";
      if (weeklyMatcher[1].charAt(0) == 'M') retVal = retVal + "Mon, ";
      if (weeklyMatcher[1].charAt(1) == 'T') retVal = retVal + "Tue, ";
      if (weeklyMatcher[1].charAt(2) == 'W') retVal = retVal + "Wed, ";
      if (weeklyMatcher[1].charAt(3) == 'T') retVal = retVal + "Thu, ";
      if (weeklyMatcher[1].charAt(4) == 'F') retVal = retVal + "Fri, ";
      if (weeklyMatcher[1].charAt(5) == 'S') retVal = retVal + "Sat, ";
      if (weeklyMatcher[1].charAt(6) == 'S') retVal = retVal + "Sun, ";

      if (retVal == "On ") return "(ERROR!)";

      retVal = retVal.slice(0, -2) + " at " + weeklyMatcher[2];
      if (weeklyMatcher[3])
      {
        retVal += " (" + weeklyMatcher[3] + ")";
      }
      return retVal;
    }

    if (monthlyMatcher)
    {
      let retVal: string = "Monthly on ";
      retVal += 'day ' + monthlyMatcher[1];
      retVal += ' at ' + monthlyMatcher[2];
      if (monthlyMatcher[3])
      {
        retVal += " (" + monthlyMatcher[3] + ")";
      }
      return retVal;
    }

    return "(ERROR!)";

  }

  private loadLocations()
  {
    this.locationMap = {};
    this.locationService.getLocations(this.selectedInstallationId()).subscribe(locs => {
      if (locs && locs.length > 0)
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

  private loadDevices()
  {
    this.deviceService.getInstallationDevices(this.selectedInstallationId()).subscribe(devs => {
      this.devices = devs;
    });
  }

  get formInstructions(): FormArray
  {
    return this.triggerForm.get('instructions') as FormArray;
  }
  
  addTrigger(content: any)
  {

    let newTrigger = {
      id: 0,
      name: 'New trigger',
      description: "5",
      instructions: []
    } as Trigger;

    this.triggers.push(newTrigger);

    this.selectTrigger(this.triggers.length - 1);

    this.editingTrigger = this.selectedTrigger;

    this.openTriggerEditor(content, this.triggers.length - 1);

  }

  openTriggerEditor(content: any, i: number)
  {
    this.selectTrigger(i);
    this.modal.open(content);
  }

  updateEditingTrigger()
  {

    this.editingTrigger = this.selectedTrigger;

    this.editingTrigger.name = this.triggerForm.get('name').value;
    let desc: string = "";
    switch (this.triggerForm.get('type').value)
    {
      case 'EVERY':
        desc = "" + this.triggerForm.get('minutes').value;
        if (this.triggerForm.get('limit').value != '')
        {
          desc += "@" + this.triggerForm.get('limit').value;
          if (this.triggerForm.get('margin').value < 0)
          {
            desc += this.triggerForm.get('margin').value;
          } else {
            desc += "+" + this.triggerForm.get('margin').value;
          }
        }
        this.editingTrigger.description = desc;
        break;
      case 'AT':
        desc = "AT" + this.triggerForm.get('time').value;
        if (this.triggerForm.get('limit').value != '')
        {
          desc += "@" + this.triggerForm.get('limit').value;
          if (this.triggerForm.get('margin').value < 0)
          {
            desc += this.triggerForm.get('margin').value;
          } else {
            desc += "+" + this.triggerForm.get('margin').value;
          }
        }
        this.editingTrigger.description = desc;
        break;
      case 'SUN':
        this.editingTrigger.description = 
          this.triggerForm.get('sunPosition').value +
          (this.triggerForm.get('twilight').value != "" ?
            "@" + this.triggerForm.get('twilight').value : "") +
          (this.triggerForm.get('offset').value < 0 ?
            this.triggerForm.get('offset').value :
            "+" + this.triggerForm.get('offset').value)
        break;
      case 'WEEKLY':
        desc += this.triggerForm.get('weekDays').get('mon').value ? 'M' : 'm';
        desc += this.triggerForm.get('weekDays').get('tue').value ? 'T' : 't';
        desc += this.triggerForm.get('weekDays').get('wed').value ? 'W' : 'w';
        desc += this.triggerForm.get('weekDays').get('thu').value ? 'T' : 't';
        desc += this.triggerForm.get('weekDays').get('fri').value ? 'F' : 'f';
        desc += this.triggerForm.get('weekDays').get('sat').value ? 'S' : 's';
        desc += this.triggerForm.get('weekDays').get('sun').value ? 'S' : 's';
        desc += "-" + this.triggerForm.get('time').value;
        if (this.triggerForm.get('limit').value != '')
        {
          desc += "@" + this.triggerForm.get('limit').value;
          if (this.triggerForm.get('margin').value < 0)
          {
            desc += this.triggerForm.get('margin').value;
          } else {
            desc += "+" + this.triggerForm.get('margin').value;
          }
        }
        this.editingTrigger.description = desc;
        break;
      case 'MONTHLY':
        desc =
          'ON' + this.triggerForm.get('dayOfMonth').value +
          'AT' + this.triggerForm.get('time').value;
          if (this.triggerForm.get('limit').value != '')
          {
            desc += "@" + this.triggerForm.get('limit').value;
            if (this.triggerForm.get('margin').value < 0)
            {
              desc += this.triggerForm.get('margin').value;
            } else {
              desc += "+" + this.triggerForm.get('margin').value;
            }
          }
          this.editingTrigger.description = desc;
          break;
        default:
          this.editingTrigger.description = "(ERROR!)";
    }
  }

  saveTrigger()
  {
    if (this.editingTrigger)
    {

      let trigger = {} as Trigger;
      trigger.id = this.editingTrigger.id;
      trigger.name = this.editingTrigger.name;
      trigger.description = this.editingTrigger.description;
      trigger.instructions = [];
      this.formInstructions.controls.forEach(fi => {
        let args: object[] = [];
        try {
          args = JSON.parse(`[${fi.get('arguments').value}]`);  
        } catch (error) {
        }
        trigger.instructions.push({
          id: 0,
          deviceId: fi.get('deviceId').value,
          methodName: fi.get('methodName').value,
          arguments: args
        });
      });

      if (trigger.id == 0)
      {
        this.triggerService.addTrigger(this.selectedInstallationId(), trigger).subscribe(tr => {
          this.editingTrigger = null;
          this.triggers.splice(this.triggers.length - 1, 1, tr);
          this.selectedTrigger = this.triggers[this.triggers.length - 1];
        });
      } else {
        let position = this.triggers.findIndex(t => t.id == trigger.id);
        this.triggerService.updateTrigger(this.selectedInstallationId(), trigger.id, trigger).subscribe(tr => {
          this.editingTrigger = null;
          this.triggers.splice(position, 1, tr);
          this.selectedTrigger = this.triggers[position];
        });
      }
    }
  }

  deleteTrigger(iTrigger: number)
  {
    if (confirm("Are you sure?"))
    {
      if (this.triggers[iTrigger].id == 0)
      {
        this.editingTrigger = null;
        this.selectedTrigger = null;
        this.triggers.splice(iTrigger, 1);
      } else {
        this.triggerService.deleteTrigger(this.selectedInstallationId(), this.triggers[iTrigger].id).subscribe(() => {
          this.editingTrigger = null;
          this.selectedTrigger = null;
          this.loadTriggers();
        })
      }
    }
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

  getDeviceDesc(deviceId: number): string
  {
    let device = this.getDevice(deviceId);
    return `${device.model} (#${device.id}) @${this.locationMap[device.locationId].name}`;
  }

  addInstruction()
  {

    this.editingTrigger = this.selectedTrigger;

    let newInstruction: Instruction = {
      id: 0,
      deviceId: this.devices[0].id,
      methodName: this.getDeviceType(this.devices[0].className).commandProducers[0],
      arguments: []
    };
    let args: string = JSON.stringify(newInstruction.arguments);
    args = args.substring(1, args.length-1);
    this.formInstructions.insert(this.formInstructions.length, this.fb.group({
      deviceId: [newInstruction.deviceId],
      methodName: [newInstruction.methodName],
      arguments: [args]
    }));
    this.selectedTrigger.instructions.push(newInstruction);
  }

  deleteInstruction(iInstruction: number)
  {
    this.editingTrigger = this.selectedTrigger;
    this.formInstructions.controls.splice(iInstruction, 1);
    this.selectedTrigger.instructions.splice(iInstruction, 1);
  }

  changeDevice(iRow: number)
  {

    this.editingTrigger = this.selectedTrigger;

    let deviceId: number = this.formInstructions.controls[iRow].get('deviceId').value;

    let className = this.getDevice(deviceId).className;

    let methodName = this.getDeviceType(className).commandProducers[0];

    this.formInstructions.controls[iRow].get('methodName').setValue(methodName);
    this.formInstructions.controls[iRow].get('arguments').setValue("");

    if (deviceId == this.devices[iRow].id)
    {
      for (let i=iRow+1; i<Math.min(this.formInstructions.controls.length, this.devices.length); i++)
      {
        this.formInstructions.controls[i].get('deviceId').setValue(this.devices[i].id);
        this.formInstructions.controls[i].get('methodName').setValue(
          this.getDeviceType(this.devices[i].className).commandProducers[0]
        );
        this.formInstructions.controls[i].get('arguments').setValue("");
      }
    }
  }

  changeMethod(iRow: number)
  {

    this.editingTrigger = this.selectedTrigger;

    this.formInstructions.controls[iRow].get('arguments').setValue("");

    let className = this.getDevice(this.formInstructions.controls[iRow].get('deviceId').value).className;
    let methodName = this.formInstructions.controls[iRow].get('methodName').value;

    for (let i=iRow+1; i<this.formInstructions.controls.length; i++)
    {
      if (this.getDevice(this.formInstructions.controls[i].get('deviceId').value).className == className)
      {
        this.formInstructions.controls[i].get('methodName').setValue(methodName);
        this.formInstructions.controls[i].get('arguments').setValue("");
      }
    }
    
  }

  changeArguments(iRow: number)
  {

    this.editingTrigger = this.selectedTrigger;

    let value = this.formInstructions.controls[iRow].get('arguments').value;
    for (let i=iRow+1; i<this.formInstructions.controls.length; i++)
    {
      this.formInstructions.controls[i].get('arguments').setValue(value);
    }
  }

}
