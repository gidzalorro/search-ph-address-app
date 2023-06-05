import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PhLocationsService } from './ph-locations.service';
import { HttpParams } from '@angular/common/http';
import { fromEvent } from 'rxjs';
import { AnimationOptions } from 'ngx-lottie';
import { WeatherService } from './weather.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, AfterViewInit{
  title = 'search-ph-address-app';
  addressForm!:FormGroup;
  displayForm!:boolean;
  isRegionSelected!:boolean;
  isProvinceSelected!:boolean;
  isCitySelected!:boolean;
  isBarangaySelected!:boolean;
  isDataSelected!:boolean;
  isSelectionConfirm!:boolean;

  dataIndex!:number;
  selectedRegion!:any;
  regionIndex!:number;
  selectedProvince!:any;
  provinceIndex!:number;
  selectedCity!:any;
  cityIndex!:number;
  selectedBarangay!:any;
  barangayIndex!:number;
  tempAddressObj!:any;

  defaultTitle:string = 'This is required.'
  regionTitle!:string;
  provinceTitle!:string;
  cityTitle!:string;
  barangayTitle!:string;

  modalTitle!:string;
  modalEmptyBody!:string;
  modalData!:any[];
  hasMorePages!:boolean;
  scrollPage!:number;

  isMapLoaded!:boolean;
  googleMapUrl!:string;
  googleMapUrlFinal!:string;
  weatherData:any = {};

  lottieOptions: AnimationOptions = {    
    path: 'https://assets10.lottiefiles.com/packages/lf20_Wo6Vygm1p6.json' 
  };


  lottieStyles: Partial<CSSStyleDeclaration> = {
    height: '25em',
    width: '25em'
  };

  @ViewChild('phLocationsModal') modal!: ElementRef;
  @ViewChild('mapFrame') mapFrame!: ElementRef;

  constructor(
    private fb: FormBuilder, 
    private changeRef: ChangeDetectorRef,
    private phLocSrvc: PhLocationsService,
    private weather: WeatherService
  ){}

  ngOnInit(){
    this.displayForm = true;
    this.isRegionSelected = false;
    this.isProvinceSelected = false;
    this.isDataSelected  = false;
    this.isCitySelected  = false;
    this.isBarangaySelected = false;
    this.isSelectionConfirm = false;
    this.modalData = [];
    this.tempAddressObj = {};
    this.isMapLoaded = false;
    this.googleMapUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NG_GOOGLE_TOKEN}&q=`;
    this.googleMapUrlFinal = '';
    this.hasMorePages = false;
    this.scrollPage = 2;
    this.modalTitle = '';

    this.regionTitle = this.defaultTitle;
    this.provinceTitle = this.defaultTitle;
    this.cityTitle = this.defaultTitle;
    this.barangayTitle = this.defaultTitle;


    this.addressForm = this.fb.group({
      address: [''],
      region: [{value:'', disabled: true}, [Validators.required]],
      province: [{value:'', disabled: true}, [Validators.required]],
      city: [{value:'', disabled: true}, [Validators.required]],
      barangay: [{value:'', disabled: true}, [Validators.required]]
    })
  }

  ngAfterViewInit(){
      //this event will trigger once the modal is closed
      fromEvent(this.modal.nativeElement, 'hidden.bs.modal').subscribe( __ => {
        if(this.isRegionSelected){
          this.tempAddressObj['regionData'] = this.selectedRegion;
          this.tempAddressObj['regionIndex'] = this.regionIndex;
          this.isRegionSelected = !this.isRegionSelected;
        }
        if(this.isProvinceSelected){
          this.tempAddressObj['provinceData'] = this.selectedProvince;
          this.tempAddressObj['provinceIndex'] = this.provinceIndex; 
          this.isProvinceSelected = !this.isProvinceSelected;
        }
        if(this.isCitySelected){
          this.tempAddressObj['cityData'] = this.selectedCity;
          this.tempAddressObj['cityIndex'] = this.cityIndex; 
          this.isCitySelected = !this.isCitySelected;
        }
        if(this.isBarangaySelected){
          this.tempAddressObj['barangayData'] = this.selectedBarangay;
          this.tempAddressObj['barangayIndex'] = this.barangayIndex; 
          this.isBarangaySelected = !this.isBarangaySelected;
        }
        this.hasMorePages = false;
        this.scrollPage = 2;
        this.changeRef.detectChanges();
      });
  }
 

  getHttpParams(options:any){
    const params = new HttpParams({fromObject:options});
    return {
      params: params
    }
  }

  showRegion(){
    this.modalData = [];
    this.displayForm = false;
    this.isSelectionConfirm = this.addressForm.controls['region'].value ? true: false;
    this.modalTitle = 'Select Region';
    this.modalEmptyBody = '';
    this.isRegionSelected = !this.isRegionSelected;
    this.phLocSrvc.getRegions().subscribe( res => {
      if(res){
        this.modalData = res.data;
        this.changeRef.detectChanges();
      }
      
    })
    this.changeRef.detectChanges();
  }

  showProvince(){
    this.modalData = [];
    this.displayForm = false;
    this.isSelectionConfirm = this.addressForm.controls['province'].value ? true: false;
    this.modalTitle = 'Select Province';
    this.modalEmptyBody = 'Please select region first!';
    this.isProvinceSelected = !this.isProvinceSelected;
    let objParams:any = {}
    if(this.selectedRegion){
      this.modalEmptyBody = '';
      objParams['region_code'] = this.selectedRegion.id;
      this.phLocSrvc.getProvinces(this.getHttpParams(objParams)).subscribe( res => {
        this.modalData = res.data;
        if(this.modalData.length === 0){
          this.modalEmptyBody = 'No record available.';
        }
        this.changeRef.detectChanges();
      })
    }
    
    this.changeRef.detectChanges();
  }

  showCity(){
    this.modalData = [];
    this.displayForm = false;
    this.isSelectionConfirm = this.addressForm.controls['city'].value ? true: false;
    this.modalTitle = 'Select City';
    this.modalEmptyBody = 'Please select province first!';
    this.isCitySelected = !this.isCitySelected;
    let objParams:any = {}
    if(this.selectedProvince && this.selectedRegion){
      this.modalEmptyBody = '';
      objParams['province_code'] = this.selectedProvince.id;
      objParams['region_code'] = this.selectedRegion.id;
      objParams['limit'] = 40;
      this.phLocSrvc.getCities(this.getHttpParams(objParams))
      .subscribe( res => {
        if(res){
          this.modalData = res.data;
          if(this.modalData.length === 0){
            this.modalEmptyBody = 'No record available.';
          }
          this.changeRef.detectChanges();
        }       
      })
    }
    
    this.changeRef.detectChanges();
  }

  showBarangay(){
    this.modalData = [];
    this.displayForm = false;
    this.isSelectionConfirm = this.addressForm.controls['barangay'].value ? true: false;
    this.modalTitle = 'Select Barangay';
    this.modalEmptyBody = 'Please select city/municipality first!';
    this.isBarangaySelected = !this.isBarangaySelected;
    let objParams:any = {}
    if(this.selectedProvince && this.selectedRegion && this.selectedCity){
      objParams['province_code'] = this.selectedProvince.id;
      objParams['region_code'] = this.selectedRegion.id;
      objParams['city_code'] = this.selectedCity.id;
      objParams['limit'] = 40;
      this.modalEmptyBody = '';
      this.phLocSrvc.getBarangays(this.getHttpParams(objParams))
      .subscribe( res => {
        if(res){
          this.modalData = res.data;
          if(res.totalPages > 1){
            this.hasMorePages = true;
          }
          if(this.modalData.length === 0){
            this.modalEmptyBody = 'No record available.';
          }
          this.changeRef.detectChanges();
        }       
      })
    }
    
    this.changeRef.detectChanges();
  }

  showSelection(){
    return (this.isRegionSelected || this.isProvinceSelected || this.isCitySelected || this.isBarangaySelected) 
            && !this.displayForm
  }

  toggleButton(){
    let up = false;
    let down = false;
    if(this.displayForm && !this.isMapLoaded){
      up = false;
      down = false;
    }

    if(this.isMapLoaded){
      up = this.displayForm;
      down = !this.displayForm;
    }

    return {
      'up': up,
      'down': down
    }
  }

  toggleForm(){
    let down = false;
    let up = false;
    if(this.displayForm && !this.isMapLoaded){
      down = false;
      up = false;
    }
    if(this.isMapLoaded || this.showSelection() || (!this.showSelection() && !this.isMapLoaded)){
      down = this.displayForm;
      up = !this.displayForm;
    }

    return {
      'up': up,
      'down': down
    }
  }

  addClass(index:number){
    // let active = false;
    this.isDataSelected = false;
    if(((this.isRegionSelected && this.tempAddressObj['regionIndex'] === index)
      || (this.isProvinceSelected && this.tempAddressObj['provinceIndex'] === index) 
      || (this.isCitySelected && this.tempAddressObj['cityIndex'] === index) 
      || (this.isBarangaySelected && this.tempAddressObj['barangayIndex'] === index)) 
      && this.isSelectionConfirm){
      //active = false;
      this.isDataSelected = true;
    }else{
      //active = true;
      this.isDataSelected = false;
    }
    return {
      active: this.isDataSelected
    }
  }

  modalDataSelected(data:any, index:number){
    this.isSelectionConfirm = true;
    if(this.isRegionSelected){
      this.tempAddressObj['regionData'] = data;
      this.tempAddressObj['regionIndex'] = index;
    }else if(this.isProvinceSelected){
      this.tempAddressObj['provinceData'] = data;
      this.tempAddressObj['provinceIndex'] = index;
    }else if(this.isCitySelected){
      this.tempAddressObj['cityData'] = data;
      this.tempAddressObj['cityIndex'] = index;
    }else if(this.isBarangaySelected){
      this.tempAddressObj['barangayData'] = data;
      this.tempAddressObj['barangayIndex'] = index;
    }
    this.changeRef.detectChanges();
  }

  cancelSelection(){
    if(this.isRegionSelected){
      this.tempAddressObj['regionData'] = this.selectedRegion;
      this.tempAddressObj['regionIndex'] = this.regionIndex;
      this.isRegionSelected = !this.isRegionSelected;
    }
    if(this.isProvinceSelected){
      this.tempAddressObj['provinceData'] = this.selectedProvince;
      this.tempAddressObj['provinceIndex'] = this.provinceIndex; 
      this.isProvinceSelected = !this.isProvinceSelected;
    }
    if(this.isCitySelected){
      this.tempAddressObj['cityData'] = this.selectedCity;
      this.tempAddressObj['cityIndex'] = this.cityIndex; 
      this.isCitySelected = !this.isCitySelected;
    }
    if(this.isBarangaySelected){
      this.tempAddressObj['barangayData'] = this.selectedBarangay;
      this.tempAddressObj['barangayIndex'] = this.barangayIndex; 
      this.isBarangaySelected = !this.isBarangaySelected;
    }
    this.displayForm = true;
    this.hasMorePages = false;
    this.scrollPage = 2;
    this.changeRef.detectChanges();
  }


  confirmSelection(){
    if(this.isRegionSelected){
      this.selectedRegion = this.tempAddressObj['regionData'];
      this.regionIndex = this.tempAddressObj['regionIndex'];
      this.regionTitle = this.selectedRegion.name;
      if(this.addressForm.controls['region'].value !== this.selectedRegion.name){
        this.addressForm.patchValue({
          region: this.selectedRegion.name,
          province: '',
          city: '',
          barangay: ''
        }); 
        this.selectedProvince = null;
        this.selectedCity = null;
        this.selectedBarangay = null;
        this.isProvinceSelected = false;
        this.isCitySelected = false;
        this.isBarangaySelected = false;
        this.provinceIndex = -1;
        this.cityIndex = -1;
        this.barangayIndex = -1;
        this.provinceTitle = this.defaultTitle;
        this.cityTitle = this.defaultTitle;
        this.barangayTitle = this.defaultTitle;
      }   
    }else if(this.isProvinceSelected){
      this.selectedProvince = this.tempAddressObj['provinceData'];
      this.provinceIndex = this.tempAddressObj['provinceIndex']; 
      this.provinceTitle = this.selectedProvince.name;
      if(this.addressForm.controls['province'].value !== this.selectedProvince.name){
        this.addressForm.patchValue({
          province: this.selectedProvince.name,
          city: '',
          barangay: ''
        }); 
        this.selectedCity = null;
        this.selectedBarangay = null;
        this.isCitySelected = false;
        this.isBarangaySelected = false;
        this.cityIndex = -1;
        this.barangayIndex = -1;
        this.cityTitle = this.defaultTitle;
        this.barangayTitle = this.defaultTitle;
      }        
    }else if(this.isCitySelected){
      this.selectedCity = this.tempAddressObj['cityData'];
      this.cityIndex = this.tempAddressObj['cityIndex'];
      this.cityTitle = this.selectedCity.name;
      if(this.addressForm.controls['city'].value !== this.selectedCity.name){
        this.addressForm.patchValue({
          city: this.selectedCity.name,
          barangay: ''
        }); 
        this.selectedBarangay = null;
        this.isBarangaySelected = false;
        this.barangayIndex = -1;
        this.barangayTitle = this.defaultTitle;
      }
    }else if(this.isBarangaySelected){
      this.selectedBarangay = this.tempAddressObj['barangayData'];
      this.barangayIndex = this.tempAddressObj['barangayIndex'];
      this.barangayTitle = this.selectedBarangay.name;
      this.addressForm.patchValue({
        barangay: this.selectedBarangay.name
      });
    }
    this.cancelSelection();
    this.isSelectionConfirm = true;
    this.changeRef.detectChanges();
  }

  switchBtnHeader(){
    this.displayForm = !this.displayForm;
  }

  checkMapIfLoaded(){
    if(this.mapFrame.nativeElement.getAttribute('src') !== ''){
      console.log('map is loaded')
      this.isMapLoaded = true;
    }
  }

  disableForm(){
    return !this.addressForm.get('barangay')?.value || !this.addressForm.get('city')?.value ||
            !this.addressForm.get('province')?.value || !this.addressForm.get('region')?.value
  }

  submitForm(){
    this.googleMapUrlFinal = '';
    let qAddress = '';
    let weatherQuery = `${this.addressForm.get('city')?.value},${this.addressForm.get('province')?.value}`;
    if(this.addressForm.get('address')?.value){
      qAddress = qAddress.concat(this.addressForm.get('address')?.value)
    }
    qAddress = qAddress.concat(`${this.addressForm.get('barangay')?.value},${this.addressForm.get('city')?.value},${this.addressForm.get('province')?.value}`);
    this.googleMapUrlFinal = `${this.googleMapUrl}${qAddress}`;
    this.displayForm = false;
    this.hasMorePages = false;
    this.scrollPage = 2;

    this.weather.getCurrentWeather(weatherQuery).subscribe(res => {
        if(res){
          this.weatherData['location'] = weatherQuery;
          this.weatherData['temp'] = res.current.temp_c;
          this.weatherData = { ...this.weatherData, ...res.current.condition} 
          this.weatherData['details'] = `${this.weatherData.temp}°C ${this.weatherData.text}`;
          this.changeRef.detectChanges();
        }        
    })
  }

  resetForm(){
    this.addressForm.reset();
    this.isMapLoaded = false;
    this.displayForm = true;
    this.tempAddressObj = {};
    this.selectedRegion = null;
    this.selectedProvince = null;
    this.selectedCity = null;
    this.selectedBarangay = null;
    this.regionTitle = this.defaultTitle;
    this.provinceTitle = this.defaultTitle;
    this.cityTitle = this.defaultTitle;
    this.barangayTitle = this.defaultTitle;
    this.hasMorePages = false;
    this.scrollPage = 2;
  }

  modalScroll(){
    let objParams: any = {};
    if(this.hasMorePages && this.isCitySelected){
      objParams['limit'] = 40;
      objParams['page'] = this.scrollPage;
      objParams['province_code'] = this.selectedProvince.id;
      objParams['region_code'] = this.selectedRegion.id;
      this.phLocSrvc.getCities(this.getHttpParams(objParams))
      .subscribe( res => {
        this.modalData = [...this.modalData, ...res.data];
        if(this.scrollPage === res.totalPages){
          this.hasMorePages = false;
        }
        this.scrollPage++;
        this.changeRef.detectChanges();
      })
    }
    if(this.hasMorePages && this.isBarangaySelected){
      objParams['province_code'] = this.selectedProvince.id;
      objParams['region_code'] = this.selectedRegion.id;
      objParams['city_code'] = this.selectedCity.id;
      objParams['limit'] = 40;
      objParams['page'] = this.scrollPage;
      this.phLocSrvc.getBarangays(this.getHttpParams(objParams))
      .subscribe( res => {
        this.modalData = [...this.modalData, ...res.data];
        if(this.scrollPage === res.totalPages){
          this.hasMorePages = false;
        }
        this.scrollPage++;
        this.changeRef.detectChanges();
      })
    }
  }

  isObjEmpty(obj:any){
    return Object.keys(obj).length === 0;
  }

}