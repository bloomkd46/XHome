import { AxiosInstance } from 'axios';

import { CommandResponse } from '../GlobalInterfaces';



export class Keyfob {
  public onchange?: (oldState: KeyfobDevice, newState: KeyfobDevice) => void;

  constructor(protected server: AxiosInstance, public device: KeyfobDevice) {
    //
  }

  async get(): Promise<KeyfobDevice> {
    const device: KeyfobDevice = (await this.server.get(this.device._links.self.href.replace('/client/icontrol', ''))).data;
    if (this.onchange && (JSON.stringify(device) !== JSON.stringify(this.device))) {
      this.onchange(this.device, device);
    }
    this.device = device;
    return this.device;
  }

  async label(value: string): Promise<CommandResponse> {
    return (await this.server.post('/update/device', `path=${this.device._links.label.href}&value=${value}`)).data;
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