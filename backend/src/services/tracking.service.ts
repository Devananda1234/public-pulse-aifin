import Report from '../models/Report';

export const getTrackingInfo = async (trackingId: string) => {
  return await Report.findOne({ id: trackingId });
};
