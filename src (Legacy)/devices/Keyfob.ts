import axios from 'axios';
import XHome from '..';
import { CommandResponse } from '../GlobalInterfaces';

export default class Keyfob {
  constructor(
    public xhome: XHome, public device: KeyfobDevice,
  ) { }

  get(): Promise<KeyfobDevice> {
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
}
export interface KeyfobDevice {
  firmwareVersion: string;
  hardwareId: string;
  hardwareVersion: string;
  manufacturer: string;
  serialNumber: string;
  status: 'online' | string;
  technology: 'zigbee' | 'wifi';
  deviceHelp: {
    deviceType: 'keyfob';
    manufacturer: string;
    model: string;
    iconUrl: string;
    batteryRequired: string;
    batteryType: string;
    batteryCount: string;
    batterySelfInstall: 'Self';
    batteryReplacementWebUrl: string;
    batteryReplacementMobileUrl: string;
    batteryPurchaseLink: string;
  };
  _links: {
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
  deviceType: 'peripheral';
  id: string;
  deviceSubtype: 'default';
  trouble: unknown[];
  name: 'Keyfob 1' | string;
  properties: {
    type: 'keyfob';
    label: 'Keyfob 1' | string;
  };
  icontrolModel: string;
}