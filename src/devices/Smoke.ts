/** Issue #17 */
import { AxiosInstance } from 'axios';

import { CommandResponse, SensorDeltaEvent, SensorDevice, SensorProperties } from '../GlobalInterfaces';


export class Smoke {
  public onchange?: (oldState: SmokeDevice, newState: SmokeDevice) => void;
  public onevent?: (event: SensorDeltaEvent) => void;

  constructor(protected server: AxiosInstance, public device: SmokeDevice) {
    //
  }

  async get(): Promise<SmokeDevice> {
    const device: SmokeDevice = (await this.server.get(this.device._links.self.href)).data;
    if (this.onchange && (JSON.stringify(device) !== JSON.stringify(this.device))) {
      this.onchange(this.device, device);
    }
    this.device = device;
    return this.device;
  }

  async label(value: string): Promise<CommandResponse> {
    return (await this.server.post('/client/icontrol/update/device', `path=${this.device._links.label.href}&value=${value}`)).data;
  }

  async mode(value: 'fire24Hr' | string): Promise<CommandResponse> {
    return (await this.server.post('/client/icontrol/update/device', `path=${this.device._links.functionType.href}&value=${value}`)).data;
  }
}

export interface SmokeDevice extends SensorDevice {
  deviceSubtype: 'smoke';
  properties: {
    type: 'smoke';
    sensorType: 'smoke';
    functionType: 'fire24Hr';
  } & SensorProperties;
}