import { resetDocs } from './docsStore';
import { resetInbox } from './inboxStore';
import { resetPros } from './prosStore';
import { resetReviews } from './reviewStore';
import { resetSettings } from './settingsStore';

/** Source `mt()`: put the mutable demo snapshot back where it started. */
export function resetDemoData() {
  resetReviews();
  resetPros();
  resetDocs();
  resetInbox();
  resetSettings();
}
