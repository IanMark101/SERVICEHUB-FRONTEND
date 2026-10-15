import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../lib/api/axios';
import { apiInitiatePayment, apiConfirmOnlineBooking } from './bookings.api';

vi.mock('../lib/api/axios',()=>({api:{post:vi.fn()}}));

describe('GCash payment source transport',()=>{
  beforeEach(()=>{vi.clearAllMocks();vi.mocked(api.post).mockResolvedValue({data:{success:true}});});
  it.each([null,undefined,''])('omits a missing listing ID (%s) for a custom public-request offer, including a saved retry',async serviceId=>{
    const data={offerId:'cmgxxxxxxxxxxxxxxxxxxxxxx',serviceId,paymentMethodType:'gcash' as const,retryPaymentIntentId:'pi_previous'};
    await apiInitiatePayment(data as unknown as Parameters<typeof apiInitiatePayment>[0]);
    const [url,body]=vi.mocked(api.post).mock.calls[0];
    expect(url).toBe('/bookings/initiate-payment');
    expect(JSON.parse(JSON.stringify(body))).toEqual({offerId:data.offerId,paymentMethodType:'gcash',retryPaymentIntentId:'pi_previous'});
  });
  it('uses only the offer ID even if the offer links a service, leaving source authority on the server',async()=>{
    await apiInitiatePayment({offerId:'offer-id',serviceId:'listing-id',paymentMethodType:'gcash'});
    expect(vi.mocked(api.post).mock.calls[0][1]).toEqual({offerId:'offer-id',paymentMethodType:'gcash'});
  });
  it('keeps direct listing quantity, arrangement and private job point intact',async()=>{
    const data={serviceId:'listing-id',quantity:3,serviceLocationMode:'PROVIDER_VISITS' as const,jobLocation:{latitude:10.3,longitude:123.9,label:'Cordova'},paymentMethodType:'gcash' as const};
    await apiInitiatePayment(data);expect(api.post).toHaveBeenCalledWith('/bookings/initiate-payment',data);
  });
  it('confirms a legacy saved custom-offer checkout without forwarding its null listing ID',async()=>{
    await apiConfirmOnlineBooking({offerId:'offer-id',serviceId:null,paymentIntentId:'pi_paid'} as unknown as Parameters<typeof apiConfirmOnlineBooking>[0]);
    expect(api.post).toHaveBeenCalledWith('/bookings/confirm-online',{offerId:'offer-id',paymentIntentId:'pi_paid'});
  });
});
