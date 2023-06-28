/** Issue #17 */
import { AxiosInstance } from 'axios';

import { CommandResponse, SensorDeltaEvent, SensorDevice, SensorProperties } from '../GlobalInterfaces';


export class Water {
  public onchange?: (oldState: WaterDevice, newState: WaterDevice) => void;
  public onevent?: (event: SensorDeltaEvent) => void;

  constructor(protected server: AxiosInstance, public device: WaterDevice) {
    //
  }

  async get(): Promise<WaterDevice> {
    const device: WaterDevice = (await this.server.get(this.device._links.self.href)).data;
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
export interface WaterDevice extends SensorDevice {
  deviceSubtype: 'water';
  properties: {
    type: 'water';
    sensorType: 'water';
    functionType: 'audible24Hr';
  } & SensorProperties;
}