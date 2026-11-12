# Native store media

`en/iphone` and `en/ipad` contain five unedited screenshots from the final universal simulator app, EAS build `8196bb0e-75c1-45f0-a8b3-8fc42b175c14`. Phone resolution is 1206×2622; iPad is 2064×2752. The screens show home, God welcome, Two voices welcome, the breathing ritual and the empty journal. No model replies were invented or generated for these captures. The consent capture is kept separately in `docs/previews/native-ai-permission.png`.

The user supplied the final framed iPhone marketing images in App Store Connect; those are preserved there. The raw iPhone captures remain available here as source material. Old large-iPhone screenshot overrides were removed so current iPhone screenshots scale automatically. New native iPad screenshots replace the old 2025 assets in the version 1.1 draft. Existing published version 1.0.3 is unchanged.

## Native verification

The XCTest journey passed independently on iPhone 17 Pro and iPad Pro 13-inch, running iOS 26.2. It checks navigation, first-message sharing permission, a hittable decline action, preservation of the unsent draft, Two voices, breathing controls and the journal. It does not send chat text or test live AI or StoreKit payments.

To reproduce with a fresh English-language simulator and the matching simulator app installed:

```sh
ruby scripts/create-native-checks.rb /tmp/hh-native-checks
xcodebuild test -project /tmp/hh-native-checks/NativeChecks.xcodeproj \
  -scheme NativeChecks -destination 'platform=iOS Simulator,id=YOUR_DEVICE_ID' \
  -resultBundlePath /tmp/hh-native-results.xcresult CODE_SIGNING_ALLOWED=NO
xcrun xcresulttool export attachments --path /tmp/hh-native-results.xcresult \
  --output-path /tmp/hh-native-attachments
```

Requires Xcode and the `xcodeproj` Ruby gem (also installed with CocoaPods). The runner is generated outside the app repository and does not rebuild React Native. Use a new result-bundle path for each run.
