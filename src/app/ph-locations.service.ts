import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PhLocationsService {

  private url:string = 'https://ph-locations-api.onrender.com';
  private basePath: string = '/ph/geo';
  private regionsPath:string = '/regions';
  private provincesPath:string = '/provinces';
  private citiesPath:string = '/cities';
  private barangaysPath:string = '/barangays';

  constructor(private http: HttpClient) { }

  private getApiUrl(apiName:string){
    return `${this.url}${this.basePath}${apiName}`;
  }


  getRegions(params?:any): Observable<any>{
    return this.http.get(this.getApiUrl(this.regionsPath), { ...params })
  }

  getProvinces(params?:any): Observable<any>{
    return this.http.get(this.getApiUrl(this.provincesPath), { ...params })
  }

  getCities(params?:any): Observable<any>{
    return this.http.get(this.getApiUrl(this.citiesPath), { ...params })
  }

  getBarangays(params?:any): Observable<any>{
    return this.http.get(this.getApiUrl(this.barangaysPath), { ...params })
  }

}
