/**
 * @file    main.ts WVPL Base
 *
 * Author           Olavi Kamppari (alias OliviliK, Ollie)
 * Date created:    2/7/2020
 * Last modified:   2/11/2020
 * MakeCode ver:    5.32.3
 * EV3 version:     1.4.20
 * EV3 firmware:    V1.10E
 *
 * Summary:
 *  Demonstrate the functions available in custom.ts library
 */

brick.buttonEnter.onEvent(ButtonEvent.Pressed, function () {
    if (utilities.isDisplayBusy()) {
        music.playSoundEffect(sounds.communicationOkay)
        utilities.showMenu(0, "Line", "Turn,Arc,Find/line,Follow/Right/Edge")
    } else {
        music.playSoundEffect(sounds.communicationGo)
        moves.moveStraight(60, 30)
    }
})

brick.buttonUp.onEvent(ButtonEvent.Pressed, function () {
    music.playSoundEffect(sounds.informationUp)
    moves.turnRight(40, 60, 90)
})

brick.buttonRight.onEvent(ButtonEvent.Pressed, function () {
    music.playSoundEffect(sounds.informationRight)
    moves.arcRight(40, 60, 55.5)
})

brick.buttonDown.onEvent(ButtonEvent.Pressed, function () {
    music.playSoundEffect(sounds.informationDown)
    moves.startArcRight(200, 30)
    moves.pauseRightColorDark(20, 35)
    motors.stopAll()
})

brick.buttonLeft.onEvent(ButtonEvent.Pressed, function () {
    music.playSoundEffect(sounds.informationLeft)
    moves.startRightEdge(moves.rightColorValue(), 50)
    let startPoint = moves.rightDistance()
    while (moves.rightDistance() - startPoint < 40) {
        moves.followRightEdge(moves.rightColorValue(),30,2,5)
    }
    motors.stopAll()
})

sensors.touch1.onEvent(ButtonEvent.Pressed, function () {
    music.playSoundEffect(sounds.mechanicalMotorStop)
})

utilities.setupMotors(motors.largeBC, motors.largeB, motors.largeC)
utilities.setupNavigation(sensors.gyro2, 17.3, 16.0)
utilities.setupRightColor(sensors.color3, 4, 92)
utilities.startScreen()