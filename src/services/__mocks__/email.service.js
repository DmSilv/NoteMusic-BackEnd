module.exports = {
  sendPasswordResetEmail: jest.fn().mockResolvedValue({
    success: true,
    messageId: 'mock-email-id',
  }),
  verifyConnection: jest.fn().mockResolvedValue(true),
};
