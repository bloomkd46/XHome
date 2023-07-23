import { AxiosInstance } from 'axios';

import { CommandResponse, SensorDeltaEvent, Trouble } from '../GlobalInterfaces';


export class LegacyMotion {
  public onchange?: (oldState: LegacyMotionDevice, newState: LegacyMotionDevice) => void;
  public onevent?: (event: SensorDeltaEvent) => void;

  constructor(protected server: AxiosInstance, public device: LegacyMotionDevice) {
    //
  }

  async get(): Promise<LegacyMotionDevice> {
    const device: LegacyMotionDevice = (await this.server.get(this.device._links.self.href)).data;
    if (this.onchange && (JSON.stringify(device) !== JSON.stringify(this.device))) {
      this.onchange(this.device, device);
    }
    this.device = device;
    return this.device;
  }

  async label(value: string): Promise<CommandResponse> {
    return (await this.server.post('/client/icontrol/update/device', `path=${this.device._links.label.href}&value=${value}`)).data;
  }

  async bypass(value: boolean): Promise<CommandResponse> {
    return (await this.server.post('/client/icontrol/update/device', `path=${this.device._links.isBypassed.href}&value=${value}`)).data;
  }

  async mode(value: 'interiorFollower' | string): Promise<CommandResponse> {
    return (await this.server.post('/client/icontrol/update/device', `path=${this.device._links.functionType.href}&value=${value}`)).data;
  }

}

export interface LegacyMotionDevice {
  hardwareId: string,
  status: 'online',
  technology: 'legacyAlarmPanel',
  _links: {
    self: {
      href: string;
    },
    isBypassed: {
      method: 'POST',
      href: string;
    },
    label: {
      method: 'POST',
      href: string;
    },
    functionType: {
      method: 'POST',
      href: string;
    };
  },
  deletable: boolean,
  deviceType: 'sensor',
  id: string,
  deviceSubtype: 'default',
  trouble: Trouble[],
  properties: {
    isFaulted: boolean,
    displayOrder: number,
    isBypassed: boolean,
    label: string,
    functionType: 'interiorFollower',
    type: 'motion';
  },
  name: string;
} 