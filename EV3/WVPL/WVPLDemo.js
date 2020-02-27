/**
 * @file    main.ts WVPL Demo
 *
 * Author           Olavi Kamppari (alias OliviliK, Ollie)
 * Date created:    1/29/2020
 * Last modified:   2/15/2020
 * MakeCode ver:    5.32.3
 * EV3 version:     1.4.20
 * EV3 firmware:    V1.10E
 *
 * Summary:
 *  Demonstrate the functions available in custom.ts library
 */

brick.buttonEnter.onEvent(ButtonEvent.Pressed, function () {doAction(0)})
brick.buttonUp.onEvent   (ButtonEvent.Pressed, function () {doAction(1)})
brick.buttonRight.onEvent(ButtonEvent.Pressed, function () {doAction(2)})
brick.buttonDown.onEvent (ButtonEvent.Pressed, function () {doAction(3)})
brick.buttonLeft.onEvent (ButtonEvent.Pressed, function () {doAction(4)})

sensors.touch1.onEvent(ButtonEvent.Pressed, function () {
    music.playSoundEffect(sounds.movementsDropLoad)
})

function showLiftMotors() {
    brick.showValue("Motor A", motors.mediumA.angle()/360, 3)
    brick.showValue("Motor D", motors.mediumD.angle()/360, 5)
}

function resetDrive() {
    moves.resetDistances()
    gyroStart = moves.gyroAngle()
    timeStart = control.millis()

}

function showResults() {
    brick.showValue("Battery % ", brick.batteryLevel(), 1)
    brick.showValue("     state", state, 2)
    brick.showValue("     power", paramPower, 3)
    brick.showValue("  distance", paramDistance, 4)
    brick.showValue("    radius", paramRadius, 5)
    brick.showValue("     angle", paramAngle, 6)

    brick.showValue("Left  Motor", moves.leftDistance(), 7)
    brick.showValue("Right Motor", moves.rightDistance(), 8)
    brick.showValue("Gyro  Angle", moves.gyroAngle() - gyroStart, 9)
    brick.showValue("Left  Color", moves.leftColorValue(),10)
    brick.showValue("Right Color", moves.rightColorValue(),11)
    brick.showValue("Duration   ", (control.millis() - timeStart) / 1000, 12)
}

function doAction (buttonNumber: number) {
    music.stopAllSounds()
    if (utilities.isDisplayBusy()) {
        music.playSoundEffect(sounds.communicationOkay)
        utilities.showMenu(0, "/Start/Actions/",
            "/Start/Screen/,/Calibrate/Colors/,/Calibrate/Gyro/,/Align/Back/")
    } else {
        if (buttonNumber == 0) {
            state += 1
            if (state > 7) state = 0
        }
        if (state == 0) doStateZero(buttonNumber)
        else if (state == 1) doStateOne(buttonNumber)
        else if (state == 2) doStateTwo(buttonNumber)
        else if (state == 3) doStateThree(buttonNumber)
        else if (state == 4) doStateFour(buttonNumber)
        else if (state == 5) doStateFive(buttonNumber)
        else if (state == 6) doStateSix(buttonNumber)
        else if (state == 7) doStateSeven(buttonNumber)
    }
}

function doStateZero(buttonNumber: number) {
    if (buttonNumber == 0) {
        music.playSoundEffect(sounds.numbersZero)
        utilities.showMenu(0,"/Start/Actions/",
            "/Start/Screen/,/Calibrate/Colors/,/Calibrate/Gyro/,/Align/Back/")
    } else if (buttonNumber == 1) { // Up: Start
        utilities.startScreen()
    } else if (buttonNumber == 2) { // Right: Color
        utilities.calibrateColors()
    } else if (buttonNumber == 3) { // Down: Gyro
        utilities.calibrateGyro()
    } else if (buttonNumber == 4) { // Left:  Align Back
        music.playSoundEffect(sounds.informationTouch)
        moves.alignBack(1)
    }
}
function doStateOne(buttonNumber: number) {
    if (buttonNumber == 0) {
        music.playSoundEffect(sounds.numbersOne)
        utilities.showMenu(1, "/Front/Lift/", "Left,Up,Right,Down")
    } else if (buttonNumber == 1) { // Up
        music.playSoundEffect(sounds.informationLeft)
        motors.mediumD.run(20)
        while (brick.buttonUp.isPressed()) {showLiftMotors()}
        motors.mediumD.stop()
        pause(100)
        showLiftMotors()
    } else if (buttonNumber == 2) { // Right
        music.playSoundEffect(sounds.informationUp)
        motors.mediumA.run(10)
        while (brick.buttonRight.isPressed()) {showLiftMotors()}
        motors.mediumA.stop()
        pause(100)
        showLiftMotors()
    } else if (buttonNumber == 3) { // Down
        music.playSoundEffect(sounds.informationRight)
        motors.mediumD.run(-20)
        while (brick.buttonDown.isPressed()) {showLiftMotors()}
        motors.mediumD.stop()
        pause(100)
        showLiftMotors()
    } else if (buttonNumber == 4) { // Left
        music.playSoundEffect(sounds.informationDown)
        motors.mediumA.run(-10)
        while (brick.buttonLeft.isPressed()) {showLiftMotors()}
        motors.mediumA.stop()
        pause(100)
        showLiftMotors()
    }
}


function doStateTwo(buttonNumber: number) {
    if (buttonNumber == 0) {
        music.playSoundEffectUntilDone(sounds.numbersTwo)
        utilities.showMenu(2, "Move 25cm/Straight", 
            "Forward/10 speed,Forward/60 speed, Backward/10 speed, Backward/60 speed")
        music.playSoundEffect(sounds.informationForward)
    } else {
        if (buttonNumber == 1) paramPower = 10
        else if (buttonNumber == 2) paramPower = 60
        else if (buttonNumber == 3) paramPower = -10
        else if (buttonNumber == 4) paramPower = -60
        paramDistance = 25
        paramRadius = 0
        paramAngle = 0
        resetDrive()
        moves.moveStraight(paramPower,paramDistance)
        showResults()
    }
}

function doStateThree(buttonNumber: number) {
    if (buttonNumber == 0) {
        music.playSoundEffectUntilDone(sounds.numbersThree)
        utilities.showMenu(3, "Turn 90/Using/Gyro",
            "Forward/Left,Forward/Right,Backward/Right,Backward/Left")
        music.playSoundEffect(sounds.informationTurn)
    } else {
        if (buttonNumber == 1) paramPower = 25
        else if (buttonNumber == 2) paramPower = 25
        else if (buttonNumber == 3) paramPower = -25
        else if (buttonNumber == 4) paramPower = -25
        paramDistance = 0
        paramRadius = 30
        paramAngle = 90 - 2     // Adjusted angle target
        resetDrive()
        if ((buttonNumber == 1) || (buttonNumber == 4)) {
            moves.turnLeft(paramRadius, paramPower, paramAngle)
        } else {
            moves.turnRight(paramRadius, paramPower, paramAngle)
            }
        showResults()
    }
}

function doStateFour(buttonNumber: number) {
    if (buttonNumber == 0) {
        music.playSoundEffectUntilDone(sounds.numbersFour)
        utilities.showMenu(4, "Arc/Radius/30 cm",
            "Forward/Left,Forward/Right,Backward/Right,Backward/Left")
        music.playSoundEffect(sounds.informationRight)
    } else {
        if (buttonNumber == 1) paramPower = 25
        else if (buttonNumber == 2) paramPower = 25
        else if (buttonNumber == 3) paramPower = -25
        else if (buttonNumber == 4) paramPower = -25
        paramRadius = 30
        paramDistance = 1.45 * paramRadius
        paramAngle = 0
        resetDrive()
        if ((buttonNumber == 1) || (buttonNumber == 4)) {
            moves.arcLeft(paramRadius, paramPower, paramDistance)
        } else {
            moves.arcRight(paramRadius, paramPower, paramDistance)
        }
        showResults()
    }
}

function doStateFive(buttonNumber: number) {
    if (buttonNumber == 0) {
        music.playSoundEffectUntilDone(sounds.numbersFive)
        utilities.showMenu(5, "Arc/Radius/60 cm/to color",
            "Forwards/Left/Bright,Forwards/Right/Bright,Backwards/Right/Dark,Backwards/Left/Dark")
        music.playSoundEffectUntilDone(sounds.informationColor)
    } else {
        let colorLimit = 0
        if (buttonNumber == 1) paramPower = 25
        else if (buttonNumber == 2) paramPower = 25
        else if (buttonNumber == 3) paramPower = -25
        else if (buttonNumber == 4) paramPower = -25
        if (buttonNumber == 1) colorLimit = moves.rightColorLimit(80)
        else if (buttonNumber == 2) colorLimit = moves.rightColorLimit(80)
        else if (buttonNumber == 3) colorLimit = moves.rightColorLimit(20)
        else if (buttonNumber == 4) colorLimit = moves.rightColorLimit(20)
        paramRadius = 60
        paramDistance = 0.8 * paramRadius
        paramAngle = colorLimit // to be shown in results
        resetDrive()
        if (buttonNumber == 1) {
            moves.startArcLeft(paramRadius, paramPower)
            moves.pauseRightColorBright(colorLimit,paramDistance)
        } else if (buttonNumber == 2) {
            moves.startArcRight(paramRadius, paramPower)
            moves.pauseRightColorBright(colorLimit,paramDistance)
        } else if (buttonNumber == 3) {
            moves.startArcRight(paramRadius, paramPower)
            moves.pauseRightColorDark(colorLimit,paramDistance)
        } else if (buttonNumber == 4) {
            moves.startArcLeft(paramRadius, paramPower)
            moves.pauseRightColorDark(colorLimit,paramDistance)
        }
        motors.stopAll()
        showResults()
    }
}

function doStateSix(buttonNumber: number) {
    if (buttonNumber == 0) {
        music.playSoundEffectUntilDone(sounds.numbersSix)
        utilities.showMenu(6, "/Demo/Figures/",
            "Train/Back/and/Forth,Line,Square,Number 8")
        music.playSoundEffectUntilDone(sounds.communicationLego)
    } else {
        paramPower = 40
        paramRadius = 30
        paramDistance = 40
        moves.alignBack(1.5)
        moves.moveStraight(paramPower,paramDistance)
        resetDrive()
        if (buttonNumber == 1) {            // Train
            for (let i=0; i<2; i++) {
                moves.moveStraight(paramPower,paramDistance)
                moves.moveStraight(0 - paramPower,paramDistance)
            }
        } else if (buttonNumber == 2) {     // Line
            for (let i=0; i<4; i++) {
                moves.moveStraight(paramPower,paramDistance)
                moves.turnRight(0,15,177)
            }
        } else if (buttonNumber == 3) {     // Square
            for (let i=0; i<8; i++) {
                moves.moveStraight(paramPower,paramDistance)
                moves.turnLeft(12,paramPower,84)
            }
        } else if (buttonNumber == 4) {     // Number 8
            paramPower = 80
            for (let i=0; i<2; i++) {
                moves.turnRight(paramRadius,paramPower,352)
                moves.turnLeft (paramRadius,paramPower,352)
            }
        }
        motors.stopAll()
        showResults()
    }
}

function doStateSeven(buttonNumber: number) {
    if (buttonNumber == 0) {
        music.playSoundEffectUntilDone(sounds.numbersSeven)
        utilities.showMenu(7, "/Line/Tracking/",
            "Right/Edge/Slow,Right/Edge/Fast,Left/Edge/Fast,Left/Edge/Gray")
        music.playSoundEffectUntilDone(sounds.informationStart)
    } else {
        let startPoint = moves.rightDistance()
        if (buttonNumber == 1) {            // Slow Right
            let targetColor = moves.rightColorLimit(50)
            moves.startRightEdge(moves.rightColorValue(), targetColor)
            while (moves.rightDistance() - startPoint < 40) {
                moves.followRightEdge(moves.rightColorValue(),10,4,5)
            }
        } else if (buttonNumber == 2) {     // Fast Right
            let targetColor = moves.rightColorLimit(50)
            moves.startRightEdge(moves.rightColorValue(), targetColor)
            while (moves.rightDistance() - startPoint < 40) {
                moves.followRightEdge(moves.rightColorValue(),30,3,4)
            }
        } else if (buttonNumber == 3) {     // Fast Left
            let targetColor = moves.rightColorLimit(50)
            moves.startRightEdge(moves.rightColorValue(), targetColor)
            while (moves.rightDistance() - startPoint < 40) {
                moves.followRightEdge(moves.rightColorValue(),30,-3,-4)
            }
        } else if (buttonNumber == 4) {     // Slow Left Gray
            let targetColor = moves.rightColorLimit(15)
            moves.startRightEdge(moves.rightColorValue(), targetColor)
            while (moves.rightDistance() - startPoint < 40) {
                moves.followRightEdge(moves.rightColorValue(),10,-6,-5)
            }
        }
        motors.stopAll()
    }
}
let state = 0
let gyroStart = 0
let timeStart = 0
let paramPower = 0
let paramDistance = 0
let paramRadius = 0
let paramAngle = 0
utilities.setupMotors(motors.largeBC, motors.largeB, motors.largeC)
utilities.setupNavigation(sensors.gyro2, 17.3, 16.0)
utilities.setupRightColor(sensors.color3, 4, 92)
utilities.startScreen()