/* Issue #15, #16, #18 */
import { AxiosInstance } from 'axios';

import { CommandResponse, SensorDeltaEvent, Trouble } from '../GlobalInterfaces';


export class LegacyDryContact {
  public onchange?: (oldState: LegacyDryContactDevice, newState: LegacyDryContactDevice) => void;
  public onevent?: (event: Partial<SensorDeltaEvent>) => void;

  constructor(protected server: AxiosInstance, public device: LegacyDryContactDevice) {
    //
  }

  async get(): Promise<LegacyDryContactDevice> {
    const device: LegacyDryContactDevice = (await this.server.get(this.device._links.self.href)).data;
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

  async mode(value: 'perimeter' | 'entryExit' | string): Promise<CommandResponse> {
    return (await this.server.post('/client/icontrol/update/device', `path=${this.device._links.functionType.href}&value=${value}`)).data;
  }

}
export interface LegacyDryContactDevice {
  hardwareId: string;
  status: 'online' | string;
  technology: 'legacyAlarmPanel';
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
  deletable: boolean;
  deviceType: 'sensor';
  id: string;
  deviceSubtype: 'default';
  trouble: Trouble[];
  name: string;
  properties: {
    isFaulted: boolean;
    displayOrder: number;
    label: string;
    type: 'door' | 'window';
    isBypassed: boolean;
    functionType: 'entryExit' | 'perimeter';
  };
}