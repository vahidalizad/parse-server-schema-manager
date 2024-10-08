module.exports = (options = {}) => {
  const adapter = {
    sendVerificationEmail: () => Promise.resolve(),
    sendPasswordResetEmail: () => Promise.resolve(),
    sendMail: () => Promise.resolve(),
  };
  if (options.sendMail) {
    adapter.sendMail = options.sendMail;
  }
  if (options.sendPasswordResetEmail) {
    adapter.sendPasswordResetEmail = options.sendPasswordResetEmail;
  }
  if (options.sendVerificationEmail) {
    adapter.sendVerificationEmail = options.sendVerificationEmail;
  }

  return adapter;
};
