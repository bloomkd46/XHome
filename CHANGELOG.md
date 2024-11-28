### 2.8.6 
* Fixed a potential bug that could cause requests to hang indefinitely


### 2.8.5 
* Removed the timeout introduced by the previous version from the watchdog


### 2.8.4 
* Added a 8 second timeout (Hap-NodeJS times out after 9 seconds)



### 2.8.3 
* Fixed a potential login bug


### 2.8.2 
* Updated Watchdog to handle socket hang-up errors


### 2.8.1 
* Fixed linting error


### 2.8.0 
* Added support for legacy motion sensors


### 2.7.2 
* Added gateways to router class


### 2.7.1 
* Fixed isBypassed bug


### 2.7.0 
* Added low battery trouble support


### 2.6.0 
* Added support for water detectors


### 2.5.1 
* Added missing export statement


### 2.5.0 
Added support for the following devices:
 * Smoke Detectors
 * Legacy Door Sensors
 * Legacy Window Sensors
 * Legacy Glass Break Sensors
 * Legacy Keypads


### 2.4.0 
* Added armed and alarm Status Codes To Panel


### 2.3.1 
* Added optional error handler for watchdog


### 2.3.0 
* Added watchdog options
* Better event types


### 2.2.1 
* Fixed plugin crashing when XH-Auth token expired


### 2.2.0 
* Added Router


### 2.1.3 
* Fixed api url typo


### 2.1.2 
* Added UnknownDevice to RawDevice type
* Change false to boolean in trouble type



### 2.1.1

* Added trouble type

### 2.1.0

* Security Improvements

### 2.0.0

* Massive performance rewrite

### 1.2.0

* Added (Unverified) faultAlarm to panel

### 1.1.2

* Applied temporary fix to initialization failing if using next-gen cameras

### 1.1.1

* Fixed Crash When No Camera's On Account
* Added StreamingConfig Input Parameter

### 1.1.0

* Added GetImage function to camera's
* Added GetVideo function to camera's (unverified)
* Bug Fixes
* Added Debug Logging

### 1.0.2

* Added 'entryDelay' to the panel interface

### 1.0.1

* Changed request timeouts from 3 seconds to 60 seconds for slow connections

### 1.0.0

Initial Release
