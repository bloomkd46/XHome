import axios from 'axios';
import { Writable } from 'stream';
import XHome from '..';
import { CommandResponse, DeltaEvent } from '../GlobalInterfaces';

export default class Camera {
  public activityCallback?: (event: string) => void;
  public streamingInfo!: StreamingInfo;

  constructor(
    public xhome: XHome, public device: CameraDevice,
  ) {
    xhome.events.on('activity', (data: DeltaEvent) => {
      if (data.deviceId === device.id) {
        if (data.mediaType === 'event/cameraAccess') {
          this.streamingInfo = data.metadata as StreamingInfo;
        }
        if (this.activityCallback) {
          this.activityCallback(JSON.stringify(data));
        }
      }
    });
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    //this.streamingInfo = require('../../test.streamingInfo.json');
  }

  get(): Promise<CameraDevice> {
    return new Promise((resolve, reject) => {
      axios({
        method: 'get',
        url: `https://xhomeapi-lb-prod.codebig2.net${this.device._links.self.href}`,
        headers: {
          'Host': 'xhomeapi-lb-prod.codebig2.net',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Connection': 'keep-alive',
          'X-Client-Features': 'auth4all,carousel,carousel-devicedeeplink,no-cookie,deeplinkV1',
          'Xh-Auth': this.xhome.xhAuth,
          'Accept': 'application/json',
          'Authorization': `${this.xhome.tokenType} ${this.xhome.accessToken}`,
          'Accept-Language': 'en-us',
          'Accept-Encoding': 'gzip, deflate, br',

        },
        validateStatus: (status) => {
          return status === 200;
        },
        timeout: 60000,
        timeoutErrorMessage: 'Request Timed Out',
      }).then(response => {
        this.device = response.data;
        resolve(response.data);
      }).catch(err => reject(this.xhome.parseError(err)));
    });
  }

  getImageUrl(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.streamingInfo) {
        this.xhome.events.on('activity', data => {
          if (data.deviceId === this.device.id) {
            if (data.mediaType === 'event/cameraAccess') {
              this.streamingInfo = data.metadata as StreamingInfo;
              this.getImageUrl().then(url => resolve(url)).catch(err => reject(err));
            }
          }
        });
      } else {
        resolve(`https://${this.streamingInfo.imageUrl!.split('@')!.pop()!.replace(':443', '')}` +
          `&X-videoToken=app=comcastTokenKey;login=${this.xhome.Profile.site.extId}` +
          ';ts=1653937637651;sig=23C09E8CB460BBBBAABE647679F2B3E3');
      }
    });
  }

  getImage(writer: Writable): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.streamingInfo) {
        this.xhome.events.on('activity', data => {
          if (data.deviceId === this.device.id) {
            if (data.mediaType === 'event/cameraAccess') {
              this.streamingInfo = data.metadata as StreamingInfo;
              this.getImage(writer).then(() => resolve()).catch(err => reject(err));
            }
          }
        });
      } else {
        axios({
          method: 'get',
          url: `https://${this.streamingInfo.imageUrl!.split('@')!.pop()!.replace(':443', '')}` +
            `&X-videoToken=app=comcastTokenKey;login=${this.xhome.Profile.site.extId}` +
            ';ts=1653937637651;sig=23C09E8CB460BBBBAABE647679F2B3E3',
          headers: {
            'Host': this.streamingInfo.imageUrl!.split('@')!.pop()!.split('/')!.shift()!,
            'Accept': '*/*',
            'Accept-Language': 'en-us',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'gzip, deflate, br',
          },
          responseType: 'stream',
        }).then(response => {
          response.data.pipe(writer);
          writer.on('finish', () => resolve());
          writer.on('error', err => reject(err));
        }).catch(err => reject(this.xhome.parseError(err)));
      }
    });
  }

  getVideoUrl(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.streamingInfo) {
        this.xhome.events.on('activity', data => {
          if (data.deviceId === this.device.id) {
            if (data.mediaType === 'event/cameraAccess') {
              this.streamingInfo = data.metadata as StreamingInfo;
              this.getImageUrl().then(url => resolve(url)).catch(err => reject(err));
            }
          }
        });
      } else {
        resolve(`https://${this.streamingInfo.videoUrl!.split('@')!.pop()!.replace(':443', '')}` +
          `&X-videoToken=app=comcastTokenKey;login=${this.xhome.Profile.site.extId}` +
          ';ts=1653937637651;sig=23C09E8CB460BBBBAABE647679F2B3E3');
      }
    });
  }

  getVideo(writer: Writable): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.streamingInfo) {
        this.xhome.events.on('activity', data => {
          if (data.deviceId === this.device.id) {
            if (data.mediaType === 'event/cameraAccess') {
              this.streamingInfo = data.metadata as StreamingInfo;
              this.getVideo(writer).then(() => resolve()).catch(err => reject(err));
            }
          }
        });
      } else {
        axios({
          method: 'get',
          url: `https://${this.streamingInfo.videoUrl!.split('@')!.pop()!.replace(':443', '')}` +
            `&X-videoToken=app=comcastTokenKey;login=${this.xhome.Profile.site.extId}` +
            ';ts=1653937637651;sig=23C09E8CB460BBBBAABE647679F2B3E3',
          headers: {
            'Host': this.streamingInfo.videoUrl!.split('@')!.pop()!.split('/')!.shift()!,
            'Accept': '*/*',
            'Accept-Language': 'en-us',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'gzip, deflate, br',
          },
          responseType: 'stream',
        }).then(response => {
          response.data.pipe(writer);
          writer.on('finish', () => resolve());
          writer.on('error', err => reject(err));
        }).catch(err => reject(this.xhome.parseError(err)));
      }
    });
  }

  label(value: string): Promise<CommandResponse> {
    return new Promise((resolve, reject) => {
      const body = `path=${this.device._links.label.href}&value=${value}`;
      axios({
        method: 'post',
        url: 'https://xhomeapi-lb-prod.codebig2.net/client/icontrol/update/device',
        data: body,
        headers: {
          'Host': 'xhomeapi-lb-prod.codebig2.net',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Connection': 'keep-alive',
          'X-Client-Features': 'auth4all,carousel,carousel-devicedeeplink,no-cookie,deeplinkV1',
          'Xh-Auth': this.xhome.xhAuth,
          'Accept': 'application/json',
          'Authorization': `${this.xhome.tokenType} ${this.xhome.accessToken}`,
          'Accept-Language': 'en-us',
          'Accept-Encoding': 'gzip, deflate, br',
          'Content-Length': body.length,

        },
        validateStatus: (status) => {
          return status === 200;
        },
        timeout: 60000,
        timeoutErrorMessage: 'Request Timed Out',
      }).then(response => resolve(response.data)).catch(err => reject(this.xhome.parseError(err)));
    });
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