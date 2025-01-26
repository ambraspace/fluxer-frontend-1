import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { take } from 'rxjs';
import { Location } from '../location';
import { LocationService } from '../location.service';

@Component({
  selector: 'app-location-editor',
  templateUrl: './location-editor.component.html',
  styleUrls: ['./location-editor.component.css']
})
export class LocationEditorComponent implements OnInit {

  @Input()
  installationId: number;

  @Input()
  location: Location;

  constructor(
    private activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private locationService: LocationService,
    private readonly geolocation$: GeolocationService) { }

  locationForm: FormGroup = this.fb.group({
    id: [0],
    name: [''],
    description: [''],
    longitude: [0],
    latitude: [0],
    submitType: ['']
  });

  ngOnInit(): void {
    if (this.location)
    {
      this.locationForm.reset({
        id: this.location.id,
        name: this.location.name,
        description: this.location.description,
        longitude: this.location.longitude,
        latitude: this.location.latitude,
        submitType: ['Update']
      });
    } else {
      this.locationForm.reset({
        id: 0,
        name: '',
        description: '',
        longitude: 0,
        latitude: 0,
        submitType: ['Add']
      });
    }
  }

  close()
  {
    this.activeModal.dismiss();
  }

  addLocation()
  {
    let location: Location = {} as Location;
    location.name = this.locationForm.get('name').value;
    location.description = this.locationForm.get('description').value;
    location.longitude = this.locationForm.get('longitude').value;
    location.latitude = this.locationForm.get('latitude').value;
    this.locationService.addLocation(this.installationId, location).subscribe(() => {
      this.close()
    });
  }

  updateLocation()
  {
    let location: Location = {} as Location;
    location.id = this.locationForm.get('id').value;
    location.name = this.locationForm.get('name').value;
    location.description = this.locationForm.get('description').value;
    location.longitude = this.locationForm.get('longitude').value;
    location.latitude = this.locationForm.get('latitude').value;
    this.locationService.updateLocation(this.installationId, location).subscribe(() => {
      this.close();
    });
  }

  getCurrentCoordinates(): void
  {
    this.geolocation$.pipe(take(1)).subscribe(pos => {
      this.locationForm.get('longitude').setValue(pos.coords.longitude);
      this.locationForm.get('latitude').setValue(pos.coords.latitude);
    });
  }

}
