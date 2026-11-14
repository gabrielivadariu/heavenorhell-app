# App Review: China mainland availability

Apple rejected iOS version 1.1.0 (16), submission `f03b7fd2-355a-4f4d-85ca-2dc178e682b3`, under Guideline 5 on November 13, 2026. The review message identifies distribution in China mainland with OpenAI functionality and offers removing that storefront as an alternative remedy.

On November 14, the owner explicitly chose to exclude China mainland. The change was confirmed in App Store Connect and checked after reloading: China mainland is deselected, with the other territory selections retained. Apple says availability changes can take up to 24 hours to become visible. This is an availability change; no new binary or removal of AI disclosures from the remaining storefronts was performed.

The version's Review Notes explain the selected remedy. No direct reviewer message or resubmission has been sent in this follow-up.

## Prepared reviewer reply

This text is prepared for the owner to send after confirming the availability change:

> Hello App Review Team,
>
> Thank you for the clarification. We have selected the alternative remedy described in your message and removed China mainland from the app's availability in App Store Connect. The app will not be distributed through the China mainland storefront. All other territory selections remain unchanged.
>
> We have updated the Review Notes for version 1.1.0 (build 16) to explain this change. Please reassess the submission with the updated availability settings.
>
> Thank you.

## Remaining functional validation

The live API still reports `paidChatReady=false`. The owner must provision available OpenAI API credit, then real chat and native sandbox purchase/restore validation must finish before resubmission. Fixing the storefront issue does not establish that those functional checks pass.

[Apple availability instructions](https://developer.apple.com/help/app-store-connect/manage-your-apps-availability/manage-availability-for-your-app-on-the-app-store/).
