export const handler = async (
  event: Record<string, unknown> & { request: { userAttributes: { sub: string; email: string } } }
) => {
  const { sub, email } = event.request.userAttributes;
  console.log(`Post-confirmation: user ${email} (sub: ${sub})`);
  // TODO: Insert user record into RDS database
  return event;
};
