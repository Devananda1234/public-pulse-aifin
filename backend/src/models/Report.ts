import { readData, writeData } from '../config/db';
import { generateTrackingId } from '../utils/trackingId';

const Report = {
  find: (): any[] => {
    return readData().reports;
  },
  
  findById: (id: string): any => {
    const reports = readData().reports;
    return reports.find((r: any) => r.id === id);
  },

  create: (data: any): any => {
    const dbData = readData();
    const newReport = {
      id: generateTrackingId(),
      ...data,
      status: 'Submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      department: data.department || null
    };
    dbData.reports.push(newReport);
    writeData(dbData);
    return newReport;
  },

  findByIdAndUpdate: (id: string, updateData: any): any => {
    const dbData = readData();
    const index = dbData.reports.findIndex((r: any) => r.id === id);
    if (index !== -1) {
      dbData.reports[index] = {
        ...dbData.reports[index],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      writeData(dbData);
      return dbData.reports[index];
    }
    return null;
  }
};

export default Report;
