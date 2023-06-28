import { AxiosInstance } from 'axios';


export class Router {
  public onchange?: (oldState: RouterDevice, newState: RouterDevice) => void;

  constructor(protected server: AxiosInstance, public device: RouterDevice) {
    //
  }

  async get(): Promise<RouterDevice> {
    const device: RouterDevice = (await this.server.get(this.device._links.self.href)).data;
    if (this.onchange && (JSON.stringify(device) !== JSON.stringify(this.device))) {
      this.onchange(this.device, device);
    }
    this.device = device;
    return this.device;
  }
}
export interface RouterDevice {
  firmwareVersion: string;
  hardwareId: string;
  manufacturer: 'Netgear' | 'XFINITY';
  macAddress: string;
  status: 'online';
  technology: 'wifi';
  _links: {
    self: { href: string; };
  };
  model: 'WNR1000' | 'Gateway' | string;
  deletable: boolean;
  deviceType: 'peripheral';
  name: 'Network Peripheral';
  properties: { type: 'router' | 'Gateway'; label: 'Network Peripheral'; };
  icontrolModel: 'WNR1000' | 'Gateway' | string;
  id: string;
  deviceSubtype: 'default';
  trouble: {
    description: string;
    name: 'senTamp' | string;
    criticality: boolean;
    timestamp: number;
  }[];
}