import { Camera, CameraDevice } from './devices/Camera';
import { DryContact, DryContactDevice } from './devices/DryContact';
import { Keyfob, KeyfobDevice } from './devices/Keyfob';
import { Keypad, KeypadDevice } from './devices/Keypad';
import { LegacyDryContact, LegacyDryContactDevice } from './devices/LegacyDryContact';
import { LegacyMotion, LegacyMotionDevice } from './devices/LegacyMotion';
import { Light, LightDevice } from './devices/Light';
import { Motion, MotionDevice } from './devices/Motion';
import { Panel, PanelDevice } from './devices/Panel';
import { Router, RouterDevice } from './devices/Router';
import { Smoke, SmokeDevice } from './devices/Smoke';
import { Unknown, UnknownDevice } from './devices/Unknown';
import { Water, WaterDevice } from './devices/Water';


export type Device = Light | Panel | Smoke | Water | Motion | LegacyMotion | DryContact | LegacyDryContact | Keypad | Keyfob | Router |
  Camera | Unknown;
export type RawDevice = LightDevice | PanelDevice | SmokeDevice | WaterDevice | MotionDevice | LegacyMotionDevice | DryContactDevice |
  LegacyDryContactDevice | KeypadDevice | KeyfobDevice | RouterDevice | CameraDevice | UnknownDevice;
/*export type DeltaEvent = LightDeltaEvent | SmokeDeltaEvent | WaterDeltaEvent | MotionDeltaEvent | PanelDeltaEvent | DryContactDeltaEvent |
  LegacyDryContactDeltaEvent | CameraDeltaEvent;*/

export interface Trouble {
  description: string;
  name: 'senTamp' | 'senPreLowBat' | /*???-->*/'senLowBat'/*<--???*/ | string;
  criticality: boolean;
  timestamp: number;
}
export interface SensorLinks {
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
  isBypassed?: {
    method: 'POST';
    href: string;
  };
}
export interface SensorProperties {
  isFaulted: boolean;
  serialNumber: string;
  batteryVoltage: number;
  displayOrder: number;
  nearFarRF: string;
  label: string;
  type: string;
  sensorType: string;
  temperature: number;
  functionType: string;
  nearFarSignal: string;
  isBypassed?: boolean;
}
export interface SensorDevice {
  firmwareVersion: string;
  hardwareId: string;
  hardwareVersion: string;
  manufacturer: string;
  serialNumber: string;
  status: 'online' | string;
  technology: 'zigbee' | 'wifi';
  deviceHelp?: {
    deviceType: string;
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
  _links: SensorLinks;
  model: string;
  deletable: boolean;
  deviceType: 'sensor';
  id: string;
  deviceSubtype: string;
  trouble: Trouble[];
  name: string;
  properties: SensorProperties;
  icontrolModel: string;
}
export type SensorDeltaEvent = FaultDeltaEvent | TroubleDeltaEvent | UpdateDeltaEvent;

/**Sensor Faulted */
export interface FaultDeltaEvent {
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
/** Sensor encounters trouble */
export interface TroubleDeltaEvent {
  commandId: string;
  deviceId: string;
  mediaType: 'event/zone';
  timestamp: number;
  name: 'trouble';
  value: 'senTamp' | 'senTampRes' | 'senPreLowBat' | 'senLowBat';
  channel: 'B';
  metadata: {
    eventTime: string;
    sensorTemperature: string;
    sensorNearFarSignal: string;
    sensorBatteryVoltage: string;
    sensorNearFarRF: string;
  };
}
/** Sensor status changed (bypassed/function type changed) */
export interface UpdateDeltaEvent {
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

export interface LoginResponse {
  access_token: string;
  token_type: 'Bearer';
  refresh_token: string;
  expires_in: number;
  scope: string;
  id_token: string;
  XhAuth: string;
  //spsId: string;
}

export interface Profile {
  address: {
    city: string;
    country: 'US';
    postalCode: string;
    state: string;
    street1: string;
    verified: boolean;
  };
  contacts: Contact[];
  cmsInfo: {
    siteMonitored: boolean;
    permitExpirationDate: null | string;
    permitNumber: null | number | string;
  };
  emergencyContacts: EmergencyContact[];
  groups: Group[];
  site: {
    active: boolean;
    suspended: boolean;
    timeZone: string;
    product: {
      alarmEnabled: boolean;
      cellularEnabled: boolean;
      cpeRestApiEnabled: boolean;
      localAppEnabled: boolean;
      monitorable: boolean;
      name: 'converge' | string;
      sceneEnabled: boolean;
      securityZoneEnabled: boolean;
      takeoverEnabled: boolean;
    };
    id: string;
    extId: string;
    isNewUser: boolean;
  };
  users: User[];
  devices: Device[];
  xhomeProperties: {
    hasIcontrolAccount: boolean;
    clientDeltaUri: 'https://xhomeapi-lb-prod.apps.cloud.comcast.net/client/icontrol/delta?spsId={spsId}' | string;
    moleculeIotUrl: 'https://hub.iot.comcast.net' | string;
    mediaUriRoot: 'https://edge.xfinity-home-api.top.comcast.net' | string;
    cvrFilterList: ['People', 'Vehicles' | 'Pets'] | string[];
  };
  profile: {
    accountInfo: {
      accountNumber: string;
      accountGuid: string;
    };
    features: ['MOBILE_CHAT', 'CAROUSEL'] | string[];
  };
  quotas: Quota[];
  sessionInfo: {
    sessionHeaderValue: string;
    primaryUser: boolean;
    userTrials: ['byPass', 'videoshare', 'AudioForCVR', 'evotrial', 'Xcam2Onboarding'] | string[];
    hasIcontrolAccount: boolean;
    accountTier: 'SECURE' | string;
    authGuidHash: string;
    displayName: string;
  };
  account: {
    accountTier: 'Secure' | string;
    installType: string;
    timeZone: string;
  };
  molecule: {
    deviceCount: number;
  };
  carousel: {
    enteries: Entry[];
  };
  cvrProperties: {
    filters: ['People', 'Vehicles' | 'Pets'] | string[];
    allCamerasToken: {
      token: string;
      expires_in: number;
    };
    _links: {
      allCamerasToken: {
        href: string;
      };
      eventSummary: {
        templated: boolean;
        href: string;
      };
    };
  };
}

interface Contact {
  firstName: string;
  lastName: string;
  primary: boolean;
  active: boolean;
  index: number;
  contactId: string;
  phones: Phone[];
  emails: Email[];
}

interface Phone {
  phoneNumber: string;
  phoneType: 'MOBILE' | string;
  order: number;
  id: string;
  type: 'Mobile' | string;
}

interface Email {
  order: number;
  id: string;
  email: string;
}

interface EmergencyContact {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  phoneType: 'Mobile' | string;
  type: 'Verify' | 'Notify';
  index: number;
  contactId: string;
}

interface Group {
  description: 'XH-Secure' | 'GatewayRMA' | 'Cloud continuous video recording';
  name: 'XH-Secure' | 'GatewayRMA' | 'xCVR';
  type: 'tier' | 'package';
  allowableNumberOfDevices: null | number;
  maximumAllowedEntitlements: null | number;
  retentionDays: null | number;
  state: null | string;
}

interface User {
  emailAddress: string;
  isSSO: 'N' | string;
  primary: boolean;
  status: 'active' | string;
  userId: string;
  firstName: string;
  lastName: string;
}

interface Quota {
  name: 'imageDailyCount' | 'videoDailyCount' | 'smsDailyLimit' | 'smsDailyCount' | 'imageUploadDailyLimit' | 'videoUploadDailyLimit';
  value: number;
  timestamp: number;
}

interface Entry {
  images: Image[];
  title: string;
  description: string;
  actionURL: string;
  name: string;
}

interface Image {
  url: string;
  height: number;
  width: number;
}
/*
export interface DeltaEventInt {
  commandId: string | null;
  deviceId: string | null;
  mediaType: 'event/zone' | 'event/securityStateChange' | 'event/cpeCommand' | 'event/cameraAccess' | 'event/lighting';
  timestamp: number;
  name: 'isFaulted' | 'trouble' | null;
  value: 'false' | 'true' | null;
  channel?: 'B' | string | null;
  metadata: {
    eventTime: string;
  };
}

export interface Event {
  channel: 'B' | string;
  eventId: string;
  eventName?: 'isFaulted' | 'trouble';
  instanceId?: string;
  mediaType: 'event/zone' | 'event/zoneTrouble' | 'event/armDisarm';
  timestamp: number;
  value: boolean | 'disarmed' | 'armedNight' | 'armedAway' | 'armedStay' | 'exitDelay' | 'zoneSwingerShutdown' | 'zoneSwingerShutdownRes';
  properties: {
    temperature?: number;
    nearFarRF?: string;
    eventTime: string;
    isFaulted?: boolean;
    batteryVoltage?: number;
    nearFarSignal?: string;
    faultOnEventTime?: number;

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


    armLocation?: 'Server' | 'CpeKeypad';
    //eventTime: string;
    user?: 'Master';
    exitDelay?: 120;
  };
  eventType: 'fault' | 'faultOnOff' | 'armDisarm' | 'trouble' | 'faultAlarm';
  eventSubType?: 'disarmed' | 'arming' | 'armedStay' | 'armedAway' | 'armedNight' | 'zone';
  isFaulted?: boolean;
  troubleType?: 'zoneSwingerShutdown' | 'zoneSwingerShutdownRes';
  recordingInfo: RecordingInfo[];
}
*/
export interface RecordingInfo {
  recType: 'image' /*???| 'video'???*/;
  instanceId: string;
  fromRule: boolean;
  ts: number;
  media: Media[];
}
interface Media {
  thumb: string;
  deleteUrl: string;
  deleteThumb: string;
  url: string;
  id: string;
}

export interface CommandResponse {
  commandId: string;
  status: 'unknown';
}

export interface XHomeError {
  name: string;
  message: string;
  request?: {
    method: 'GET' | 'POST';
    protocol: 'https:' | 'http:';
    host: string;
    path: string;
    headers: string[];
  };
  response?: {
    statusCode: number;
    statusMessage: string;
    headers: object;
    data: object;
  };
}
export interface StreamingConfig {
  codecs?: string[];
  formats?: string[];
}