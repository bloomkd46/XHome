import { AxiosInstance } from 'axios';

import { CommandResponse } from '../GlobalInterfaces';



export class DryContact {
  public onchange?: (oldState: DryContactDevice, newState: DryContactDevice) => void;
  public onevent?: (event: DryContactDeltaEvent) => void;

  constructor(protected server: AxiosInstance, public device: DryContactDevice) {
    //
  }

  async get(): Promise<DryContactDevice> {
    const device: DryContactDevice = (await this.server.get(this.device._links.self.href.replace('/client/icontrol', ''))).data;
    if (this.onchange && (JSON.stringify(device) !== JSON.stringify(this.device))) {
      this.onchange(this.device, device);
    }
    this.device = device;
    return this.device;
  }

  async label(value: string): Promise<CommandResponse> {
    return (await this.server.post('/update/device', `path=${this.device._links.label.href}&value=${value}`)).data;
  }

  async bypass(value: boolean): Promise<CommandResponse> {
    return (await this.server.post('/update/device', `path=${this.device._links.isBypassed.href}&value=${value}`)).data;
  }

  async mode(value: 'perimeter' | 'entryExit' | string): Promise<CommandResponse> {
    return (await this.server.post('/update/device', `path=${this.device._links.functionType.href}&value=${value}`)).data;
  }

}
export type DryContactDeltaEvent = DryContactZoneEvent | DryContactUpdateEvent;
export interface DryContactZoneEvent {
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
export interface DryContactUpdateEvent {
  commandId: string;
  deviceId: string;
  mediaType: 'event/zoneUpdated';
  timestamp: number;
  name: null;
  value: null;
  channel: null;
  metadata: {
    displayOrder: string;
    eventTime: string;
    isBypassed: 'true' | 'false';
    label: string;
    functionType: 'perimeter' | 'entryExit';
    type: 'door' | 'window';
  };
}
export interface DryContactEvent {
  channel: 'B' | string;
  eventId: string;
  eventName: 'isFaulted' | 'trouble';
  instanceId: string;
  mediaType: 'event/zone' | 'event/zoneTrouble';
  timestamp: number;
  value: boolean | 'zoneSwingerShutdown' | 'zoneSwingerShutdownRes';
  properties: {
    isFaulted?: boolean;
    faultOnEventTime?: number;
    isCritical?: boolean;
    batteryVoltage: number;
    temperature?: number;
    nearFarRF: string | null;
    eventTime: string;
    nearFarSignal: string | null;

    //isFaulted?: boolean
    alarmStartDate?: number;
    alarmLabel?: 'Alarm Started';
    alarmEndDate?: number;
    //batteryVoltage?: number
    //nearFarRF?: string
    alarmSessionId?: string;
    isTestAlarm?: boolean;
    isAcked?: boolean;
    imageUrls?: string[];
    //temperature?: number
    isDuressAlarm?: boolean;
    //eventTime: string;
    //nearFarSignal?: string
  };
  eventType: 'faultOnOff' | 'fault' | 'trouble';
  eventSubType?: 'zone';
  troubleType?: 'zoneSwingerShutdown' | 'zoneSwingerShutdownRes';
  isFaulted?: boolean;
  recordingInfo: unknown[];
}
export interface DryContactDevice {
  firmwareVersion: string;
  hardwareId: string;
  hardwareVersion: string;
  manufacturer: string;
  serialNumber: string;
  status: 'online' | string;
  technology: 'zigbee' | 'wifi';
  deviceHelp?: {
    deviceType: 'Door Window';
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
  trouble: unknown[];
  name: string;
  properties: {
    isFaulted: boolean;
    serialNumber: string;
    batteryVoltage: number;
    displayOrder: number;
    nearFarRF: string;
    label: string;
    type: 'door' | 'window';
    sensorType: 'dryContact';
    temperature: number;
    isBypassed: boolean;
    functionType: 'entryExit' | 'perimeter';
    nearFarSignal: string;
  };
  icontrolModel: string;
}