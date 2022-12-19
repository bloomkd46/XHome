import { AxiosInstance } from 'axios';

import { CommandResponse } from '../GlobalInterfaces';


export class Motion {
  public onchange?: (oldState: MotionDevice, newState: MotionDevice) => void;
  public onevent?: (event: MotionDeltaEvent) => void;

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
export type MotionDeltaEvent = MotionZoneEvent;
export interface MotionZoneEvent {
  commandId: string;
  deviceId: string;
  mediaType: 'event/zone';
  timestamp: number;
  name: 'isFaulted';
  value: 'false' | 'true';
  channel: 'B';
  metadata: {
    eventTime: string;
    sensorTemperature: string;
    sensorNearFarSignal: string;
    sensorBatteryVoltage: string;
    sensorNearFarRF: string;
  };
}

export interface MotionDevice {
  firmwareVersion: string;
  hardwareId: string;
  hardwareVersion: string;
  manufacturer: string;
  serialNumber: string;
  status: 'online' | string;
  technology: 'zigbee' | 'wifi';
  deviceHelp: {
    deviceType: 'Motion Sensor';
    manufacturer: string;
    model: string;
    iconUrl: string;
    batteryRequired: string;
    batteryType: string;
    batteryCount: string;
    batterySelfInstall: 'Self' | string;
    batteryReplacementWebUrl: string;
    batteryReplacementMobileUrl: string;
    batteryPurchaseLink: string;
  };
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
  model: string;
  deletable: boolean;
  deviceType: 'sensor';
  id: string;
  deviceSubtype: 'default';
  trouble: {
    description: string;
    name: 'senTamp' | string;
    criticality: boolean;
    timestamp: number;
  }[];
  name: string;
  properties: {
    isFaulted: boolean;
    serialNumber: string;
    batteryVoltage: number;
    displayOrder: number;
    nearFarRF: string;
    label: string;
    type: 'motion';
    sensorType: 'motion';
    temperature: number;
    isBypassed: boolean;
    functionType: 'monitor24Hr' | string;
    nearFarSignal: string;
  };
  icontrolModel: string;
}