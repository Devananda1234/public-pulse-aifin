import Report from '../models/Report';

export const getTrackingInfo = (trackingId: string) => {
  return Report.findById(trackingId);
};
