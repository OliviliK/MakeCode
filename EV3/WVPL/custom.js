/**
 * @file    custom.ts
 *
 * Author           Olavi Kamppari (alias OliviliK, Ollie)
 * Date created:    12/29/2019
 * Last modified:   2/15/2020
 * MakeCode ver:    5.32.3
 * EV3 version:     1.4.20
 * EV3 firmware:    V1.10E
 *
 * Summary:
 *  Functions for common moves for EV3 robot using motor encoders,
 *  gyro sensor, and color sensor.
 *  Function to render a screen display with labels for the EV3 buttons
 *  Function to check the robot and calibrate gyro and color sensors
 */

// ========================= Local variables ==============================

let _rotation2cm: number        // distance in cm per 1 motor rotation
let _trackWidth: number         // distance in cm between the wheels

let _colorValL: number          // sensor reading of the Left color sensor
let _colorValR: number          //                       Right color sensor
let _colorMinL: number          // minimum value detected by Left sensor
let _colorMinR: number          //                           Right sensor
let _colorMaxL: number          // maximum value detected by Left sensor
let _colorMaxR: number          //                           Right sensor

let _trackingPrevValue:number   // line follower history value
let _trackingTargetValue:number // line follower target as absolute value

let _motors: motors.SynchedMotorPair
let _motorL: motors.Motor
let _motorR: motors.Motor
let _gyro: sensors.GyroSensor
let _gyroDef = false

let _colorL: sensors.ColorSensor
let _colorR: sensors.ColorSensor
let _colorDefL = false
let _colorDefR = false

let _isDisplaying: boolean  // function is still displaying something
let _isBusy: boolean        // function has not yet stopped displaying

//========================== Drive ========================================

//.......................... Drive Local Functions ........................

function motorSpeed(speed: number): number {
    if (_rotation2cm > 0) return speed
    return 0 - speed
}

function turnAngle2degrees(speed: number, turnAngle: number) {
    return (speed > 0)? turnAngle: 0 - turnAngle
}

function radius2turnRatio(radius: number): number {
    let trackWidthCount = radius / _trackWidth
    if (trackWidthCount < 0.5) {
        return 200
    } else {
        return 100 / trackWidthCount
    }
}

function completeTurn(degrees: number) {
    if (_gyroDef) {
        let target = _gyro.angle() + degrees
        if (degrees > 0) {
            while (_gyro.angle() < target);
        } else {
            while (_gyro.angle() > target);
        }
    }
    motors.stopAll()
}

//.......................... Drive Moves Public Functions .................
/**
 * moveStraight
 * leftDistance
 * rightDistance
 * resetDistances
 * turnRight
 * turnLeft
 * arcRight
 * arcLeft
 * gyroAngle
 * resetDrive
 * alignBack
 */

//% weight=100 color=#009900 icon="\ua66e"
namespace moves {
    /**
     * Move the robot on a straight line forward or backward
     * @param {number}  speed       Negative/backward, 0/stop, positive/forward
     * @param {number}  distance    In cm
     */
    //% block="move straight speed %speed for %distance cm"
    //% speed.min=-100 speed.max=100 speed.defl=60
    //% distance.min=0 distance.max=999 distance.defl=10
    //% group="Drive with Encoders and Gyro"
    export function moveStraight(speed: number, distance: number) {
        let rotations = distance / _rotation2cm
        _motors.steer(0, speed, rotations, MoveUnit.Rotations)
    }

    /**
     * Distance in cm as recorded by the left motor encoder
     */
    //% block="left wheel distance"
    //% group="Drive with Encoders and Gyro"
    export function leftDistance(): number {
        return _motorL.angle() * _rotation2cm / 360
    }

    /**
     * Distance in cm as recorded by the right motor encoder
     */
    //% block="right wheel distance"
    //% group="Drive with Encoders and Gyro"
    export function rightDistance(): number {
        return _motorR.angle() * _rotation2cm / 360
    }

    /**
     * Reset distance encoders in left and right motors
     */
    //% block="reset motor distances"
    //% group="Drive with Encoders and Gyro"
    export function resetDistances() {
        _motorL.clearCounts()
        _motorR.clearCounts()
    }

    /**
     * Turn right forward (speed>0 or backward (speed<0))
     * @param {number}  radius      For the left wheel in cm
     * @param {number}  speed       Negative/backward, 0/stop, positive/forward
     * @param {number}  turnAngle   Absolute change of gyro angle in degrees
     */
    //% block="turn right radius %radius cm speed %speed angle %turnAngle deg"
    //% radius.min=0 radius.max=999 radius.defl=0
    //% speed.min=-100 speed.max=100 speed.defl=60
    //% turnAngle.min=0 turnAngle.max=729 turnAngle.defl=90
    //% group="Drive with Encoders and Gyro"
    export function turnRight(radius: number, speed: number, turnAngle: number) {
        let degrees = turnAngle2degrees(speed,turnAngle)
        startArcRight(radius, speed)
        completeTurn(degrees)
    }

    /**
     * Turn left forward (speed>0) or backward (speed<0))
     * @param {number}  radius      For the right wheel in cm
     * @param {number}  speed       Negative/backward, 0/stop, positive/forward
     * @param {number}  turnAngle   Absolute change of gyro angle in degrees
     */
    //% block="turn left radius %radius cm speed %speed angle %turnAngle deg"
    //% radius.min=0 radius.max=999 radius.defl=0
    //% speed.min=-100 speed.max=100 speed.defl=60
    //% turnAngle.min=0 turnAngle.max=729 turnAngle.defl=90
    //% group="Drive with Encoders and Gyro"
    export function turnLeft(radius: number, speed: number, turnAngle: number) {
        let degrees = 0 - turnAngle2degrees(speed,turnAngle)
        startArcLeft(radius, speed)
        completeTurn(degrees)
    }

    /**
     * Move in an arc to right (speed>0) or backward (speed<0))
     * @param {number}  radius      For the left wheel in cm
     * @param {number}  speed       Negative/backward, 0/stop, positive/forward
     * @param {number}  distance    Absolute distance travelled by left wheel
     */
    //% block="arc right radius %radius cm speed %speed distance %distance cm"
    //% radius.min=0 radius.max=999 radius.defl=0
    //% speed.min=-100 speed.max=100 speed.defl=60
    //% distance.min=0 distance.max=999 distance.defl=10
    //% group="Drive with Encoders and Gyro"
    export function arcRight(radius: number, speed: number, distance: number) {
        let turnRatio = radius2turnRatio(radius)
        let rotations = distance / _rotation2cm
        _motors.steer(turnRatio, speed, rotations, MoveUnit.Rotations)
    }

    /**
     * Move in an arc left (speed>0 or backward (speed<0))
     * @param {number}  radius      For the right wheel in cm
     * @param {number}  speed       Negative/backward, 0/stop, positive/forward
     * @param {number}  distance    Absolute distance travelled by right wheel
     */
    //% block="arc left radius %radius cm speed %speed distance %distance cm"
    //% radius.min=0 radius.max=999 radius.defl=0
    //% speed.min=-100 speed.max=100 speed.defl=60
    //% distance.min=0 distance.max=999 distance.defl=10
    //% group="Drive with Encoders and Gyro"
    export function arcLeft(radius: number, speed: number, distance: number) {
        let turnRatio = 0 -radius2turnRatio(radius)
        let rotations = distance / _rotation2cm
        _motors.steer(turnRatio, speed, rotations, MoveUnit.Rotations)
    }

    /**
     * Compass reading of the gyro angle in degree
     */
    //% block="gyro angle"
    //% group="Drive with Encoders and Gyro"
    export function gyroAngle(): number {
        return _gyro.angle()
    }

    /**
     * Align back bumper against a wall
     * @param {number}  duration        Time used for the alignment in s
     */
    //% block="align back to wall for %duration s"
    //% duration.min=0 duration.max=10 duration.defl=1
    //% group="Drive with Encoders and Gyro"
    export function alignBack(duration: number) {
        _motors.steer(0, (_rotation2cm > 0) ? -5 : 5, duration, MoveUnit.Seconds)
        pause(300)  // Allocate 0.3 s to stop all movements
    }

    //.......................... Drive Light Public Functions .................
    /**
     * startArcRight
     * startArcLeft
     * pauseRigthColorBright
     * pauseLeftColorBright
     * pauseRightColorDark
     * pauseLeftColorDark
     * startRightEdge
     * followRightEdge
     * rightColorValue
     * leftColorValue
     * rightColorLimit
     * leftColorLimit
     */
    /**
     * Start an arc movement right forward (speed>0 or backward (speed<0))
     * @param {number}  radius      For the left wheel in cm
     * @param {number}  speed       Negative/backward, 0/stop, positive/forward
     */
    //% block="start arc right radius %radius cm speed %speed"
    //% radius.min=0 radius.max=999 radius.defl=0
    //% speed.min=-100 speed.max=100 speed.defl=60
    //% group="Reflected Light (Color)"
    export function startArcRight(radius: number, speed: number) {
        let turnRatio = radius2turnRatio(radius)
        let turnSpeed = motorSpeed(speed)
        _motors.steer(turnRatio, turnSpeed)
    }

    /**
     * Start an arc movement left forward (speed>0 or backward (speed<0))
     * @param {number}  radius      For the right wheel in cm
     * @param {number}  speed       Negative/backward, 0/stop, positive/forward
     */
    //% block="start arc left radius %radius cm speed %speed"
    //% radius.min=0 radius.max=999 radius.defl=0
    //% speed.min=-100 speed.max=100 speed.defl=60
    //% group="Reflected Light (Color)"
    export function startArcLeft(radius: number, speed: number) {
        let turnRatio = 0 - radius2turnRatio(radius)
        let turnSpeed = motorSpeed(speed)
        _motors.steer(turnRatio, turnSpeed)
    }

    /**
     * Pause until right color sensor detects a bright color within distance
     * @param {number}  limit       Minimum value for bright detection in %
     * @param {number}  distance    Maximum absolute distance travelled in cm
     */
    //% block="pause until right color is bright over %limit within %distance cm"
    //% limit.min=20 limit.max=100 limit.defl=80
    //% group="Reflected Light (Color)"
    export function pauseRightColorBright(limit: number, distance: number) {
        let limitVal = rightColorLimit(limit)
        let basePoint = (moves.leftDistance() + moves.rightDistance()) / 2
        let currentPoint = 0
        let travelled = 0
        while (rightColorValue() <= limitVal) {
            currentPoint = (moves.leftDistance() + moves.rightDistance()) / 2
            travelled = Math.abs(currentPoint - basePoint)
            if (travelled > distance) return
        }
    }

    /**
     * Pause until left color sensor detects a bright color within distance
     * @param {number}  limit       Minimum value for bright detection in %
     * @param {number}  distance    Maximum absolute distance travelled in cm
     */
    //% block="pause until left color is bright over %limit within %distance cm"
    //% limit.min=20 limit.max=100 limit.defl=80
    //% group="Reflected Light (Color)"
    export function pauseLeftColorBright(limit: number, distance: number) {
        let limitVal = leftColorLimit(limit)
        let basePoint = (moves.leftDistance() + moves.rightDistance()) / 2
        let currentPoint = 0
        let travelled = 0
        while (leftColorValue() <= limitVal) {
            currentPoint = (moves.leftDistance() + moves.rightDistance()) / 2
            travelled = Math.abs(currentPoint - basePoint)
            if (travelled > distance) return
        }
    }

    /**
     * Pause until right color sensor detects a dark color within distance
     * @param {number}  limit       Maximum value for dark detection in %
     * @param {number}  distance    Maximum absolute distance travelled in cm
     */
    //% block="pause until right color is dark under %limit within %distance cm"
    //% limit.min=0 limit.max=80 limit.defl=20
    //% group="Reflected Light (Color)"
    export function pauseRightColorDark(limit: number, distance: number) {
        let limitVal = rightColorLimit(limit)
        let basePoint = (moves.leftDistance() + moves.rightDistance()) / 2
        let currentPoint = 0
        let travelled = 0
        while (rightColorValue() >= limitVal) {
            currentPoint = (moves.leftDistance() + moves.rightDistance()) / 2
            travelled = Math.abs(currentPoint - basePoint)
            if (travelled > distance) return
        }
    }

    /**
     * Pause until left color sensor detects a dark color within distance
     * @param {number}  limit       Maximum value for dark detection in %
     * @param {number}  distance    Maximum absolute distance travelled in cm
     */
    //% block="pause until left color is dark under %limit within %distance cm"
    //% limit.min=0 limit.max=80 limit.defl=20
    //% group="Reflected Light (Color)"
    export function pauseLeftColorDark(limit: number, distance: number) {
        let limitVal = leftColorLimit(limit)
        let basePoint = (moves.leftDistance() + moves.rightDistance()) / 2
        let currentPoint = 0
        let travelled = 0
        while (leftColorValue() >= limitVal) {
            currentPoint = (moves.leftDistance() + moves.rightDistance()) / 2
            travelled = Math.abs(currentPoint - basePoint)
            if (travelled > distance) return
        }
    }

    /**
     * Start right edge tracking by recording current color value and target
     * @param {number}  colorValue  Current color sensor reading
     * @param {number}  target      Target color at the edge
     */
    //% block="start edge tracking, color %colorValue, target %target"
    //% target.min=10 target.max=90 target.defl=50
    //% group="Reflected Light (Color)"
    export function startRightEdge(colorValue: number, target: number) {
        _trackingPrevValue = colorValue
        _trackingTargetValue = target
    }

    /**
     * Follow right edge based on current color value and drive parameters
     * @param {number}  colorValue  Current color sensor reading
     * @param {number}  speed       Target movement speed
     * @param {number}  gain        Positive = right edge, negative = left edge
     * @param {number}  damping     Predictive control to reduce oscillation
     */
    //% block="follow right edge, color %colorValue, speed %speed, gain %gain, damping %damping"
    //% speed.min=0 speed.max=90 speed.defl=30
    //% gain.min=-10 gain.max=10 gain.defl=2
    //% damping.min=-20 damping.max=20 damping.defl=5
    //% group="Reflected Light (Color)"
    export function followRightEdge(colorValue: number, speed:number, 
        gain: number, damping: number) {
        let error = _trackingTargetValue - colorValue       // SP - PV
        let delta = _trackingPrevValue - colorValue         // prevPV - PV
        let controlValue = gain * error - damping * delta   // CV
        _trackingPrevValue = colorValue                     // store prevPV
        if (controlValue > 100) controlValue = 100          // Clamp CV
        if (controlValue < -100) controlValue = -100
        _motors.steer(controlValue, motorSpeed(speed))
    }

    /**
     * Color value of reflected light in the right sensor
     */
    //% block="right color value"
    //% group="Reflected Light (Color)"
    export function rightColorValue(): number {
        if (_colorDefR) {
            return _colorR.light(LightIntensityMode.Reflected)
        } else {
            return 50
        }
    }

    /**
     * Color value of reflected light in the left sensor
     */
    //% block="left color value"
    //% group="Reflected Light (Color)"
    export function leftColorValue(): number {
        if (_colorDefL) {
            return _colorL.light(LightIntensityMode.Reflected)
        } else {
            return 50
        }
    }

    /**
     * Normalized color limit of reflected light in the right sensor
     * @param {number}  level       Nominal value, 0 = black, 100 = white
     */
    //% block="right color limit  level %level"
    //% level.min=0 level.max=100 level.defl=50
    //% group="Reflected Light (Color)"
    export function rightColorLimit(level: number): number {
        if (_colorDefR) {
            let minVal = _colorMinR
            let range = _colorMaxR - minVal
            return minVal + level * range / 100
        } else {
            return 50
        }
    }

    /**
     * Normalized color limit of reflected light in the left sensor
     * @param {number}  level       Nominal value, 0 = black, 100 = white
     */
    //% block="left color limit  level %level"
    //% level.min=0 level.max=100 level.defl=50
    //% group="Reflected Light (Color)"
    export function leftColorLimit(level: number): number {
        if (_colorDefL) {
            let minVal = _colorMinL
            let range = _colorMaxL - minVal
            return minVal + level * range / 100
        } else {
            return 50
        }
    }
}

//========================== Utilities -----------------------------------
//.......................... Utilities Local Variables ...................

let _canvas = image.create(screen.width, screen.height) // 178 x 128
let _digitFont = [  // pixels in 10 rows and 8 columns for each digit
    /* 0 */ 0x38, 0x6C, 0xC6, 0xC6, 0xC6, 0xC6, 0xC6, 0xC6, 0x6C, 0x38,
    /* 1 */ 0x18, 0x38, 0x78, 0xD8, 0x18, 0x18, 0x18, 0x18, 0x18, 0xFF,
    /* 2 */ 0x38, 0x6C, 0xC6, 0x06, 0x06, 0x0C, 0x18, 0x30, 0x60, 0xFE,
    /* 3 */ 0xFE, 0x06, 0x0C, 0x18, 0x38, 0x0C, 0x06, 0x06, 0xCC, 0x78,
    /* 4 */ 0x0C, 0x1C, 0x3C, 0x6C, 0xCC, 0xCC, 0xFE, 0x0C, 0x0C, 0x0C,
    /* 5 */ 0xFE, 0xC0, 0xC0, 0xC0, 0xF8, 0x0C, 0x06, 0x06, 0xCC, 0x78,
    /* 6 */ 0x3C, 0x60, 0xC0, 0xC0, 0xF8, 0xCC, 0xC6, 0xC6, 0x6C, 0x38,
    /* 7 */ 0xFE, 0x06, 0x0C, 0x0C, 0x18, 0x18, 0x30, 0x30, 0x30, 0x30,
    /* 8 */ 0x38, 0x6C, 0xC6, 0x6C, 0x38, 0x6C, 0xC6, 0xC6, 0x6C, 0x38,
    /* 9 */ 0x38, 0x6C, 0xC6, 0xC6, 0x6E, 0x3E, 0x06, 0x06, 0x0C, 0x78
]

//.......................... Utilities Local Functions ...................

function indicateBatteryLevel(): boolean {
    let batteryLevel = brick.batteryLevel()
    let isError = false
    if (batteryLevel > 60) {
        brick.setStatusLight(StatusLight.Green)     // Green when > 60 %
    } else if (batteryLevel > 15) {
        brick.setStatusLight(StatusLight.Orange)    // Orange when 15..60 %
    } else if (batteryLevel > 3) {
        brick.setStatusLight(StatusLight.Red)       // Red when 3..15 % 
    } else {
        brick.setStatusLight(StatusLight.RedPulse)  // Blink when < 3%
        isError = true
    }
    return isError
}

function gyroDrift(): number {
    const n = 20;
    let sum = 0;
    for (let i = 0; i < n; ++i) {       // Integrate 20 samples in 200 ms
        sum += _gyro.rate();
        pause(10);
    }
    return sum / n;                     // Calculate averge drift
}

function drawCheckers() {
    for (let x = 0; x < 178; x++) {
        for (let y = 0; y < 128; y++) { // For every pixel in screen
            let xor = (x & 1) + (y & 1) // Calculate exclusive or for x and y
            _canvas.setPixel(x, y, (xor == 1) ? 1 : 0)
        }
    }
}

/**
 * Draw an index number in a white circle
 * @param {number}  x       Column number in pixels from left for the center
 * @param {number}  y       Row number in pixels from top for the center
 * @param {number}  r       Radius of the circle
 * @param {number}  index   Value of the index 0..9
 */

function drawIndex(x: number, y: number, r: number, index: number) {
    _canvas.fillCircle(x, y, r, 0)
    drawDigit(x - 7, y - 10, index)
}

/**
 * Draw a 1 digit number
 * @param {number}  x       Column number in pixels from left
 * @param {number}  y       Row number in pixels from top
 * @param {number}  digit   Value of the number 0..9
 */

function drawDigit(x: number, y: number, digit: number) {
    for (let i = 0; i < 10; i++) {      // For each row in the digit
        let byte = _digitFont[digit * 10 + i]
        for (let j = 0; j < 8; j++) {   // For each column in the digit
            if (byte >= 128) {          // Detect the next visible pixel
                byte -= 128
                                        // Draw a 3x3 box in 2x2 grid
                _canvas.fillRect(x + 2 * j, y + 2 * i, 3, 3, 1)
            }
            byte *= 2
        }
    }
}

/**
 * Draw text string in a white box as a centered label
 * @param {number}  x       Column number in pixels from left
 * @param {number}  y       Row number in pixels from top
 * @param {number}  w       Width of the framed box
 * @param {number}  h       Height of the framed box
 * @param {number}  text    Multiline strings to be drawn
 */

function drawText(x: number, y: number, w: number, h: number, text: string) {
    _canvas.fillRect(x, y, w, h, 0)
    let lines = text.split("/")         // Get the lines separated by slash
    let lineCount = lines.length
    let lineHeight = h / lineCount
    let yMargin = 2 + (h - lineCount * 12) / (lineCount + 1)
    for (let i = 0; i < lineCount; i++) {
        let line = lines[i]             // Get next line
        let charCount = line.length     // Get info for centering
        let xMargin = (w - (charCount * 6)) / 2
        _canvas.print(line, x + xMargin, y + yMargin + i * lineHeight)
    }
}

//.......................... Setup Public Functions ......................

/**
 * setupMotors
 * setupNavigation
 * setupRightColor
 * setupLeftColor
 */

//% weight=10 color=#0033ff icon="\u205e"
namespace utilities {
    /**
     * Setup the driver motors
     * @param {object}  motorPair   Motors used for the drive
     * @param {object}  leftMotor   Left motor in the drive
     * @param {object}  rightMotor  Right motor in the drive
     */
    //% block="setup motors %motorPair left %leftMotor right %rightMotor"
    //% motorPair.defl=motors.largeBC
    //% leftMotor.defl=motors.largeB
    //% rightMotor.defl=motors.largeC
    //% inlineInputMode=inline
    //% group="Setup"
    export function setupMotors(motorPair: motors.SynchedMotorPair, leftMotor: motors.Motor, rightMotor: motors.Motor) {
        _motors = motorPair
        _motorL = leftMotor
        _motorR = rightMotor
        _motors.setBrake(false)
    }

    /**
     * Setup the gyro for the movements and drive dimensional parameters
     * @param {object}  gyro        Gyro sensor
     * @param {number}  roration    Distance in cm travelled in 1 motor rotation
     * @param {number}  trackWidth  Distance in cm beween the tracks of the wheels
     */
    //% block="setup gyro %gyro wheel roration %roration cm, track width %trackWidth cm"
    //% Gyro.defl=sensors.Gyro2
    //% roration.min=-50 roration.max=50 roration.defl=17.3
    //% trackWidth.min=4.8 trackWidth.max=24 trackWidth.defl=12.0
    //% inlineInputMode=inline
    //% group="Setup"
    export function setupNavigation(gyro: sensors.GyroSensor, roration: number, trackWidth: number) {
        _gyro = gyro
        _rotation2cm = roration
        _trackWidth = trackWidth
        _gyroDef = true
    }

    /**
     * Setup the left color sensor and its range
     * @param {object}  sensor      Color sensor
     * @param {number}  blackValue  Minimum detected sensor reading
     * @param {number}  whiteValue  Maximum detected sensor reading
     */
    //% block="Setup left color %senssor min black %blackValue, max white %whiteValue"
    //% sensor.defl=sensors.Color1
    //% blackValue.min=0 blackValue.max=80 blackValue.defl=20
    //% whiteValue.min=20 whiteValue.max=100 whiteValue.defl=60
    //% group="Setup"
    export function setupLeftColor(sensor: sensors.ColorSensor, blackValue: number, whiteValue: number) {
        _colorL = sensor
        _colorMinL = blackValue
        _colorMaxL = whiteValue
        _colorDefL = true
    }

    /**
     * Setup the right color sensor and its range
     * @param {object}  sensor      Color sensor
     * @param {number}  blackValue  Minimum detected sensor reading
     * @param {number}  whiteValue  Maximum detected sensor reading
     */
    //% block="Setup right color %senssor min black %blackValue, max white %whiteValue"
    //% sensor.defl=sensors.Color3
    //% blackValue.min=0 blackValue.max=80 blackValue.defl=20
    //% whiteValue.min=20 whiteValue.max=100 whiteValue.defl=60
    //% group="Setup"
    export function setupRightColor(sensor: sensors.ColorSensor, blackValue: number, whiteValue: number) {
        _colorR = sensor
        _colorMinR = blackValue
        _colorMaxR = whiteValue
        _colorDefR = true
    }

    //.......................... Other Public Functions ......................
    /**
     * startScreen
     * calibrateColors
     * calibrateGyro
     * isDisplayBusy
     */

    //% block="open start screen"
    //% group="Other"
    export function startScreen(): void {
        music.playSoundEffect(sounds.systemDownload)
        _gyro.reset()
        if (indicateBatteryLevel()) {
            music.playSoundEffectUntilDone(sounds.systemPowerDown)
            brick.showString("CHARGE BATTERY", 7)
        }
        brick.showString(control.programName(), 3)
        brick.showString("Push Enter to Exit", 12)
        _isBusy = true          // Confirm that the display updating is going on
        _isDisplaying = true    // Allow another program to stop the updates
        while (_isDisplaying) {
            brick.showValue("Battery % ", brick.batteryLevel(), 5)
            brick.showValue("Battery V ", brick.batteryInfo(BatteryProperty.Voltage), 6)
            if (_gyroDef) {
                brick.showValue("Gyro angle", _gyro.angle(), 9)
                let drift = gyroDrift()
                brick.showValue("Gyro drift", drift, 10)
                if (Math.abs(drift) > 0.5) {
                    music.playSoundEffectUntilDone(sounds.systemGeneralAlert)
                    brick.showString("CALIBRATE GYRO", 11)
                } else {
                    brick.showString("Calibration OK", 11)
                }
            }
        }
        _isBusy = false
    }

    //% block="calibrate colors"
    //% group="Other"
    export function calibrateColors() {
        music.playSoundEffectUntilDone(sounds.informationAnalyze)
        music.playSoundEffect(sounds.informationColor)
        _colorValL = moves.leftColorValue()
        _colorValR = moves.rightColorValue()

        _colorMinL = _colorValL
        _colorMaxL = _colorValL
        _colorMinR = _colorValR
        _colorMaxR = _colorValR
        brick.showString("Push Enter to Exit", 12)
        let newVal: number
        _isBusy = true          // Confirm that the display updating is going on
        _isDisplaying = true    // Allow another program to stop the updates
        while (_isDisplaying) {
            // Exponential filters for the raw values
            newVal = moves.leftColorValue()
            _colorValL = 0.9 * _colorValL + 0.1 * newVal
            newVal = moves.rightColorValue()
            _colorValR = 0.9 * _colorValR + 0.1 * newVal

            let change = false
            if (_colorMinL > _colorValL) {
                _colorMinL = _colorValL
                change = true
            }
            if (_colorMaxL < _colorValL) {
                _colorMaxL = _colorValL
                change = true
            }
            if (_colorMinR > _colorValR) {
                _colorMinR = _colorValR
                change = true
            }
            if (_colorMaxR < _colorValR) {
                _colorMaxR = _colorValR
                change = true
            }
            if (change) music.playSoundEffect(sounds.expressionsSmack)

            if (_colorDefL) {
                brick.showValue("Left  color", _colorValL, 4)
                brick.showValue("        min", _colorMinL, 5)
                brick.showValue("        max", _colorMaxL, 6)
            }
            if (_colorDefR) {
                brick.showValue("Right color", _colorValR, 7)
                brick.showValue("        min", _colorMinR, 8)
                brick.showValue("        max", _colorMaxR, 9)
            }
        }
        _isBusy = false
    }

    //% block="calibrate gyro"
    //% group="Other"
    export function calibrateGyro() {
        if (_gyroDef) {
            music.playSoundEffectUntilDone(sounds.informationAnalyze)
            music.playSoundEffect(sounds.informationTurn)
            brick.showString("Start gyro calibration", 3)
            brick.showString("Push Enter to Exit", 12)
            _gyro.calibrate()
            brick.showString("Calibration is done", 4)
            _isBusy = true          // Confirm that the display updating is going on
            _isDisplaying = true    // Allow another program to stop the updates
            while (_isDisplaying) {
                brick.showValue("Gyro angle", _gyro.angle(), 9)
            }
            _isBusy = false
        }
    }

    //% block="display is busy"
    //% group="Other"
    export function isDisplayBusy(): boolean {
        let wasDisplaying = _isDisplaying
        _isDisplaying = false
        if (wasDisplaying) {
            pause(200)          // wait 200 ms and then
            while (_isBusy) { }  // Wait until update loop is done
        }
        return wasDisplaying
    }

    /**
     * Show index number and labels for the EV3 buttons
     * @param {number}  index   Value of the index 0..9
     * @param {string}  title   Title of the display
     * @param {number}  labels  Labels for the 4 buttons
     */

    //% block show menu %index title %title labels %labels
    //% grou="Other"
    export function showMenu(index: number, title: string, labels: string) {
        let indexX = 28                 // Locations of the display components
        let indexY = 21
        let indexR = 16
        let titleX = 62
        let titleY = 46
        let boxW = 53
        let boxH = 36
        let labelsX = [62, 121, 62, 3]
        let labelsY = [4, 46, 88, 46]
        drawCheckers()
        drawIndex(indexX,indexY,indexR,index)
        drawText(titleX, titleY, boxW, boxH, title)
        let actions = labels.split(",")
        for (let i = 0; i < 4; i++) {
            let x = labelsX[i]
            let y = labelsY[i]
                                        // Draw a double frame around the box
            _canvas.fillRect(x - 2, y - 2, boxW + 4, boxH + 4, 1)
            drawText(x, y, boxW, boxH, actions[i])
        }
        brick.showImage(_canvas)
    }
}