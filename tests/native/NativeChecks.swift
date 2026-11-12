import XCTest

final class NativeChecks: XCTestCase {
  func capture(_ name: String) {
    let attachment = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
    attachment.name = name
    attachment.lifetime = .keepAlways
    add(attachment)
  }
  func testNativeJourneys() {
    continueAfterFailure = false
    let app = XCUIApplication(bundleIdentifier: "com.gabriellivadariu.goddevil")
    app.launch()
    XCTAssertTrue(app.staticTexts["Who will you turn to?"].waitForExistence(timeout: 20))
    capture("01-home")
    app.buttons.matching(NSPredicate(format: "label CONTAINS %@", "God")).firstMatch.tap()
    XCTAssertTrue(app.staticTexts["You can set it down here."].waitForExistence(timeout: 10))
    capture("02-god-welcome")
    let input = app.textViews.firstMatch
    XCTAssertTrue(input.waitForExistence(timeout: 5))
    input.tap()
    input.typeText("Where can I begin today?")
    app.buttons["Send"].tap()
    XCTAssertTrue(app.staticTexts["You choose what you share"].waitForExistence(timeout: 8))
    capture("03-ai-permission")
    XCTAssertTrue(app.buttons["Not now"].isHittable)
    app.buttons["Not now"].tap()
    XCTAssertEqual(input.value as? String, "Where can I begin today?")
    app.buttons["Back"].tap()
    let council = app.buttons.matching(NSPredicate(format: "label CONTAINS %@", "Two voices, one choice")).firstMatch
    app.swipeUp()
    XCTAssertTrue(council.waitForExistence(timeout: 5))
    council.tap()
    XCTAssertTrue(app.staticTexts["One dilemma.\nTwo very different voices."].waitForExistence(timeout: 10))
    capture("04-two-voices")
    app.buttons["Back"].tap()
    let ritual = app.buttons.matching(NSPredicate(format: "label CONTAINS %@", "The daily pause")).firstMatch
    if !ritual.isHittable { app.swipeUp() }
    ritual.tap()
    XCTAssertTrue(app.staticTexts["Make a little space."].waitForExistence(timeout: 5))
    app.buttons["Begin your minute"].tap()
    XCTAssertTrue(app.buttons["Pause"].waitForExistence(timeout: 5))
    capture("05-breathing-ritual")
    app.buttons["Pause"].tap()
    app.buttons["Back"].tap()
    app.swipeDown()
    app.buttons["Your journal"].tap()
    XCTAssertTrue(app.staticTexts["Words worth keeping."].waitForExistence(timeout: 5))
    capture("06-journal")
  }
}
