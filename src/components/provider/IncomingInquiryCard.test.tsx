import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import IncomingInquiryCard from './IncomingInquiryCard';
import type { JobRequest } from '../../types';
vi.mock('../ui/ListingPhotoGallery', () => ({ default:()=>null }));
const base = {id:'old-inquiry',title:'Online tutoring',description:'Teach the subject online.',seekerId:'seeker',targetProviderId:'provider',sourceServiceId:'service',budget:0,locationLabel:'Cordova'} as unknown as JobRequest;
describe('private inquiry pricing state', () => {
 it.each(['FIXED','PER_HOUR','PER_DAY'] as const)('prevents repricing an old %s inquiry', sourcePriceType => {
  const decline=vi.fn(); const price=vi.fn();
  render(<IncomingInquiryCard request={{...base,sourcePriceType,sourcePrice:300}} timeLabel="Today" disabled={false} loadingAction={null} onDecline={decline} onSetPrice={price}/>);
  expect(screen.getByText('Listed price applies')).toBeVisible();
  expect(screen.queryByRole('button',{name:'Send Quote'})).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Decline request'})); expect(decline).toHaveBeenCalledOnce(); expect(price).not.toHaveBeenCalled();
 });
 it('retains price negotiation for Quote required',()=>{
  const price=vi.fn();
  render(<IncomingInquiryCard request={{...base,sourcePriceType:'BY_AGREEMENT'}} timeLabel="Today" disabled={false} loadingAction={null} onDecline={vi.fn()} onSetPrice={price}/>);
  fireEvent.click(screen.getByRole('button',{name:'Send Quote'})); expect(price).toHaveBeenCalledOnce();
 });
});
