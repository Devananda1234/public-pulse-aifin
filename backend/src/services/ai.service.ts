export const analyzeText = (description: string) => {
  const desc = description.toLowerCase();
  
  let category = 'Others';
  let severity = 'Low';
  let department = 'General Services';
  let priorityScore = Math.floor(Math.random() * 30) + 10;
  
  if (desc.includes('garbage') || desc.includes('waste') || desc.includes('trash')) {
    category = 'Waste Management';
    department = 'Municipal Sanitation Department';
    severity = 'High';
    priorityScore = 85;
  } else if (desc.includes('pothole') || desc.includes('road')) {
    category = 'Roads';
    department = 'Public Works Department';
    severity = 'Medium';
    priorityScore = 60;
  } else if (desc.includes('water') || desc.includes('leak')) {
    category = 'Water Supply';
    department = 'Water and Sewage Board';
    severity = 'High';
    priorityScore = 80;
  } else if (desc.includes('light') || desc.includes('electricity') || desc.includes('power')) {
    category = 'Electricity';
    department = 'Power Corporation';
    severity = 'Medium';
    priorityScore = 55;
  } else if (desc.includes('safety') || desc.includes('crime') || desc.includes('suspicious')) {
    category = 'Public Safety';
    department = 'Local Police Department';
    severity = 'Critical';
    priorityScore = 95;
  }

  return {
    category,
    severity,
    department,
    priorityScore,
    suggestedAction: `Immediate action recommended for ${category}.`
  };
};
