import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  private url:string = 'https://api.weatherapi.com';
  private basePath:string = '/v1/current.json';
  private apiKey:string = `key=${process.env.NG_WEATHER_TOKEN}`;


  constructor(private http: HttpClient) { }

  private getApiUrl(query:string){
    return `${this.url}${this.basePath}?${this.apiKey}&aqi=no&q=${query}`;
  }

  getCurrentWeather(addressQuery:string): Observable<any>{
    return this.http.get(this.getApiUrl(addressQuery));
  }
}
