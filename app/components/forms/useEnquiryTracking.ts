import {useEffect, useRef} from 'react';
import {createEnquiryTracker, type EnquiryForm} from '~/lib/lead-tracking';

export function useEnquiryTracking(success: boolean, form: EnquiryForm) {
  const tracker = useRef<ReturnType<typeof createEnquiryTracker> | null>(null);
  if (!tracker.current) tracker.current = createEnquiryTracker(form);
  useEffect(() => {
    tracker.current?.(success);
  }, [success]);
}
