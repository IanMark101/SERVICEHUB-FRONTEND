import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import ActivityBookingFacts from './ActivityBookingFacts';
import type { JobEngagement } from '../../types';

const booking: JobEngagement = {id:'booking',title:'Laptop repair',status:'queued',bookingStatus:'ACCEPTED',providerId:'provider',providerName:'Provider',providerAvatar:'',seekerId:'seeker',seekerName:'Customer',seekerAvatar:'',serviceId:'service',price:500,paymentMethod:'On-site Cash',serviceLocationMode:'SEEKER_VISITS',estimatedDurationMins:60,createdAt:'2026-10-16'};
it('shows a saved workplace address without inventing an exact map link', () => {
  render(<ActivityBookingFacts role="seeker" booking={{...booking,jobLocation:{label:'Provider workplace',address:'Shop 2 beside the barangay hall'}}} />);
  expect(screen.getByText('Shop 2 beside the barangay hall')).toBeVisible();
  expect(screen.queryByRole('link',{name:'View agreed job pin'})).not.toBeInTheDocument();
});
it('retains exact job links for existing booking snapshots', () => {
  render(<ActivityBookingFacts role="provider" booking={{...booking,jobLocation:{latitude:10.3,longitude:123.9,label:'Cordova workshop',address:'Private workshop directions'}}} />);
  expect(screen.getByRole('link',{name:'View agreed job pin'})).toHaveAttribute('href','https://www.openstreetmap.org/?mlat=10.3&mlon=123.9#map=17/10.3/123.9');
});
it('hides stale physical addresses from online booking facts', () => {
  render(<ActivityBookingFacts role="seeker" booking={{...booking,serviceLocationMode:'REMOTE',jobLocation:{label:'Old workplace',address:'Old private address'}}} />);
  expect(screen.queryByText('Old private address')).not.toBeInTheDocument();
  expect(screen.getByText('Online — no meetup required')).toBeVisible();
});
