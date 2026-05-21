const { z } = require('zod');

const password = z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/);

exports.registerOwner = z.object({
  body: z.object({
    tenantName: z.string().min(2),
    fullName: z.string().min(2),
    email: z.string().email(),
    password
  }),
  query: z.any(),
  params: z.any()
});

exports.verifyEmail = z.object({
  body: z.object({
    email: z.string().email(),
    code: z.string().length(6)
  }),
  query: z.any(),
  params: z.any()
});

exports.login = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1)
  }),
  query: z.any(),
  params: z.any()
});

exports.refresh = z.object({
  body: z.object({
    refreshToken: z.string().min(10)
  }),
  query: z.any(),
  params: z.any()
});

exports.forgotPassword = z.object({
  body: z.object({
    email: z.string().email()
  }),
  query: z.any(),
  params: z.any()
});

exports.resetPassword = z.object({
  body: z.object({
    email: z.string().email(),
    code: z.string().length(6),
    newPassword: password
  }),
  query: z.any(),
  params: z.any()
});
