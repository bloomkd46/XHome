import { Camera, CameraDeltaEvent, CameraDevice } from './devices/Camera';
import { DryContact, DryContactDeltaEvent, DryContactDevice } from './devices/DryContact';
import { Keyfob, KeyfobDevice } from './devices/Keyfob';
import { Keypad, KeypadDevice } from './devices/Keypad';
import { LegacyDryContact, LegacyDryContactDeltaEvent, LegacyDryContactDevice } from './devices/LegacyDryContact';
import { Light, LightDeltaEvent, LightDevice } from './devices/Light';
import { Motion, MotionDeltaEvent, MotionDevice } from './devices/Motion';
import { Panel, PanelDeltaEvent, PanelDevice } from './devices/Panel';
import { Router, RouterDevice } from './devices/Router';
import { Smoke, SmokeDeltaEvent, SmokeDevice } from './devices/Smoke';
import { Unknown, UnknownDevice } from './devices/Unknown';


export type Device = Light | Panel | Smoke | Motion | DryContact | LegacyDryContact | Keypad | Keyfob | Router | Camera | Unknown;
export type RawDevice = LightDevice | PanelDevice | SmokeDevice | MotionDevice | DryContactDevice | LegacyDryContactDevice | KeypadDevice |
  KeyfobDevice | RouterDevice | CameraDevice | UnknownDevice;
export type DeltaEvent = LightDeltaEvent | SmokeDeltaEvent | MotionDeltaEvent | PanelDeltaEvent | DryContactDeltaEvent |
  LegacyDryContactDeltaEvent | CameraDeltaEvent;

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