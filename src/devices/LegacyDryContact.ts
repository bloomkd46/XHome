/* Issue #15, #16, #18 */
import { AxiosInstance } from 'axios';

import { CommandResponse } from '../GlobalInterfaces';


export class LegacyDryContact {
  public onchange?: (oldState: LegacyDryContactDevice, newState: LegacyDryContactDevice) => void;
  public onevent?: (event: LegacyDryContactDeltaEvent) => void;

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
export type LegacyDryContactDeltaEvent = LegacyDryContactFaultEvent | LegacyDryContactTroubleEvent | LegacyDryContactUpdateEvent;
export interface LegacyDryContactFaultEvent {
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
export interface LegacyDryContactTroubleEvent {
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
export interface LegacyDryContactUpdateEvent {
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
export interface LegacyDryContactEvent {
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
  trouble: {
    description: string;
    name: 'senTamp' | string;
    criticality: boolean;
    timestamp: number;
  }[];
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