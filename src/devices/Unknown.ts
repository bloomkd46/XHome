import { AxiosInstance } from 'axios';



export class Unknown {
  public onchange?: (oldState: UnknownDevice, newState: UnknownDevice) => void;

  constructor(protected server: AxiosInstance, public device: Record<string, any>) {
    //
  }

  async get(): Promise<UnknownDevice> {
    const device: UnknownDevice = (await this.server.get(this.device._links.self.href.replace('/client/icontrol', ''))).data;
    if (this.onchange && (JSON.stringify(device) !== JSON.stringify(this.device))) {
      this.onchange(this.device, device);
    }
    this.device = device;
    return this.device;
  }
}
export type UnknownDevice = Record<string, any>;