import { AxiosInstance } from 'axios';

import { CommandResponse } from '../GlobalInterfaces';



export class Light {
  public onchange?: (oldState: LightDevice, newState: LightDevice) => void;
  public onevent?: (event: LightDeltaEvent) => void;

  constructor(protected server: AxiosInstance, public device: LightDevice) {
    //
  }

  async set(value: boolean | number): Promise<CommandResponse> {
    return (await this.server.post('/update/device', typeof value === 'boolean' ?
      `path=${this.device._links.isOn.href}&value=${value}` :
      `path=${this.device._links.level?.href}&value=${value}`)).data;
  }

  async get(): Promise<LightDevice> {
    const device: LightDevice = (await this.server.get(this.device._links.self.href.replace('/client/icontrol', ''))).data;
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