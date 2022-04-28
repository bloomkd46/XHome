import axios from 'axios';
import XHome from '..';
import { CommandResponse, DeltaEvent } from '../GlobalInterfaces';

export default class Light {
  public activityCallback?: (event: LightDeltaEvent) => void;

  constructor(
    public xhome: XHome, public device: LightDevice,
  ) {
    xhome.events.on('activity', (data: DeltaEvent) => {
      if (data.deviceId === device.id) {
        if (this.activityCallback) {
          this.activityCallback(data as LightDeltaEvent);
        }
      }
    });
  }

  set(value: boolean | number): Promise<CommandResponse> {
    return new Promise((resolve, reject) => {
      let body: string;
      if (typeof value === 'boolean') {
        body = `path=${this.device._links.isOn.href}&value=${value}`;
      } else if (this.device._links.level) {
        body = `path=${this.device._links.level.href}&value=${value}`;
      } else {
        reject('Your Device Dosen\'t Support Dimming');
        return;
      }
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

  get(): Promise<LightDevice> {
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
          /*'User-Agent': 'XfinityHome/11.104.2.817931 (Apple ; iPhone13,1 ; 2436x1125 ; iOS 15.4 ; Verizon ; Wifi ; MissingGUID;' +
            //' EIZAGGREDI1626372222RI; 8624090E-E43D-4A10-B37C-07008FA35BDA)',*/
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
}

export interface LightDeltaEvent {
  commandId: null;
  deviceId: string;
  mediaType: 'event/lighting';
  timestamp: number;
  name: null;
  value: null;
  channel: null;
  metadata: {
    isOn: 'false' | 'true';
    eventTime: string;
    level: string;
    energyUsage: string;
  };
}
export interface LightDevice {
  firmwareVersion: string;
  hardwareId: string;
  hardwareVersion: string;
  manufacturer: string;
  status: 'online' | string;
  technology: 'zigbee' | 'wifi';
  _links: {
    isOn: {
      method: 'POST';
      href: string;
    };
    level?: {
      method: 'POST';
      href: string;
    };
    self: {
      href: string;
    };
    label: {
      method: 'POST';
      href: string;
    };
  };
  model: string;
  deletable: boolean;
  deviceType: 'lightSwitch' | 'lightDimmer';
  id: string;
  deviceSubtype: 'default';
  trouble: unknown[];
  name: string;
  properties: {
    energyMgmtEnabled: boolean;
    energyUsage: number;
    dimAllowed: boolean;
    isOn: boolean;
    level?: number;
    label: string;
    type: 'onOffLight';
  };
  icontrolModel: string;
}