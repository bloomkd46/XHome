import { AxiosInstance } from 'axios';

import { CommandResponse } from '../GlobalInterfaces';


export class Panel {
  public onchange?: (oldState: PanelDevice, newState: PanelDevice) => void;
  public onevent?: (event: PanelDeltaEvent) => void;

  constructor(protected server: AxiosInstance, public device: PanelDevice) {
    //
  }

  async get(): Promise<PanelDevice> {
    const device: PanelDevice = (await this.server.get(this.device._links.self.href)).data;
    if (this.onchange && (JSON.stringify(device) !== JSON.stringify(this.device))) {
      this.onchange(this.device, device);
    }
    this.device = device;
    return this.device;
  }

  async disarm(code: string | number): Promise<CommandResponse> {
    return (await this.server.post('/client/icontrol/panel/disarm', `path=${this.device._links['panel/disarm'].href}&code=${code}`));
  }

  async arm(code: string | number, mode: 'stay' | 'night' | 'away'): Promise<CommandResponse> {
    return (await this.server.post('/client/icontrol/panel/arm',
      `code=${code}&path=${this.device._links['panel/arm'].href}&armType=${mode}`));
  }
}
export interface PanelDeltaEvent {
  commandId: null;
  deviceId: null;
  mediaType: 'event/securityStateChange';
  timestamp: number;
  name: null;
  value: null | string;
  channel: null;
  metadata: {
    eventTime: string;
    trouble: 'false' | 'true';
    armType: null | '' | 'stay' | 'night' | 'away';
    status: (typeof status)[number];
  };
}
export const status = ['ready', 'arming', 'readyArmed', 'notReady', 'entryDelay'] as const;
export interface PanelDevice {
  firmwareVersion: string;
  hardwareId: string;
  hardwareVersion: string;
  manufacturer: string;
  serialNumber: string;
  macAddress: string;
  technology: 'zigbee';
  _links: {
    'panel/arm': {
      method: 'POST';
      href: string;
    };
    self: {
      href: string;
    };
    'panel/disarm': {
      method: 'POST';
      href: string;
    };
  };
  model: string;
  deletable: boolean;
  deviceType: 'panel';
  id: string;
  deviceSubtype: 'default';
  trouble: {
    description: string;
    name: 'senTamp' | string;
    criticality: boolean;
    timestamp: number;
  }[];
  name: '';
  properties: {
    macAddress: string;
    cellularConnected: boolean;
    zigBeeId: string;
    inTestMode: boolean;
    armType: 'away' | 'night' | 'stay' | '';
    bbConnected: boolean;
    status: (typeof status)[number];
  };
  icontrolModel: string;
}
