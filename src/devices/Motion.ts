import { AxiosInstance } from 'axios';

import { CommandResponse, SensorDeltaEvent, SensorDevice, SensorLinks, SensorProperties } from '../GlobalInterfaces';


export class Motion {
  public onchange?: (oldState: MotionDevice, newState: MotionDevice) => void;
  public onevent?: (event: SensorDeltaEvent) => void;

  constructor(protected server: AxiosInstance, public device: MotionDevice) {
    //
  }

  async get(): Promise<MotionDevice> {
    const device: MotionDevice = (await this.server.get(this.device._links.self.href)).data;
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

  async mode(value: 'monitor24Hr' | string): Promise<CommandResponse> {
    return (await this.server.post('/client/icontrol/update/device', `path=${this.device._links.functionType.href}&value=${value}`)).data;
  }

}

export interface MotionDevice extends SensorDevice {
  _links: {
    isBypassed: {
      method: 'POST';
      href: string;
    };
  } & SensorLinks;
  properties: {
    type: 'motion';
    sensorType: 'motion';
    functionType: 'monitor24Hr' | string;
    isBypassed: boolean;
  } & SensorProperties;
}