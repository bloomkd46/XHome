import { AxiosInstance } from 'axios';

import { CommandResponse } from '../GlobalInterfaces';



export class Keypad {
  public onchange?: (oldState: KeypadDevice, newState: KeypadDevice) => void;

  constructor(protected server: AxiosInstance, public device: KeypadDevice) {
    //
  }

  async get(): Promise<KeypadDevice> {
    const device: KeypadDevice = (await this.server.get(this.device._links.self.href.replace('/client/icontrol', ''))).data;
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
export interface KeypadDevice {
  firmwareVersion: string;
  hardwareId: string;
  hardwareVersion: string;
  manufacturer: string;
  serialNumber: string;
  status: 'online' | string;
  technology: 'zigbee' | 'wifi';
  deviceHelp: {
    deviceType: 'keypad';
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
  name: 'Keypad' | string;
  properties: {
    type: 'keypad';
    label: 'Keypad' | string;
  };
  icontrolModel: string;
}