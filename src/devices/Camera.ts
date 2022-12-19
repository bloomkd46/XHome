import axios, { AxiosInstance } from 'axios';

import { CommandResponse } from '../GlobalInterfaces';



export class Camera {
  public onchange?: (oldState: CameraDevice, newState: CameraDevice) => void;
  public onevent?: (event: CameraDeltaEvent) => void;

  public streamingInfo?: StreamingInfo;

  constructor(protected server: AxiosInstance, public device: CameraDevice, protected watchdog: boolean) {
    //
  }

  async get(): Promise<CameraDevice> {
    const device: CameraDevice = (await this.server.get(this.device._links.self.href.replace('/client/icontrol', ''))).data;
    if (this.onchange && (JSON.stringify(device) !== JSON.stringify(this.device))) {
      this.onchange(this.device, device);
    }
    this.device = device;
    return this.device;
  }

  async label(value: string): Promise<CommandResponse> {
    return (await this.server.post('/update/device', `path=${this.device._links.label.href}&value=${value}`)).data;
  }

  async requestCameraAccess(): Promise<CommandResponse> {
    if (this.watchdog === false) {
      return Promise.reject(new Error('Watchdog Inactive'));
    }
    return (await this.server.post('/devices/cameras/startMultiAccess', JSON.stringify({
      videoTokenAppKey: 'comcastTokenKey',
      cameras: [{
        instanceId: this.device.id,
        codec: this.device.properties.videoCodec.split(',').pop(),
        format: this.device.properties.videoFormat.split(',').shift(),
      }],
      alwaysSendCameraAccessEventFlag: true,
    }), {
      headers: {
        'Content-Type': 'application/json',

      },
    })).data;
  }
}
export interface CameraDevice {
  webrtcCapable: boolean;
  xboOnly: boolean;
  firmwareVersion: string;
  hardwareId: string;
  manufacturer: string;
  serialNumber: string;
  macAddress: string;
  status: 'online' | string;
  technology: 'wifi' | 'zigbee';
  _links: {
    self: {
      href: string;
    };
    label: {
      method: 'POST';
      href: string;
    };
  };
  cvr: {
    capable: boolean;
    enabled: boolean;
    cvrToken: {
      token: string;
      expires_in: number;
    };
    incapableReason: 'MODEL_NOT_CAPABLE' | string;
  };
  model: string;
  deletable: boolean;
  deviceType: 'camera';
  id: string;
  deviceSubtype: 'default';
  trouble: unknown[];
  name: string;
  properties: {
    videoFormat: 'MJPEG,FLV,RTSP' | string;
    aspectRatio: '4:3' | string;
    label: string;
    motionCapable: boolean;
    resolution: '640:480' | string;
    isVideoRecordable: boolean;
    videoCodec: 'H264,MPEG4' | string;
  };
  icontrolModel: string;
}
export type CameraDeltaEvent = Record<string, any>;
export interface StreamingInfo {
  proxyUrl: unknown | null;
  ainfo: string;
  label: string;
  internalVideoUrl: string;
  internalImageUrl: string;
  timeout: string;
  proxyAuth: unknown | null;
  videoUrl: string;
  imageUrl: string;
  eventTime: string;
  time: string;
  status: 'started';
}