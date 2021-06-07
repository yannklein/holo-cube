import { brfv5 }                    from './brfv5/brfv5__init.js'
import { loadBRFv5Model }           from './brfv5/brfv5__init.js'
import { configureCameraInput }     from './brfv5/brfv5__configure.js'
import { configureFaceTracking }    from './brfv5/brfv5__configure.js'
import { configureNumFacesToTrack } from './brfv5/brfv5__configure.js'
import { startCamera }              from './utils/utils__camera.js'
import { drawInputMirrored }        from './utils/utils__canvas.js'
import { drawCircles }              from './utils/utils__canvas.js'
import { drawRect, drawRects }      from './utils/utils__canvas.js'

const initBrf = () => {
  const _appId          = 'brfv5.browser.minimal.modules' // (mandatory): 8 to 64 characters, a-z . 0-9 allowed
  
  const _webcam         = document.getElementById('_webcam')
  const _imageData      = document.getElementById('_imageData')
  
  // Those variables will be retrieved from the stream and the library.
  let _brfv5Manager     = null
  let _brfv5Config      = null
  let _width            = 0
  let _height           = 0
  
  // loadBRFv5Model and openCamera are being done simultaneously thanks to Promises. Both call
  // configureTracking which only gets executed once both Promises were successful. Once configured
  // trackFaces will do the tracking work and draw the results.
  
  startCamera(_webcam, { width: 640, height: 480, frameRate: 30, facingMode: 'user' }).then(({ video }) => {
  
    console.log('openCamera: done: ' + video.videoWidth + 'x' + video.videoHeight)
  
    _width            = video.videoWidth
    _height           = video.videoHeight
  
    _imageData.width  = _width
    _imageData.height = _height
  
    configureTracking()
  
  }).catch((e) => { if(e) { console.error('Camera failed: ', e) } })
  
  loadBRFv5Model('68l', 8, './brfv5/models/', _appId,
    (progress) => { console.log(progress) }).then(({ brfv5Manager, brfv5Config }) => {
  
    console.log('loadBRFv5Model: done')
  
    _brfv5Manager  = brfv5Manager
    _brfv5Config   = brfv5Config
  
    configureTracking()
  
  }).catch((e) => { console.error('BRFv5 failed: ', e) })
  
  const configureTracking = () => {
  
    if(_brfv5Config !== null && _width > 0) {
  
      configureCameraInput(_brfv5Config, _width, _height)
      configureNumFacesToTrack(_brfv5Config, 1)
      configureFaceTracking(_brfv5Config, 3, true)
  
      _brfv5Manager.configure(_brfv5Config)
  
      trackFaces()
    }
  }
  
  const trackFaces = () => {
  
    if(!_brfv5Manager || !_brfv5Config || !_imageData) { return }
  
    const ctx = _imageData.getContext('2d')
  
    drawInputMirrored(ctx, _width, _height, _webcam)
  
    _brfv5Manager.update(ctx.getImageData(0, 0, _width, _height))
  
    let doDrawFaceDetection = !_brfv5Config.enableFaceTracking
  
    if(_brfv5Config.enableFaceTracking) {
  
      const sizeFactor = Math.min(_width, _height) / 480.0
      const faces      = _brfv5Manager.getFaces()
  
      for(let i = 0; i < faces.length; i++) {
  
        const face = faces[i]
  
        if(face.state === brfv5.BRFv5State.FACE_TRACKING) {
  
          drawRect(ctx, _brfv5Config.faceTrackingConfig.regionOfInterest, '#00a0ff', 2.0)
  
          drawCircles(ctx, face.landmarks, '#00a0ff', 2.0 * sizeFactor)
          drawRect(ctx, face.bounds, '#ffffff', 1.0)
  
        } else {
  
          doDrawFaceDetection = true
        }
      }
    }
  
    if(doDrawFaceDetection) {
  
      // Only draw face detection results, if face detection was performed.
  
      drawRect( ctx, _brfv5Config.faceDetectionConfig.regionOfInterest, '#ffffff', 2.0)
      drawRects(ctx, _brfv5Manager.getDetectedRects(), '#00a0ff', 1.0)
      drawRects(ctx, _brfv5Manager.getMergedRects(), '#ffffff', 3.0)
    }
  
    requestAnimationFrame(trackFaces)
  }
}

export { initBrf };