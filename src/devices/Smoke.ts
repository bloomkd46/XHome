/** Issue #17 */
import { AxiosInstance } from 'axios';

import { CommandResponse } from '../GlobalInterfaces';


export class Smoke {
  public onchange?: (oldState: SmokeDevice, newState: SmokeDevice) => void;
  public onevent?: (event: any) => void;

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
//TODO: add event interfaces
export type SmokeDeltaEvent = SmokeFaultEvent | SmokeTroubleEvent | SmokeUpdateEvent;
export interface SmokeFaultEvent {
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
export interface SmokeTroubleEvent {
  commandId: string;
  deviceId: string;
  mediaType: 'event/zone';
  timestamp: number;
  name: 'trouble';
  value: 'senTamp' | 'senTampRes';
  channel: 'B';
  metadata: {
    eventTime: string;
    sensorTemperature: string;
    sensorNearFarSignal: string;
    sensorBatteryVoltage: string;
    sensorNearFarRF: string;
  };
}
export interface SmokeUpdateEvent {
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
export interface SmokeEvent {
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
export interface SmokeDevice {
  firmwareVersion: string;
  hardwareId: string;
  hardwareVersion: string;
  manufacturer: string;
  serialNumber: string;
  status: 'online' | string;
  technology: 'zigbee' | 'wifi';
  deviceHelp?: {
    deviceType: 'Smoke Detector';
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
  deviceSubtype: 'smoke';
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
    type: 'smoke';
    sensorType: 'smoke';
    temperature: number;
    functionType: 'fire24Hr';
    nearFarSignal: string;
  };
  icontrolModel: string;
}