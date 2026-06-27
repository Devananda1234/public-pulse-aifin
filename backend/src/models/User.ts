// Mock User model for MVP Authentication
const User = {
  findOne: (credentials: any): any => {
    // For MVP, we hardcode the admin credentials instead of storing them in the JSON DB
    if (credentials.email === 'admin@publicpulse.ai' && credentials.password === 'admin123') {
      return { id: 'admin-1', role: 'admin', email: 'admin@publicpulse.ai' };
    }
    return null;
  }
};

export default User;
