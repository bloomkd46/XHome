import axios from 'axios';
import XHome from '..';
import { Event, CommandResponse, DeltaEvent } from '../GlobalInterfaces';

export default class Motion {
  public history: MotionEvent[] = [];
  public eventCallback?: (event: MotionEvent) => void;
  public activityCallback?: (event: MotionDeltaEvent) => void;


  constructor(
    public xhome: XHome, public device: MotionDevice,
  ) {
    xhome.events.on('event', (data: Event) => {
      if (data.instanceId === device.id) {
        this.history.unshift(data as MotionEvent);
        if (this.eventCallback) {
          this.eventCallback(data as MotionEvent);
        }
      }
    });
    xhome.events.on('activity', (data: DeltaEvent) => {
      if (data.deviceId === device.id) {
        if (this.activityCallback) {
          this.activityCallback(data as MotionDeltaEvent);
        }
      }
    });
  }

  get(): Promise<MotionDevice> {
    return new Promise((resolve, reject) => {
      axios({
        method: 'get',
        url: `https://xhomeapi-lb-prod.codebig2.net${this.device._links.self.href}`,
        headers: {
          'Host': 'xhomeapi-lb-prod.codebig2.net',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Connection': 'keep-alive',
          'X-Client-Features': 'auth4all,carousel,carousel-devicedeeplink,no-cookie,deeplinkV1',
          'Xh-Auth': this.xhome.xhAuth,
          'Accept': 'application/json',
          'Authorization': `${this.xhome.tokenType} ${this.xhome.accessToken}`,
          'Accept-Language': 'en-us',
          'Accept-Encoding': 'gzip, deflate, br',

        },
        validateStatus: (status) => {
          return status === 200;
        },
        timeout: 60000,
        timeoutErrorMessage: 'Request Timed Out',
      }).then(response => {
        this.device = response.data;
        resolve(response.data);
      }).catch(err => reject(this.xhome.parseError(err)));
    });
  }

  label(value: string): Promise<CommandResponse> {
    return new Promise((resolve, reject) => {
      const body = `path=${this.device._links.label.href}&value=${value}`;
      axios({
        method: 'post',
        url: 'https://xhomeapi-lb-prod.codebig2.net/client/icontrol/update/device',
        data: body,
        headers: {
          'Host': 'xhomeapi-lb-prod.codebig2.net',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Connection': 'keep-alive',
          'X-Client-Features': 'auth4all,carousel,carousel-devicedeeplink,no-cookie,deeplinkV1',
          'Xh-Auth': this.xhome.xhAuth,
          'Accept': 'application/json',
          'Authorization': `${this.xhome.tokenType} ${this.xhome.accessToken}`,
          'Accept-Language': 'en-us',
          'Accept-Encoding': 'gzip, deflate, br',
          'Content-Length': body.length,

        },
        validateStatus: (status) => {
          return status === 200;
        },
        timeout: 60000,
        timeoutErrorMessage: 'Request Timed Out',
      }).then(response => resolve(response.data)).catch(err => reject(this.xhome.parseError(err)));
    });
  }

  bypass(value: boolean): Promise<CommandResponse> {
    return new Promise((resolve, reject) => {
      const body = `path=${this.device._links.isBypassed.href}&value=${value}`;
      axios({
        method: 'post',
        url: 'https://xhomeapi-lb-prod.codebig2.net/client/icontrol/update/device',
        data: body,
        headers: {
          'Host': 'xhomeapi-lb-prod.codebig2.net',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Connection': 'keep-alive',
          'X-Client-Features': 'auth4all,carousel,carousel-devicedeeplink,no-cookie,deeplinkV1',
          'Xh-Auth': this.xhome.xhAuth,
          'Accept': 'application/json',
          'Authorization': `${this.xhome.tokenType} ${this.xhome.accessToken}`,
          'Accept-Language': 'en-us',
          'Accept-Encoding': 'gzip, deflate, br',
          'Content-Length': body.length,

        },
        validateStatus: (status) => {
          return status === 200;
        },
        timeout: 60000,
        timeoutErrorMessage: 'Request Timed Out',
      }).then(response => resolve(response.data)).catch(err => reject(this.xhome.parseError(err)));
    });
  }

  mode(value: 'monitor24Hr'): Promise<CommandResponse> {
    return new Promise((resolve, reject) => {
      const body = `path=${this.device._links.functionType.href}&value=${value}`;
      axios({
        method: 'post',
        url: 'https://xhomeapi-lb-prod.codebig2.net/client/icontrol/update/device',
        data: body,
        headers: {
          'Host': 'xhomeapi-lb-prod.codebig2.net',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Connection': 'keep-alive',
          'X-Client-Features': 'auth4all,carousel,carousel-devicedeeplink,no-cookie,deeplinkV1',
          'Xh-Auth': this.xhome.xhAuth,
          'Accept': 'application/json',
          /*'User-Agent': 'XfinityHome/11.104.2.817931 (Apple ; iPhone13,1 ; 2436x1125 ; iOS 15.4 ; Verizon ; Wifi ; MissingGUID;'+
          ' EIZAGGREDI1626372222RI; 8624090E-E43D-4A10-B37C-07008FA35BDA)',*/
          'Authorization': `${this.xhome.tokenType} ${this.xhome.accessToken}`,
          'Accept-Language': 'en-us',
          'Accept-Encoding': 'gzip, deflate, br',
          'Content-Length': body.length,

        },
        validateStatus: (status) => {
          return status === 200;
        },
        timeout: 60000,
        timeoutErrorMessage: 'Request Timed Out',
      }).then(response => resolve(response.data)).catch(err => reject(this.xhome.parseError(err)));
    });
  }
}

export interface MotionDeltaEvent {
  commandId: string;
  deviceId: string;
  mediaType: 'event/zone';
  timestamp: number;
  name: 'isFaulted';
  value: 'false' | 'true';
  channel: 'B' | string;
  metadata: {
    eventTime: string;
    sensorTemperature: string;
    sensorNearFarSignal: string;
    sensorBatteryVoltage: string;
    sensorNearFarRF: string;
  };
}
export interface MotionEvent {
  channel: 'B' | string;
  eventId: string;
  eventName: 'isFaulted';
  instanceId: string;
  mediaType: 'event/zone';
  timestamp: number;
  value: boolean;
  properties: {
    isFaulted: boolean;
    faultOnEventTime?: number;
    batteryVoltage: number;
    temperature: number;
    nearFarRF: string;
    eventTime: string;
    nearFarSignal: string;
  };
  eventType: 'faultOnOff' | 'fault';
  isFaulted?: boolean;
  recordingInfo: unknown[];
}

export interface MotionDevice {
  firmwareVersion: string;
  hardwareId: string;
  hardwareVersion: string;
  manufacturer: string;
  serialNumber: string;
  status: 'online' | string;
  technology: 'zigbee' | 'wifi';
  deviceHelp: {
    deviceType: 'Motion Sensor';
    manufacturer: string;
    model: string;
    iconUrl: string;
    batteryRequired: string;
    batteryType: string;
    batteryCount: string;
    batterySelfInstall: 'Self' | string;
    batteryReplacementWebUrl: string;
    batteryReplacementMobileUrl: string;
    batteryPurchaseLink: string;
  };
  _links: {
    self: {
      href: string;
    };
    isBypassed: {
      method: 'POST';
      href: string;
    };
    label: {
      method: 'POST';
      href: string;
    };
    functionType: {
      method: 'POST';
      href: string;
    };
  };
  model: string;
  deletable: boolean;
  deviceType: 'sensor';
  id: string;
  deviceSubtype: 'default';
  trouble: unknown[];
  name: string;
  properties: {
    isFaulted: boolean;
    serialNumber: string;
    batteryVoltage: number;
    displayOrder: number;
    nearFarRF: string;
    label: string;
    type: 'motion';
    sensorType: 'motion';
    temperature: number;
    isBypassed: boolean;
    functionType: 'monitor24Hr' | string;
    nearFarSignal: string;
  };
  icontrolModel: string;
}