import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(__dirname, '../../data.json');

export const connectDB = (): void => {
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify({ reports: [] }), 'utf-8');
    console.log('Local JSON DB initialized');
  } else {
    console.log('Local JSON DB connected');
  }
};

export const readData = (): any => {
  try {
    const raw = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return { reports: [] };
  }
};

export const writeData = (data: any): void => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
};
