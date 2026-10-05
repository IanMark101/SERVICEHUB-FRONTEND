/** Present existing saved notifications clearly without changing their records or links. */
export function notificationCopy(title: string, body: string) {
  const titles: Record<string, string> = {
    'New Direct Booking Request': 'New booking request',
    'Booking Accepted! 🎉': 'Booking accepted',
    'Booking Confirmed! 🎉': 'Booking confirmed',
    'Booking Request Declined ❌': 'Booking request declined',
    'Offer Accepted! 💰': 'Offer accepted',
    'New Offer Received': 'New offer received',
    'New Bid Received': 'New offer received',
  };
  // Keep quoted listing/request names exactly as written by their owners.
  const description = body.split(/("[^"]*")/g).map((part, index) => index % 2 ? part : part
    .replace('A new Direct Arrangement booking request has arrived', 'A new booking request has arrived')
    .replace('Messaging is now enabled — coordinate details with your provider via chat.', 'You can now message your provider to arrange the work.')
    .replace('Messaging is now open to coordinate with the seeker.', 'You can now message the seeker to arrange the work.')
    .replace('Messaging is now enabled — chat to coordinate service details.', 'You can now message the seeker to arrange the work.')
    .replace('Messaging is now enabled to coordinate with your provider.', 'You can now message your provider to arrange the work.')
  ).join('');
  return { title: titles[title] ?? title, description };
}
