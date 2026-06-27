// Mock cloudinary configuration for MVP
const cloudinary = {
  config: (options: any): void => {
    console.log('Cloudinary mock configured', options);
  },
  uploader: {
    upload: async (file: any): Promise<{ secure_url: string }> => {
      // Return a mock url
      return { secure_url: 'https://via.placeholder.com/400' };
    }
  }
};

export default cloudinary;
